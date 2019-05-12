import React from 'react';
import DestinyPerkContainer from '../model/DestinyPerkContainer';

export interface PerkProps {
    perk: DestinyPerkContainer;
}

class Perk extends React.Component<PerkProps, {}> {
    render() {
        if (this.props.perk) {
            let ratings = [];
            for (const mode in this.props.perk.isGoodByMode) {
                const isGood = this.props.perk.isGoodByMode[mode];
                const className = `rating ${isGood ? 'good' : 'bad'}`;
                ratings.push(<span className={className}>{mode}</span>);
            }
            return (
                <div className='perk'>
                    <span>{this.props.perk.name}</span>
                    <div />
                    {ratings}
                </div>
            );
        } else {
            return <div>Loading...</div>
        }
    }
}

export default Perk;