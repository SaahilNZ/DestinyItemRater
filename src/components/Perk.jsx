import React from 'react';

class Perk extends React.Component {
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