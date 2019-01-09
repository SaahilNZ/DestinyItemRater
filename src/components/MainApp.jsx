import React from 'react';
import ItemsTable from './ItemsTable.jsx';
import uuid from 'uuid';
import {stringify} from 'querystring';

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signedIn: false,
            showAllItems: true,
            showBadItems: false
        }
        this.showAllItems = this.showAllItems.bind(this);
        this.showBadItems = this.showBadItems.bind(this);
    }

    async componentDidMount() {
        let accessToken = localStorage.getItem("access_token");
        let accessTokenExpiry = localStorage.getItem("expires_in");
        let membershipId = localStorage.getItem("membership_id");
        let refreshTokenExpiry = localStorage.getItem("refresh_expires_in");
        let refreshToken = localStorage.getItem("refresh_token");

        if (accessToken) {
            let date = new Date();
            if (accessTokenExpiry && date.getTime() < accessTokenExpiry) {
                this.setState({
                    signedIn: true
                });
            }
        } else {
            if (refreshToken) {
                if (refreshTokenExpiry && date.getTime() < refreshTokenExpiry) {
                    if (await refreshAccessToken(refreshToken)) {
                        this.setState({
                            signedIn: true
                        });
                    }
                }
            }
        }
    }

    async refreshAccessToken(refreshToken) {
        console.log("refresh");
        const TOKEN_URL = "https://www.bungie.net/platform/app/oauth/token/";
        let token = await fetch(TOKEN_URL, {
            method: "POST",
            body: stringify({
                grant_type: "refresh_token",
                refresh_token: refreshToken
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return null;
            }
        });
        if (token) {
            let date = new Date();
            let accessTokenExpiry = date.getTime() + (token.expires_in * 1000);
            localStorage.setItem("access_token", JSON.stringify(token.access_token));
            localStorage.setItem("expires_in", JSON.stringify(accessTokenExpiry));
            return true;
        } else {
            return false;
        }
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
                    <div className="tab">
                        <input className={"tab-link " + (this.state.showAllItems ? "tab-link-active" : "")}
                            type="button" value="All Items" onClick={this.showAllItems} />
                        <input className={"tab-link " + (this.state.showBadItems ? "tab-link-active" : "")}
                            type="button" value="Bad Items" onClick={this.showBadItems} />
                    </div>
                    <div className={this.state.showAllItems ? "" : "hidden"}>
                        <ItemsTable />
                    </div>
                    <div className={this.state.showBadItems ? "" : "hidden"}>
                        <ItemsTable itemFilter="bad" />
                    </div>
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

    logIn() {
        let state = uuid.v4();
        localStorage.setItem("state", state);
        let authUrl = `https://www.bungie.net/en/oauth/authorize?client_ID=${process.env.BUNGIE_CLIENT_ID}&response_type=code&state=${state}`;
        window.location.href = authUrl;
    }
}

export default MainApp;