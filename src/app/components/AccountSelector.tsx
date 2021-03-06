import React from 'react';
import DestinyAccount from '../model/DestinyAccount';
import Account from './Account';
import { selectAccount } from '../actions/AccountActions';
import { Dispatcher } from '../actions/Actions';
import ItemActions_Alt from '../actions/ItemActions_Alt';

export interface AccountSelectorProps {
    accounts: DestinyAccount[];
    selectedAccountId: string;
    dispatch(action: Dispatcher): void;
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
        ItemActions_Alt.fetchItems(account);
    }
}

export default AccountSelector;