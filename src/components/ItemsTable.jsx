import React from 'react';
import ItemStore from '../stores/ItemStore';
import ItemActions from '../actions/ItemActions';
import Item, { DestinyItem } from './Item';

class ItemsTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = ItemStore.getState();
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        ItemStore.listen(this.onChange);

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
                <div>Something went wrong :(</div>
            );
        }

        if (!this.state.items.length) {
            return (
                <div>Loading...</div>
            );
        }

        return (
            <table className="item-table">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Type</th>
                        <th>Power</th>
                        <th>Primary</th>
                        <th>Secondary</th>
                    </tr>
                    {this.state.items.map((item) => {
                        return (
                            <Item key={item.id} item={new DestinyItem(item)}/>
                            );
                        })}
                </tbody>
            </table>
        );
    }
}

export default ItemsTable;