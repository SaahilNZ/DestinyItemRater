import React, { createRef } from 'react';
import Item from './Item';
import DestinyItemContainer from '../model/DestinyItemContainer';

interface ItemsTableProps {
    containers: DestinyItemContainer[];
}

export default class ItemsTable extends React.Component<ItemsTableProps, {}> {
    private itemRefs = new Map<string, React.RefObject<HTMLTableRowElement>>();

    constructor(props) {
        super(props);
        this.scrollToItem = this.scrollToItem.bind(this);
    }

    render() {
        this.itemRefs = new Map<string, React.RefObject<HTMLTableRowElement>>();
        this.props.containers.forEach(container => {
            this.itemRefs.set(container.item.id, createRef<HTMLTableRowElement>());
        });

        let rows = this.props.containers.map(container => {
            return <Item itemRef={this.itemRefs.get(container.item.id)} key={container.item.id}
                itemContainer={container} scrollToItem={this.scrollToItem} />;
        });

        return (
            <table className="item-table">
                <tbody>
                    <tr>
                        <th>Icon</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Type</th>
                        <th>Power</th>
                        <th>Perks</th>
                        <th>Similar items</th>
                    </tr>
                    {rows}
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