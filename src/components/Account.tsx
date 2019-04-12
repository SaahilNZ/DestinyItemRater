import React from 'react';
import DestinyAccount from '../model/DestinyAccount';

interface AccountProps {
    account: DestinyAccount;
    onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>, account: DestinyAccount): any;
}

class Account extends React.Component<AccountProps, {}> {
    render() {
        let platform = this.props.account.getPlatformName(this.props.account.membershipType);
        return (
            <div key={this.props.account.membershipId}
                className="tab-link" onClick={(e) => this.props.onClick(e, this.props.account)}>
                [{platform}] {this.props.account.displayName}
            </div>
        );
    }
}

export default Account;