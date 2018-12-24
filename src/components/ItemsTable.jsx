import React from 'react';
import ItemStore from '../stores/ItemStore';
import ItemActions from '../actions/ItemActions';
import Item from './Item';
import PerkActions from '../actions/PerkActions';

class ItemsTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = ItemStore.getState();
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        ItemStore.listen(this.onChange);

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

        if (!this.state.items.length) {
            return (
                <div>Loading...</div>
            );
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
                        <th>Primary</th>
                        <th>Secondary</th>
                        <th>Similar items</th>
                    </tr>
                    {this.state.items.map((item) => {
                        return (
                            <Item key={item.id} item={item}/>
                            );
                        })}
                </tbody>
            </table>
        );
    }
}

export default ItemsTable;