import React from 'react';
import ItemsTable from './ItemsTable.jsx';
import uuid from 'uuid';
import {stringify} from 'querystring';
import AccountSelector from './AccountSelector.jsx';
import ItemStore from '../stores/ItemStore.js';
import ItemActions from '../actions/ItemActions.js';
import ItemComparisonResult from '../services/ItemComparisonResult';
import Papa from 'papaparse';
import saveAs from 'file-saver';

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signedIn: false,
            selectedAccount: null,
            accounts: [],
            showAllItems: true,
            showBadItems: false,
            showSearch: false,
            junkSearchString: "",
            infuseSearchString: "",
            copyResult: ""
        }
        this.showAllItems = this.showAllItems.bind(this);
        this.showBadItems = this.showBadItems.bind(this);
        this.selectAccount = this.selectAccount.bind(this);
        this.exportCsv = this.exportCsv.bind(this);
        this.generateIdSearchString = this.generateIdSearchString.bind(this);
        this.closeSearch = this.closeSearch.bind(this);
        this.copySearch = this.copySearch.bind(this);
    }

    async componentDidMount() {
        let accessToken = localStorage.getItem("access_token");
        let accessTokenExpiry = localStorage.getItem("expires_in");
        let membershipId = localStorage.getItem("membership_id");
        let refreshTokenExpiry = localStorage.getItem("refresh_expires_in");
        let refreshToken = localStorage.getItem("refresh_token");
        
        localStorage.removeItem("profile_id");

        if (accessToken) {
            let date = new Date();
            if (accessTokenExpiry && date.getTime() < accessTokenExpiry) {
                this.setState({
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
                    response.Response.destinyMemberships.map(account => {
                        this.setState({
                            accounts: this.state.accounts.concat({
                                membershipType: account.membershipType,
                                membershipId: account.membershipId,
                                displayName: account.displayName
                            })
                        });
                    });
                    
                    if (this.state.accounts.length > 0) {
                        this.setState({
                            selectedAccount: this.state.accounts[0]
                        });
                    }
                })
                .catch(error => console.log(error));
        }
    }

    clearLocalStorage() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("expires_in");
        localStorage.removeItem("membership_id");
        localStorage.removeItem("selected_profile");
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
                this.setState({
                    signedIn: true
                });
            })
            .catch(error => console.log(error));
    }

    showAllItems() {
        this.setState({
            showAllItems: true,
            showBadItems: false
        });
    }

    showBadItems() {
        this.setState({
            showAllItems: false,
            showBadItems: true
        });
    }

    render() {
        if (this.state.signedIn) {
            return (
                <div>
                    <div className="header">
                        <div className="tab">
                            <input className={"tab-link float-left " + (this.state.showAllItems ? "tab-link-active" : "")}
                                type="button" value="All Items" onClick={this.showAllItems} />
                            <input className={"tab-link float-left " + (this.state.showBadItems ? "tab-link-active" : "")}
                                type="button" value="Bad Items" onClick={this.showBadItems} />
                            {this.state.selectedAccount &&
                            <div>
                                <div className="header-separator float-left"></div>
                                <input className="tab-link float-left" type="button"
                                    value="Generate DIM Search Query" onClick={this.generateIdSearchString} />
                                <input className="tab-link float-left" type="button"
                                    value="Export CSV" onClick={this.exportCsv} />
                            </div>}
                            <div className="header-account float-right">
                                <div className="header-separator"></div>
                                <AccountSelector selectedAccount={this.state.selectedAccount}
                                    accounts={this.state.accounts} onClick={this.selectAccount} />
                                <div className="header-separator"></div>
                                <input className="tab-link"
                                    type="button" value="Log Out" onClick={this.logOut} />
                            </div>
                        </div>
                    </div>
                    {this.state.selectedAccount && (
                        <div>
                            <div className={this.state.showAllItems ? "" : "hidden"}>
                                <ItemsTable />
                            </div>
                            <div className={this.state.showBadItems ? "" : "hidden"}>
                                <ItemsTable itemFilter="bad" />
                            </div>
                        </div>
                    )}
                    {this.state.showSearch && (
                        <div className="popup-tint">
                            <div className="popup">
                                <div className="popup-flex">
                                    <div className="copy-panel">
                                        <p>Junk items:</p>
                                        <textarea ref={(textarea) => this.junkSearchTextArea = textarea} value={this.state.junkSearchString} />
                                        <div className="popup-button-container">
                                            <input className="popup-button" type="button" value="Copy" onClick={() => this.copySearch("junk")} />
                                        </div>
                                    </div>
                                    <div className="copy-panel">
                                        <p>Infusion items:</p>
                                        <textarea ref={(textarea) => this.infuseSearchTextArea = textarea} value={this.state.infuseSearchString} />
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

    sortItemsByPower(items) {
        let sortedItems = {
            hunter: {
                helmets: [],
                gauntlets: [],
                chest_armour: [],
                leg_armour: [],
                class_items: []
            },
            warlock: {
                helmets: [],
                gauntlets: [],
                chest_armour: [],
                leg_armour: [],
                class_items: []
            },
            titan: {
                helmets: [],
                gauntlets: [],
                chest_armour: [],
                leg_armour: [],
                class_items: []
            }
        }

        items.forEach(item => {
            if (item.class === "Hunter") {
                if (item.type === "Helmet") {
                    sortedItems.hunter.helmets = 
                        sortedItems.hunter.helmets.concat(item)
                } else if (item.type === "Gauntlets") {
                    sortedItems.hunter.gauntlets = 
                        sortedItems.hunter.gauntlets.concat(item)
                } else if (item.type === "Chest Armor") {
                    sortedItems.hunter.chest_armour = 
                        sortedItems.hunter.chest_armour.concat(item)
                } else if (item.type === "Leg Armor") {
                    sortedItems.hunter.leg_armour = 
                        sortedItems.hunter.leg_armour.concat(item)
                } else if (item.type === "Hunter Cloak") {
                    sortedItems.hunter.class_items = 
                        sortedItems.hunter.class_items.concat(item)
                }
            } else if (item.class === "Warlock") {
                if (item.type === "Helmet") {
                    sortedItems.warlock.helmets = 
                        sortedItems.warlock.helmets.concat(item)
                } else if (item.type === "Gauntlets") {
                    sortedItems.warlock.gauntlets = 
                        sortedItems.warlock.gauntlets.concat(item)
                } else if (item.type === "Chest Armor") {
                    sortedItems.warlock.chest_armour = 
                        sortedItems.warlock.chest_armour.concat(item)
                } else if (item.type === "Leg Armor") {
                    sortedItems.warlock.leg_armour = 
                        sortedItems.warlock.leg_armour.concat(item)
                } else if (item.type === "Warlock Bond") {
                    sortedItems.warlock.class_items = 
                        sortedItems.warlock.class_items.concat(item)
                }
            } else if (item.class === "Titan") {
                if (item.type === "Helmet") {
                    sortedItems.titan.helmets = 
                        sortedItems.titan.helmets.concat(item)
                } else if (item.type === "Gauntlets") {
                    sortedItems.titan.gauntlets = 
                        sortedItems.titan.gauntlets.concat(item)
                } else if (item.type === "Chest Armor") {
                    sortedItems.titan.chest_armour = 
                        sortedItems.titan.chest_armour.concat(item)
                } else if (item.type === "Leg Armor") {
                    sortedItems.titan.leg_armour = 
                        sortedItems.titan.leg_armour.concat(item)
                } else if (item.type === "Titan Mark") {
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

    generateIdSearchString() {
        let items = ItemStore.getState().items;
        let maxInfuseCount = 4;
        let maxPower = 650;
        let badItems = items.filter(item => {
            let isBetter = false;
            if (item.comparisons) {
                for (let i = 0; i < item.comparisons.length; i++) {
                    const comparison = item.comparisons[i];
                    if (comparison && comparison.result === ItemComparisonResult.ITEM_IS_BETTER) {
                        isBetter = true;
                        break;
                    }
                }
            }
            return isBetter;
        });

        let junkItems = [];
        let infusionItems = [];
        let sortedItems = this.sortItemsByPower(badItems);
        for (var classType in sortedItems) {
            for (var itemType in sortedItems[classType]) {
                let infuseCount = 0;
                for (var i = 0; i < sortedItems[classType][itemType].length; i++) {
                    var item = sortedItems[classType][itemType][i];
                    if (item.power === maxPower || infuseCount < maxInfuseCount) {
                        infusionItems.push(item);
                        infuseCount += 1;
                    } else {
                        junkItems.push(item);
                    }
                }
            }
        }
        
        this.setState({
            junkSearchString: junkItems.map(item => `id:${item.id}`).join(" or "),
            infuseSearchString: infusionItems.map(item => `id:${item.id}`).join(" or "),
            copyResult: "",
            showSearch: true
        });
    }

    copySearch(textArea) {
        if (textArea === "junk") {
            this.junkSearchTextArea.select();
            document.execCommand('copy');
            this.setState({
                copyResult: "Copied junk items"
            });
        } else if (textArea === "infuse") {
            this.infuseSearchTextArea.select();
            document.execCommand('copy');
            this.setState({
                copyResult: "Copied infusion items"
            });
        }
    }

    closeSearch() {
        this.setState({
            showSearch: false
        });
    }

    exportCsv() {
        let items = ItemStore.getState().items;
        let maxInfuseCount = 4;
        let maxPower = 650;
        let badItems = items.filter(item => {
            let isBetter = false;
            if (item.comparisons) {
                for (let i = 0; i < item.comparisons.length; i++) {
                    const comparison = item.comparisons[i];
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
                let infuseCount = 0;
                for (var i = 0; i < sortedItems[classType][itemType].length; i++) {
                    var item = sortedItems[classType][itemType][i];
                    let tag = "junk";
                    if (item.power === maxPower || infuseCount < maxInfuseCount) {
                        tag = "infuse";
                        infuseCount += 1;
                    }
                    taggedItems.push({
                        "Id": `${JSON.stringify(item.id)}`,
                        "Notes": "",
                        "Tag": tag,
                        "Hash": item.itemHash
                    });
                }
            }
        }

        var csv = Papa.unparse(taggedItems);
        var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
        saveAs(blob, "junk-items.csv");
    }

    selectAccount(e, account) {
        this.setState({
            selectedAccount: account
        });
        
        localStorage.setItem("selected_profile", JSON.stringify(account));
        ItemActions.fetchItems();
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
}

export default MainApp;