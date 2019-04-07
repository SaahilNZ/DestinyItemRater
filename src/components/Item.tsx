import React from 'react';
import Perk from './Perk';
import ItemComparisonResult from '../services/ItemComparisonResult';
import DestinyItem from '../model/DestinyItem';

export interface ItemProps {
    item: DestinyItem;
    scrollToItem: (itemId: string) => void;
    itemRef: React.RefObject<HTMLTableRowElement>;
}

class Item extends React.Component<ItemProps, {}> {
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
                            <li key={comparison.id} onClick={() => this.props.scrollToItem(comparison.id)}>
                                <div className={"comparison " + className}>{comparison.id}</div>
                            </li>);
                    })}
                </ul>
            );
        }

        return (
            <tr ref={this.props.itemRef}>
                <td>{this.props.item.id}</td>
                <td>{this.props.item.name}</td>
                <td>{this.props.item.class}</td>
                <td>{this.props.item.type}</td>
                <td>{this.props.item.power}</td>
                <td>
                    <ul>
                        {
                            (this.props.item.perkColumns[0] || []).filter(perk => perk != null).map(perk =>
                                <li>
                                    <Perk perk={perk} />
                                </li>
                            )
                        }
                    </ul>
                </td>
                <td>
                    <ul>
                        {
                            (this.props.item.perkColumns[1] || []).filter(perk => perk != null).map(perk =>
                                <li>
                                    <Perk perk={perk} />
                                </li>
                            )
                        }
                    </ul>
                </td>
                <td>
                    <ul>
                        {
                            (this.props.item.perkColumns[2] || []).filter(perk => perk != null).map(perk =>
                                <li>
                                    <Perk perk={perk} />
                                </li>
                            )
                        }
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