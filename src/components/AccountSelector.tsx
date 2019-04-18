import React from 'react';
import DestinyAccount from '../model/DestinyAccount';
import Account from './Account';
import { selectAccount } from '../actions/AccountActions';
import { Action } from '../actions/Actions';
import ItemActions from '../actions/ItemActions';

export interface AccountSelectorProps {
    accounts: DestinyAccount[];
    selectedAccountId: string;
    dispatch(action: Action): void;
}

class AccountSelector extends React.Component<AccountSelectorProps, {}> {
    render() {
        let accounts = this.props.accounts.map(account => {
            return <Account account={account}
                onClick={() => this.onAccountSelected(account)} />;
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

    onAccountSelected(account: DestinyAccount) {
        this.props.dispatch(selectAccount(account.membershipId));

        localStorage.setItem("selected_profile", JSON.stringify(account));
        ItemActions.fetchItems();
    }
}

export default AccountSelector;