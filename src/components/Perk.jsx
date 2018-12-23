import React from 'react';

export class DestinyPerk {
    constructor(name, isGood, upgrade1, upgrade2) {
        this.name = name;
        this.isGood = isGood;
        this.upgrade1 = upgrade1;
        this.upgrade2 = upgrade2;
    }
}

class Perk extends React.Component {
    render() {
        const classes = `perk ${this.props.perk.isGood ? 'good' : 'bad'}`;
        return (
            <div className={classes}>{this.props.perk.name}</div>
        );
    }
}