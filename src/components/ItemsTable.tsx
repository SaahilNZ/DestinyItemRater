import React, { createRef } from 'react';
import Item from './Item';
import DestinyItem from '../model/DestinyItem';

interface ItemsTableProps {
    items: DestinyItem[]
}

export default class ItemsTable extends React.Component<ItemsTableProps, {}> {
    private itemRefs = new Map<string, React.RefObject<HTMLTableRowElement>>();

    constructor(props) {
        super(props);
        this.scrollToItem = this.scrollToItem.bind(this);
    }

    render() {
        this.itemRefs = new Map<string, React.RefObject<HTMLTableRowElement>>();
        this.props.items.forEach(item => {
            this.itemRefs.set(item.id, createRef<HTMLTableRowElement>());
        });
        let items = this.props.items.map(item =>
            <Item itemRef={this.itemRefs.get(item.id)} key={item.id} item={item} scrollToItem={this.scrollToItem} />);

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