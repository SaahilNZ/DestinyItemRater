import React from 'react';

class Perk extends React.Component {
    render() {
        const classes = `perk ${this.props.perk.isGood ? 'good' : 'bad'}`;
        return (
            <div className={classes}>{this.props.perk.name}</div>
        );
    }
}

export default Perk;