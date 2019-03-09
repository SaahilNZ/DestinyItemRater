import React from 'react';
import Perk from './Perk.jsx';
import ItemComparisonResult from '../services/ItemComparisonResult';

class Item extends React.Component {
    render() {
        let comparisons = <div>Loading...</div>;
        if (this.props.item.comparisons) {
            let similar = this.props.item.comparisons.filter(comparison =>
                comparison.result !== ItemComparisonResult.ITEM_IS_INCOMPARABLE);
            comparisons = (
                <ul>
                    {similar.map(comparison => {
                        let className = "";
                        switch (comparison.result) {
                            case ItemComparisonResult.ITEM_IS_EQUIVALENT:
                                className = "comparison-equivalent";
                                break;
                            case ItemComparisonResult.ITEM_IS_BETTER:
                                className = "comparison-better";
                                break;
                            case ItemComparisonResult.ITEM_IS_WORSE:
                                className = "comparison-worse";
                                break;
                            default:
                                className = "";
                                break;
                        }
                        return (
                            <li key={comparison.item2}>
                                <div className={className}>{comparison.id}</div>
                            </li>);
                    })}
                </ul>
            );
        }

        return (
            <tr>
                <td>{this.props.item.id}</td>
                <td>{this.props.item.name}</td>
                <td>{this.props.item.class}</td>
                <td>{this.props.item.type}</td>
                <td>{this.props.item.power}</td>
                <td>
                    <ul>
                        {this.props.item.perkColumns[0].filter(perk => perk != null)
                            .map(perk =>
                                <li>
                                    <Perk perk={perk} />
                                </li>)}
                    </ul>
                </td>
                <td>
                    <ul>
                        {this.props.item.perkColumns[1].filter(perk => perk != null)
                            .map(perk =>
                                <li>
                                    <Perk perk={perk} />
                                </li>)}
                    </ul>
                </td>
                <td>
                    <ul>
                        {this.props.item.perkColumns[2].filter(perk => perk != null)
                            .map(perk =>
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