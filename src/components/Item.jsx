import React from 'react';

export class DestinyItem {
    constructor(item) {
        this.name = item.item;
        this.class = item.class;
        this.type = item.type;
        this.power = item.power;
        this.primaryPerks = [];
        this.secondaryPerks = [];

        if (item.type === "Warlock Bond" ||
            item.type === "Hunter Cloak" ||
            item.type === "Titan Mark") {
            if (item.perks[0]) this.primaryPerks = item.perks[0];
            if (item.perks[1]) this.secondaryPerks = item.perks[1];
        } else {
            if (item.perks[2]) this.primaryPerks = item.perks[2];
            if (item.perks[3]) this.secondaryPerks = item.perks[3];
        }
    }
}

class Item extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.item.name}</td>
                <td>{this.props.item.class}</td>
                <td>{this.props.item.type}</td>
                <td>{this.props.item.power}</td>
                <td>
                    <ul>
                        {this.props.item.primaryPerks.map(perk =>
                            <li>{perk}</li>)}
                    </ul>
                </td>
                <td>
                    <ul>
                        {this.props.item.secondaryPerks.map(perk =>
                            <li>{perk}</li>)}
                    </ul>
                </td>
            </tr>
        );
    }
}

export default Item;