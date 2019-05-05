import React from 'react';
import DestinyPerkContainer from '../model/DestinyPerkContainer';

export interface PerkProps {
    perk: DestinyPerkContainer;
}

class Perk extends React.Component<PerkProps, {}> {
    render() {
        if (this.props.perk) {
            const classes = `perk ${this.props.perk.isGood ? 'good' : 'bad'}`;
            return (
                <div className={classes}>{this.props.perk.name}</div>
            );
        } else {
            return <div>Loading...</div>
        }
    }
}

export default Perk;