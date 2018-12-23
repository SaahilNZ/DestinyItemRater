import React from 'react';
import Perk from './Perk';

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
                            <li>
                                <Perk perk={perk} />
                            </li>)}
                    </ul>
                </td>
                <td>
                    <ul>
                        {this.props.item.secondaryPerks.map(perk =>
                            <li>
                                <Perk perk={perk} />
                            </li>)}
                    </ul>
                </td>
            </tr>
        );
    }
}

export default Item;