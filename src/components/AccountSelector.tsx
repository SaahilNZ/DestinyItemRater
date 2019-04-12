import React from 'react';
import DestinyAccount from '../model/DestinyAccount';

export interface AccountSelectorProps {
    accounts: DestinyAccount[];
    selectedAccount: DestinyAccount;
    onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>, account: DestinyAccount): any;
}

class AccountSelector extends React.Component<AccountSelectorProps, {}> {
    render() {
        let accounts = this.props.accounts.map(account => {
            let platform = this.getPlatformString(account.membershipType);
            return (<div key={account.membershipId}
                className="tab-link" onClick={(e) => this.props.onClick(e, account)}>
                [{platform}] {account.displayName}
            </div>);
        });
        let selectedAccount = "No Account Selected";
        if (this.props.selectedAccount) {
            let platform = this.getPlatformString(this.props.selectedAccount.membershipType);
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

    getPlatformString(platformId: number) : string {
        let platform: string;
        if (platformId === 1) {
            platform = "Xbox";
        } else if (platformId === 2) {
            platform = "PS";
        } else if (platformId === 4) {
            platform = "PC";
        } else {
            platform = "?";
        }
        return platform;
    }
}

export default AccountSelector;