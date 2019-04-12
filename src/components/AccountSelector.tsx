import React from 'react';
import DestinyAccount from '../model/DestinyAccount';
import Account from './Account';

export interface AccountSelectorProps {
    accounts: DestinyAccount[];
    selectedAccountId: string;
    onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>, account: DestinyAccount): any;
}

class AccountSelector extends React.Component<AccountSelectorProps, {}> {
    render() {
        let accounts = this.props.accounts.map(account => {
            return <Account account={account} onClick={this.props.onClick} />;
        });
        let selectedAccountString = "No Account Selected";
        let selectedAccount = this.props.selectedAccountId && 
            this.props.accounts.find(account => 
                account.membershipId === this.props.selectedAccountId);
        if (selectedAccount) {
            let platform = selectedAccount.getPlatformName(selectedAccount.membershipType);
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
}

export default AccountSelector;