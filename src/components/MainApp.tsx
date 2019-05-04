import React, { createRef } from 'react';
import uuid from 'uuid';
import AccountSelector from './AccountSelector';
import ItemStore from '../stores/ItemStore';
import ItemComparisonResult from '../services/ItemComparisonResult';
import Papa from 'papaparse';
import saveAs from 'file-saver';
import PerkRater from './PerkRater';
import DestinyAccount from '../model/DestinyAccount';
import { ActionType, Dispatcher } from '../actions/Actions';
import { MainAppState } from '../model/State';
import AppStore from '../stores/AppStore';
import FilteredItemsTable from './FilteredItemsTable';
import DestinyItemContainer from '../model/DestinyItemContainer';

class MainApp extends React.Component<{}, MainAppState> {
    private junkSearchTextArea = createRef<HTMLTextAreaElement>();
    private infuseSearchTextArea = createRef<HTMLTextAreaElement>();

    constructor(props) {
        super(props);
        this.state = AppStore.getState();
        this.showAllItems = this.showAllItems.bind(this);
        this.showBadItems = this.showBadItems.bind(this);
        this.showWeapons = this.showWeapons.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.exportCsv = this.exportCsv.bind(this);
        this.generateIdSearchString = this.generateIdSearchString.bind(this);
        this.closeSearch = this.closeSearch.bind(this);
        this.copySearch = this.copySearch.bind(this);
        this.applyPerkRatings = this.applyPerkRatings.bind(this);
        this.configurePerkRatings = this.configurePerkRatings.bind(this);
    }

    async componentDidMount() {
        let accessToken = localStorage.getItem("access_token");
        let accessTokenExpiry = +localStorage.getItem("expires_in");
        let membershipId = localStorage.getItem("membership_id");
        let refreshTokenExpiry = +localStorage.getItem("refresh_expires_in");
        let refreshToken = localStorage.getItem("refresh_token");

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
                                        value="Generate DIM Search Query" onClick={this.generateIdSearchString} />
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
                                <FilteredItemsTable selectedAccount={this.state.accounts.selectedAccount} />
                            </div>
                            <div className={this.state.showBadItems ? "" : "hidden"}>
                                <FilteredItemsTable selectedAccount={this.state.accounts.selectedAccount} itemFilter="bad" />
                            </div>
                            <div className={this.state.showWeapons ? "" : "hidden"}>
                                <FilteredItemsTable selectedAccount={this.state.accounts.selectedAccount} itemFilter="weapons" />
                            </div>
                        </div>
                    )}
                    {this.state.showSearch && (
                        <div className="popup-tint">
                            <div className="popup">
                                <div className="popup-flex">
                                    <div className="copy-panel">
                                        <p>Junk items:</p>
                                        <textarea ref={this.junkSearchTextArea} value={this.state.junkSearchString} />
                                        <div className="popup-button-container">
                                            <input className="popup-button" type="button" value="Copy" onClick={() => this.copySearch("junk")} />
                                        </div>
                                    </div>
                                    <div className="copy-panel">
                                        <p>Infusion items:</p>
                                        <textarea ref={this.infuseSearchTextArea} value={this.state.infuseSearchString} />
                                        <div className="popup-button-container">
                                            <input className="popup-button" type="button" value="Copy" onClick={() => this.copySearch("infuse")} />
                                        </div>
                                    </div>
                                </div>
                                {this.state.copyResult}
                                <div className="popup-button-container">
                                    <input className="popup-button" type="button" value="Close" onClick={this.closeSearch} />
                                </div>
                            </div>
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

    sortItemsByPower(items: DestinyItemContainer[]) {
        let sortedItems = {
            hunter: {
                helmets: [] as DestinyItemContainer[],
                gauntlets: [] as DestinyItemContainer[],
                chest_armour: [] as DestinyItemContainer[],
                leg_armour: [] as DestinyItemContainer[],
                class_items: [] as DestinyItemContainer[]
            },
            warlock: {
                helmets: [] as DestinyItemContainer[],
                gauntlets: [] as DestinyItemContainer[],
                chest_armour: [] as DestinyItemContainer[],
                leg_armour: [] as DestinyItemContainer[],
                class_items: [] as DestinyItemContainer[]
            },
            titan: {
                helmets: [] as DestinyItemContainer[],
                gauntlets: [] as DestinyItemContainer[],
                chest_armour: [] as DestinyItemContainer[],
                leg_armour: [] as DestinyItemContainer[],
                class_items: [] as DestinyItemContainer[]
            }
        }

        items.forEach(item => {
            if (item.definition.class === "Hunter") {
                if (item.definition.itemType === "Helmet") {
                    sortedItems.hunter.helmets =
                        sortedItems.hunter.helmets.concat(item)
                } else if (item.definition.itemType === "Gauntlets") {
                    sortedItems.hunter.gauntlets =
                        sortedItems.hunter.gauntlets.concat(item)
                } else if (item.definition.itemType === "Chest Armor") {
                    sortedItems.hunter.chest_armour =
                        sortedItems.hunter.chest_armour.concat(item)
                } else if (item.definition.itemType === "Leg Armor") {
                    sortedItems.hunter.leg_armour =
                        sortedItems.hunter.leg_armour.concat(item)
                } else if (item.definition.itemType === "Hunter Cloak") {
                    sortedItems.hunter.class_items =
                        sortedItems.hunter.class_items.concat(item)
                }
            } else if (item.definition.class === "Warlock") {
                if (item.definition.itemType === "Helmet") {
                    sortedItems.warlock.helmets =
                        sortedItems.warlock.helmets.concat(item)
                } else if (item.definition.itemType === "Gauntlets") {
                    sortedItems.warlock.gauntlets =
                        sortedItems.warlock.gauntlets.concat(item)
                } else if (item.definition.itemType === "Chest Armor") {
                    sortedItems.warlock.chest_armour =
                        sortedItems.warlock.chest_armour.concat(item)
                } else if (item.definition.itemType === "Leg Armor") {
                    sortedItems.warlock.leg_armour =
                        sortedItems.warlock.leg_armour.concat(item)
                } else if (item.definition.itemType === "Warlock Bond") {
                    sortedItems.warlock.class_items =
                        sortedItems.warlock.class_items.concat(item)
                }
            } else if (item.definition.class === "Titan") {
                if (item.definition.itemType === "Helmet") {
                    sortedItems.titan.helmets =
                        sortedItems.titan.helmets.concat(item)
                } else if (item.definition.itemType === "Gauntlets") {
                    sortedItems.titan.gauntlets =
                        sortedItems.titan.gauntlets.concat(item)
                } else if (item.definition.itemType === "Chest Armor") {
                    sortedItems.titan.chest_armour =
                        sortedItems.titan.chest_armour.concat(item)
                } else if (item.definition.itemType === "Leg Armor") {
                    sortedItems.titan.leg_armour =
                        sortedItems.titan.leg_armour.concat(item)
                } else if (item.definition.itemType === "Titan Mark") {
                    sortedItems.titan.class_items =
                        sortedItems.titan.class_items.concat(item)
                }
            }
        });

        for (var classType in sortedItems) {
            sortedItems[classType].helmets.sort((a, b) => b.power - a.power);
            sortedItems[classType].gauntlets.sort((a, b) => b.power - a.power);
            sortedItems[classType].chest_armour.sort((a, b) => b.power - a.power);
            sortedItems[classType].leg_armour.sort((a, b) => b.power - a.power);
            sortedItems[classType].class_items.sort((a, b) => b.power - a.power);
        }

        return sortedItems;
    }

    getMaxPowerByItemType(items: DestinyItemContainer[]) {
        let maxPowers = {
            hunter: {
                helmets: 0,
                gauntlets: 0,
                chest_armour: 0,
                leg_armour: 0,
                class_items: 0
            },
            warlock: {
                helmets: 0,
                gauntlets: 0,
                chest_armour: 0,
                leg_armour: 0,
                class_items: 0
            },
            titan: {
                helmets: 0,
                gauntlets: 0,
                chest_armour: 0,
                leg_armour: 0,
                class_items: 0
            }
        }

        items.forEach(item => {
            if (item.definition.class === "Hunter") {
                if (item.definition.itemType === "Helmet") {
                    if (item.item.power > maxPowers.hunter.helmets) {
                        maxPowers.hunter.helmets = item.item.power;
                    }
                } else if (item.definition.itemType === "Gauntlets") {
                    if (item.item.power > maxPowers.hunter.gauntlets) {
                        maxPowers.hunter.gauntlets = item.item.power;
                    }
                } else if (item.definition.itemType === "Chest Armor") {
                    if (item.item.power > maxPowers.hunter.chest_armour) {
                        maxPowers.hunter.chest_armour = item.item.power;
                    }
                } else if (item.definition.itemType === "Leg Armor") {
                    if (item.item.power > maxPowers.hunter.leg_armour) {
                        maxPowers.hunter.leg_armour = item.item.power;
                    }
                } else if (item.definition.itemType === "Hunter Cloak") {
                    if (item.item.power > maxPowers.hunter.class_items) {
                        maxPowers.hunter.class_items = item.item.power;
                    }
                }
            } else if (item.definition.class === "Warlock") {
                if (item.definition.itemType === "Helmet") {
                    if (item.item.power > maxPowers.warlock.helmets) {
                        maxPowers.warlock.helmets = item.item.power;
                    }
                } else if (item.definition.itemType === "Gauntlets") {
                    if (item.item.power > maxPowers.warlock.gauntlets) {
                        maxPowers.warlock.gauntlets = item.item.power;
                    }
                } else if (item.definition.itemType === "Chest Armor") {
                    if (item.item.power > maxPowers.warlock.chest_armour) {
                        maxPowers.warlock.chest_armour = item.item.power;
                    }
                } else if (item.definition.itemType === "Leg Armor") {
                    if (item.item.power > maxPowers.warlock.leg_armour) {
                        maxPowers.warlock.leg_armour = item.item.power;
                    }
                } else if (item.definition.itemType === "Warlock Bond") {
                    if (item.item.power > maxPowers.warlock.class_items) {
                        maxPowers.warlock.class_items = item.item.power;
                    }
                }
            } else if (item.definition.class === "Titan") {
                if (item.definition.itemType === "Helmet") {
                    if (item.item.power > maxPowers.titan.helmets) {
                        maxPowers.titan.helmets = item.item.power;
                    }
                } else if (item.definition.itemType === "Gauntlets") {
                    if (item.item.power > maxPowers.titan.gauntlets) {
                        maxPowers.titan.gauntlets = item.item.power;
                    }
                } else if (item.definition.itemType === "Chest Armor") {
                    if (item.item.power > maxPowers.titan.chest_armour) {
                        maxPowers.titan.chest_armour = item.item.power;
                    }
                } else if (item.definition.itemType === "Leg Armor") {
                    if (item.item.power > maxPowers.titan.leg_armour) {
                        maxPowers.titan.leg_armour = item.item.power;
                    }
                } else if (item.definition.itemType === "Titan Mark") {
                    if (item.item.power > maxPowers.titan.class_items) {
                        maxPowers.titan.class_items = item.item.power;
                    }
                }
            }
        });

        return maxPowers;
    }

    generateIdSearchString() {
        let { items, itemDefinitions } = ItemStore.getState();
        let containers = items.map(item => {
            let itemDef = itemDefinitions.get(item.itemHash);
            return itemDef && {
                item: item,
                definition: itemDef
            };
        }).filter(item => item);

        let maxInfuseCount = 4;
        let maxPowers = this.getMaxPowerByItemType(containers);
        let badItems = containers.filter(item => {
            let isBetter = false;
            for (let i = 0; i < item.item.comparisons.length; i++) {
                const comparison = item.item.comparisons[i];
                if (comparison && comparison.result === ItemComparisonResult.ITEM_IS_BETTER) {
                    isBetter = true;
                    break;
                }
            }
            return isBetter;
        });

        let junkItems: DestinyItemContainer[] = [];
        let infusionItems: DestinyItemContainer[] = [];
        let sortedItems = this.sortItemsByPower(badItems);
        for (var classType in sortedItems) {
            for (var itemType in sortedItems[classType]) {
                let maxPower = maxPowers[classType][itemType];
                let infuseCount = 0;
                let slotItems: DestinyItemContainer[] = sortedItems[classType][itemType];
                for (var i = 0; i < slotItems.length; i++) {
                    var item = slotItems[i];
                    if (item.item.power === maxPower || infuseCount < maxInfuseCount) {
                        infusionItems.push(item);
                        infuseCount += 1;
                    } else {
                        junkItems.push(item);
                    }
                }
            }
        }

        this.applyStateChange({
            junkSearchString: junkItems.map(item => `id:${item.item.id}`).join(" or "),
            infuseSearchString: infusionItems.map(item => `id:${item.item.id}`).join(" or "),
            copyResult: "",
            showSearch: true
        });
    }

    copySearch(textArea) {
        if (textArea === "junk") {
            this.junkSearchTextArea.current.select();
            document.execCommand('copy');
            this.applyStateChange({
                copyResult: "Copied junk items"
            });
        } else if (textArea === "infuse") {
            this.infuseSearchTextArea.current.select();
            document.execCommand('copy');
            this.applyStateChange({
                copyResult: "Copied infusion items"
            });
        }
    }

    closeSearch() {
        this.applyStateChange({
            showSearch: false
        });
    }

    exportCsv() {
        let { items, itemDefinitions } = ItemStore.getState();
        let containers = items.map(item => {
            let itemDef = itemDefinitions.get(item.itemHash);
            return itemDef && {
                item: item,
                definition: itemDef
            };
        }).filter(item => item);

        let maxInfuseCount = 4;
        let maxPowers = this.getMaxPowerByItemType(containers);
        let badItems = containers.filter(item => {
            let isBetter = false;
            if (item.item.comparisons) {
                for (let i = 0; i < item.item.comparisons.length; i++) {
                    const comparison = item.item.comparisons[i];
                    if (comparison && comparison.result === ItemComparisonResult.ITEM_IS_BETTER) {
                        isBetter = true;
                        break;
                    }
                }
            }
            return isBetter;
        });

        let taggedItems = [];
        let sortedItems = this.sortItemsByPower(badItems);
        for (var classType in sortedItems) {
            for (var itemType in sortedItems[classType]) {
                let maxPower: number = maxPowers[classType][itemType];
                let infuseCount = 0;
                let slotItems: DestinyItemContainer[] = sortedItems[classType][itemType];
                for (var i = 0; i < slotItems.length; i++) {
                    var item = slotItems[i];
                    let tag = "junk";
                    if (item.item.power === maxPower || infuseCount < maxInfuseCount) {
                        tag = "infuse";
                        infuseCount += 1;
                    }
                    taggedItems.push({
                        "Id": `${JSON.stringify(item.item.id)}`,
                        "Notes": "",
                        "Tag": tag,
                        "Hash": item.item.itemHash
                    });
                }
            }
        }

        var csv = Papa.unparse(taggedItems);
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