import React, { createRef } from 'react';
import ItemStore from '../stores/ItemStore';
import ItemActions from '../actions/ItemActions';
import Item from './Item';
import ItemDefinitionActions from '../actions/ItemDefinitionActions';
import PerkActions from '../actions/PerkActions';
import ItemComparisonResult from '../services/ItemComparisonResult';
import { ItemStoreState } from '../stores/ItemStore';

export interface ItemsTableProps {
    itemFilter?: string;
}

class ItemsTable extends React.Component<ItemsTableProps, ItemStoreState> {
    private itemRefs = new Map<string, React.RefObject<HTMLTableRowElement>>();

    constructor(props) {
        super(props);
        this.state = ItemStore.getState();
        this.onChange = this.onChange.bind(this);
        this.scrollToItem = this.scrollToItem.bind(this);
    }

    componentDidMount() {
        ItemStore.listen(this.onChange);

        ItemDefinitionActions.fetchItemDefinitions();
        PerkActions.fetchPerks();
        ItemActions.fetchItems();
    }

    componentWillUnmount() {
        ItemStore.unlisten(this.onChange);
    }

    onChange(state) {
        this.setState(state);
    }

    render() {
        if (this.state.errorMessage) {
            return (
                <div>
                    <div>Something went wrong :(</div>
                    <div>{this.state.errorMessage}</div>
                </div>
            );
        }

        if (!this.state.items || !this.state.items.length) {
            return (
                <div>Loading...</div>
            );
        }

        this.itemRefs = new Map<string, React.RefObject<HTMLTableRowElement>>();
        this.state.items.forEach(item => {
            this.itemRefs.set(item.id, createRef<HTMLTableRowElement>());
        });

        let items: JSX.Element[];
        if (this.props.itemFilter === "bad") {
            items = this.state.items.filter(item => {
                let isBetter = false;
                if (item.group === 'armor' && item.comparisons) {
                    for (let i = 0; i < item.comparisons.length; i++) {
                        const comparison = item.comparisons[i];
                        if (comparison && comparison.result === ItemComparisonResult.ITEM_IS_BETTER) {
                            isBetter = true;
                            break;
                        }
                    }
                }
                return isBetter;
            }).map((item) => {
                return (
                    <Item itemRef={this.itemRefs.get(item.id)} key={item.id} item={item} scrollToItem={this.scrollToItem} />
                );
            });
        } else if (this.props.itemFilter === 'weapons') {
            items = this.state.items.filter(item => item.group === 'weapons')
                .map(item => {
                    return (
                        <Item itemRef={this.itemRefs.get(item.id)} key={item.id} item={item} scrollToItem={this.scrollToItem} />
                    );
                });
        } else {
            items = this.state.items.filter(item => item.group === 'armor')
                .map((item) => {
                    return (
                        <Item itemRef={this.itemRefs.get(item.id)} key={item.id} item={item} scrollToItem={this.scrollToItem} />
                    );
                });
        }

        return (
            <table className="item-table">
                <tbody>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Type</th>
                        <th>Power</th>
                        <th>Perks</th>
                        <th>Similar items</th>
                    </tr>
                    {items}
                </tbody>
            </table>
        );
    }

    scrollToItem(itemId: string) {
        let itemRef = this.itemRefs.get(itemId).current;
        if (itemRef !== null && itemRef !== undefined) {
            itemRef.scrollIntoView(true);
        }
    }
}

export default ItemsTable;