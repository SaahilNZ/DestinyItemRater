import React from 'react';
import ItemsTable from './ItemsTable.jsx';
import uuid from 'uuid';
import {stringify} from 'querystring';
import AccountSelector from './AccountSelector.jsx';
import ItemActions from '../actions/ItemActions.js';

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signedIn: false,
            selectedAccount: null,
            accounts: [],
            showAllItems: true,
            showBadItems: false
        }
        this.showAllItems = this.showAllItems.bind(this);
        this.showBadItems = this.showBadItems.bind(this);
        this.selectAccount = this.selectAccount.bind(this);
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
                        console.log("accounts exist");
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
                        </div>)
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