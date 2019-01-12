import React from 'react';

class AccountSelector extends React.Component {
    render() {
        let accounts = this.props.accounts.map(account => {
            let platform;
            if (account.membershipType === 1) {
                platform = "Xbox";
            } else if (account.membershipType === 2) {
                platform = "PS";
            } else if (account.membershipType === 4) {
                platform = "PC";
            } else {
                Platform = "?";
            }
            return (<div key={account.membershipId}
                className="tab-link" onClick={(e) => this.props.onClick(e, account)}>
                [{platform}] {account.displayName}
            </div>);
        });
        let selectedAccount = "No Account Selected";
        if (this.props.selectedAccount) {
            let platform;
            if (this.props.selectedAccount.membershipType === 1) {
                platform = "Xbox";
            } else if (this.props.selectedAccount.membershipType === 2) {
                platform = "PS";
            } else if (this.props.selectedAccount.membershipType === 4) {
                platform = "PC";
            } else {
                Platform = "?";
            }
            selectedAccount = `[${platform}] ${this.props.selectedAccount.displayName}`;
        }
        return (
            <div className="tab-link account-selector">
                {selectedAccount}
                <div className="account-selector-content">
                    <ul className="account-list">
                        {accounts}
                    </ul>
                </div>
            </div>
        );
    }
}

export default AccountSelector;