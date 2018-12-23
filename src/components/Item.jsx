import React from 'react';
import Perk from './Perk';
import ItemComparisonResult from '../services/ItemComparisonResult';

class Item extends React.Component {
    render() {
        let comparisons = <div>Loading...</div>;
        if (this.props.item.comparisons) {
            let similar = this.props.item.comparisons.filter(comparison =>
                comparison.result !== ItemComparisonResult.ITEM_IS_INCOMPARABLE);
            comparisons = (
                <ul>
                    {similar.map(comparison => 
                        <li key={comparison.id}>{comparison.id} ({comparison.result})</li>)}
                </ul>);
        }

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
                <td>
                    {comparisons}
                </td>
            </tr>
        );
    }
}

export default Item;