import React from 'react';
import { DestinyPerkContainer, PerkTier } from '../model/DestinyPerkContainer';

export interface PerkProps {
    perk: DestinyPerkContainer;
}

class Perk extends React.Component<PerkProps, {}> {
    render() {
        if (this.props.perk) {
            let ratings = [];
            for (const mode in this.props.perk.isGoodByMode) {
                const tier = this.props.perk.tierByMode[mode];
                const isGood = this.props.perk.isGoodByMode[mode];

                const perkRatingClass = tier === PerkTier.NO_TIER
                    ? (isGood ? 'good' : 'bad')
                    : this.getClassForTier(tier);

                ratings.push(<span className={`rating ${perkRatingClass}`}>{mode}</span>);
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

    getClassForTier(tier: PerkTier): string {
        switch (tier) {
            case PerkTier.S_TIER:
                return 's-tier';
            case PerkTier.A_TIER:
                return 'a-tier';
            case PerkTier.B_TIER:
                return 'b-tier';
            case PerkTier.C_TIER:
                return 'c-tier';
        }
        return '';
    }
}

export default Perk;