import React from 'react';
import DestinyAccount from '../model/DestinyAccount';

export interface AccountSelectorProps {
    accounts: DestinyAccount[];
    selectedAccountId: string;
    onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>, account: DestinyAccount): any;
}

class AccountSelector extends React.Component<AccountSelectorProps, {}> {
    render() {
        let accounts = this.props.accounts.map(account => {
            let platform = this.getPlatformName(account.membershipType);
            return (<div key={account.membershipId}
                className="tab-link" onClick={(e) => this.props.onClick(e, account)}>
                [{platform}] {account.displayName}
            </div>);
        });
        let selectedAccountString = "No Account Selected";
        let selectedAccount = this.props.selectedAccountId && 
            this.props.accounts.find(account => 
                account.membershipId === this.props.selectedAccountId);
        if (selectedAccount) {
            let platform = this.getPlatformName(selectedAccount.membershipType);
            selectedAccountString = `[${platform}] ${selectedAccount.displayName}`;
        }
        return (
            <div className="tab-link account-selector">
                {selectedAccountString}
                <div className="account-selector-content">
                    <ul className="account-list">
                        {accounts}
                    </ul>
                </div>
            </div>
        );
    }

    getPlatformName(platformId: number) : string {
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