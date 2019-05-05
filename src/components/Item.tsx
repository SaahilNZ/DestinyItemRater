import React from 'react';
import Perk from './Perk';
import ItemComparisonResult from '../services/ItemComparisonResult';
import DestinyItemContainer from '../model/DestinyItemContainer';

export interface ItemProps {
    itemContainer: DestinyItemContainer;
    scrollToItem: (itemId: string) => void;
    itemRef: React.RefObject<HTMLTableRowElement>;
}

class Item extends React.Component<ItemProps, {}> {
    render() {
        let comparisons = <div>Loading...</div>;
        if (this.props.itemContainer.comparisons) {
            let similar = this.props.itemContainer.comparisons.filter(comparison =>
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
                <td>{this.props.itemContainer.item.id}</td>
                <td>{this.props.itemContainer.definition.name}</td>
                <td>{this.props.itemContainer.definition.class}</td>
                <td>{this.props.itemContainer.definition.itemType}</td>
                <td>{this.props.itemContainer.item.power}</td>

                <td>
                    <div className="perkBlock">
                        {
                            this.props.itemContainer.perkColumns.map(column => {
                                let perks = column.filter(perk => perk != null).map(perk =>
                                    <li>
                                        <Perk perk={perk} />
                                    </li>
                                );
                                return (
                                    <div className="perkColumn">
                                        <ul>
                                            {perks}
                                        </ul>
                                    </div>
                                )
                            })
                        }
                    </div>
                </td>
                <td>
                    {comparisons}
                </td>
            </tr>
        );
    }
}

export default Item;