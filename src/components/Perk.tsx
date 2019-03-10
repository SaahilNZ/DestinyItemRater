import React from 'react';

export interface PerkProps { 
    perk: any;
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