import React from 'react';
import uuid from 'uuid';
import AccountSelector from './AccountSelector';
import ItemStore from '../stores/ItemStore';
import Papa from 'papaparse';
import saveAs from 'file-saver';
import PerkRater from './PerkRater';
import DestinyAccount from '../model/DestinyAccount';
import { ActionType, Dispatcher } from '../actions/Actions';
import { MainAppState } from '../model/State';
import AppStore from '../stores/AppStore';
import FilteredItemsTable from './FilteredItemsTable';
import { buildItemContainer } from '../model/DestinyItemContainer';
import IdSearchStringPopup from './IdSearchStringPopup';
import ItemDefinitionActions from '../actions/ItemDefinitionActions';
import PerkActions from '../actions/PerkActions';
import ItemActions_Alt from '../actions/ItemActions_Alt';
import TaggingService, { ItemTag } from '../services/TaggingService';

class MainApp extends React.Component<{}, MainAppState> {
    constructor(props) {
        super(props);
        this.state = AppStore.getState();
        this.showAllItems = this.showAllItems.bind(this);
        this.showBadItems = this.showBadItems.bind(this);
        this.showWeapons = this.showWeapons.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.exportCsv = this.exportCsv.bind(this);
        this.showSearch = this.showSearch.bind(this);
        this.closeSearch = this.closeSearch.bind(this);
        this.applyPerkRatings = this.applyPerkRatings.bind(this);
        this.configurePerkRatings = this.configurePerkRatings.bind(this);
    }

    async componentDidMount() {
        let accessToken = localStorage.getItem("access_token");
        let accessTokenExpiry = +localStorage.getItem("expires_in");
        let membershipId = localStorage.getItem("membership_id");
        let refreshTokenExpiry = +localStorage.getItem("refresh_expires_in");
        let refreshToken = localStorage.getItem("refresh_token");

        ItemDefinitionActions.fetchItemDefinitions();
        PerkActions.fetchPerks();

        if (accessToken) {
            let date = new Date();
            if (accessTokenExpiry && date.getTime() < accessTokenExpiry) {
                this.applyStateChange({
                    signedIn: true
                });
            } else {
                if (refreshToken) {
                    if (refreshTokenExpiry && date.getTime() < refreshTokenExpiry) {
                        await this.refreshAccessToken(refreshToken);
                    } else {
                        this.clearLocalStorage();
                    }
                } else {
                    this.clearLocalStorage();
                }
            }
        } else {
            this.clearLocalStorage();
        }

        if (membershipId) {
            fetch('/api/memberships', {
                headers: {
                    membership_id: membershipId
                }
            })
                .then(response => response.json())
                .then(response => {
                    let newState = {
                        accounts: {
                            allAccounts: response.Response.destinyMemberships.map(account =>
                                new DestinyAccount(
                                    account.membershipId,
                                    account.membershipType,
                                    account.displayName
                                )
                            ),
                            selectedAccount: null
                        }
                    }
                    if (newState.accounts.allAccounts.length > 0) {
                        newState.accounts.selectedAccount = newState.accounts.allAccounts[0];
                        ItemActions_Alt.fetchItems(newState.accounts.selectedAccount);
                    }
                    this.applyStateChange(newState);
                })
                .catch(error => console.log(error));
        }
    }

    clearLocalStorage() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("expires_in");
        localStorage.removeItem("membership_id");
        localStorage.removeItem("refresh_expires_in");
        localStorage.removeItem("refresh_token");
    }

    async refreshAccessToken(refreshToken) {
        let url = "/auth/bungie/refresh";
        fetch(url, {
            headers: {
                refresh_token: refreshToken
            }
        })
            .then(response => response.json())
            .then(json => {
                let date = new Date();
                let accessTokenExpiry = date.getTime() + (json.expires_in * 1000);
                localStorage.setItem("access_token", JSON.stringify(json.access_token));
                localStorage.setItem("expires_in", JSON.stringify(accessTokenExpiry));
                this.applyStateChange({
                    signedIn: true
                });
            })
            .catch(error => console.log(error));
    }

    showAllItems() {
        this.applyStateChange({
            showAllItems: true,
            showBadItems: false,
            showWeapons: false
        });
    }

    showBadItems() {
        this.applyStateChange({
            showAllItems: false,
            showBadItems: true,
            showWeapons: false
        });
    }

    showWeapons() {
        this.applyStateChange({
            showAllItems: false,
            showBadItems: false,
            showWeapons: true
        });
    }

    render() {
        if (this.state.signedIn) {
            return (
                <div>
                    <div className="header">
                        <div className="tab">
                            <input className={"tab-link float-left " + (this.state.showAllItems ? "tab-link-active" : "")}
                                type="button" value="All Armor" onClick={this.showAllItems} />
                            <input className={"tab-link float-left " + (this.state.showBadItems ? "tab-link-active" : "")}
                                type="button" value="Bad Armor" onClick={this.showBadItems} />
                            <div className="header-separator float-left"></div>
                            <input className={"tab-link float-left " + (this.state.showWeapons ? "tab-link-active" : "")}
                                type="button" value="All Weapons" onClick={this.showWeapons} />
                            {this.state.accounts.selectedAccount &&
                                <div>
                                    <div className="header-separator float-left"></div>
                                    <input className="tab-link float-left" type="button"
                                        value="Generate DIM Search Query" onClick={this.showSearch} />
                                    <input className="tab-link float-left" type="button"
                                        value="Export CSV" onClick={this.exportCsv} />
                                    <div className="header-separator float-left"></div>
                                    <input className="tab-link float-left" type="button"
                                        value="Configure Perk Ratings" onClick={this.configurePerkRatings} />
                                </div>}
                            <div className="header-account float-right">
                                <div className="header-separator"></div>
                                <AccountSelector
                                    selectedAccountId={this.state.accounts.selectedAccount
                                        && this.state.accounts.selectedAccount.membershipId}
                                    accounts={this.state.accounts.allAccounts} dispatch={this.dispatch} />
                                <div className="header-separator"></div>
                                <input className="tab-link"
                                    type="button" value="Log Out" onClick={this.logOut} />
                            </div>
                        </div>
                    </div>
                    {this.state.accounts.selectedAccount && !this.state.showPerkRater && (
                        <div>
                            <div className={this.state.showAllItems ? "" : "hidden"}>
                                <FilteredItemsTable />
                            </div>
                            <div className={this.state.showBadItems ? "" : "hidden"}>
                                <FilteredItemsTable itemFilter="bad" />
                            </div>
                            <div className={this.state.showWeapons ? "" : "hidden"}>
                                <FilteredItemsTable itemFilter="weapons" />
                            </div>
                        </div>
                    )}
                    {this.state.showSearch && (
                        <div className="popup-tint">
                            <IdSearchStringPopup closeSearch={this.closeSearch} />
                        </div>
                    )}
                    {this.state.showPerkRater &&
                        <PerkRater perkRatings={this.state.perkRatings}
                            applyCallback={this.applyPerkRatings} />
                    }
                </div>
            );
        } else {
            return (
                <div>
                    <input type="button" value="Log In" onClick={this.logIn} />
                </div>
            );
        }
    }

    showSearch() {
        this.applyStateChange({
            showSearch: true
        });
    }

    closeSearch() {
        this.applyStateChange({
            showSearch: false
        });
    }

    exportCsv() {
        let { items, itemDefinitions, perkRatings, comparisons, itemTags } = ItemStore.getState();
        let containers = items
            .map(item => buildItemContainer(item, itemDefinitions, comparisons, perkRatings, itemTags));
        
        let csvItems = [];
        containers.forEach(item => {
            let tag = "";
            switch (item.tag) {
                case ItemTag.INFUSE:
                    tag = "infuse";
                    break;
                case ItemTag.JUNK:
                    tag = "junk";
                    break;
                case ItemTag.KEEP:
                    tag = "keep";
                    break;
            }
            csvItems.push({
                "Id": `${JSON.stringify(item.item.id)}`,
                "Notes": "",
                "Tag": tag,
                "Hash": item.item.itemHash
            });
        });

        var csv = Papa.unparse(csvItems);
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, "junk-items.csv");
    }

    configurePerkRatings() {
        this.applyStateChange({
            perkRatings: ItemStore.getState().perkRatings,
            showPerkRater: true
        });
    }

    applyPerkRatings() {
        this.applyStateChange({
            showPerkRater: false
        });
    }

    dispatch(action: Dispatcher) {
        if (typeof action === "function") {
            action(this.dispatch);
        } else {
            let newState = AppStore.dispatch(action);

            switch (action.type) {
                case ActionType.SELECT_ACCOUNT:
                    this.setState({
                        accounts: newState.accounts
                    });
                    break;
            }
        }
    }

    logIn() {
        let state = uuid.v4();
        localStorage.setItem("state", state);
        let authUrl = `https://www.bungie.net/en/oauth/authorize?client_ID=${process.env.BUNGIE_CLIENT_ID}&response_type=code&state=${state}`;
        window.location.href = authUrl;
    }

    logOut() {
        localStorage.clear();
        window.location.href = "/";
    }

    // todo: remove this
    applyStateChange(newState) {
        AppStore.setState(newState);
        this.setState(newState);
    }
}

export default MainApp;