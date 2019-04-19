import DestinyAccount from "../model/DestinyAccount";
import React from "react";
import { ItemsState } from "../model/State";
import ItemStore from "../stores/ItemStore";
import ItemActions_Alt from "../actions/ItemActions_Alt";
import PerkActions from "../actions/PerkActions";
import ItemDefinitionActions from "../actions/ItemDefinitionActions";
import DestinyItem from "../model/DestinyItem";
import ItemComparisonResult from "../services/ItemComparisonResult";
import ItemsTable from "./ItemsTable";

interface FilteredItemsTableProps {
    selectedAccount: DestinyAccount;
    itemFilter?: string;
}

export default class FilteredItemsTable extends React.Component<FilteredItemsTableProps, ItemsState> {
    constructor(props) {
        super(props);

        this.state = ItemStore.getState();
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        ItemStore.listen(this.onChange);

        ItemDefinitionActions.fetchItemDefinitions();
        PerkActions.fetchPerks();
        ItemActions_Alt.fetchItems(this.props.selectedAccount);
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

        let items: DestinyItem[];
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
            });
        } else if (this.props.itemFilter === 'weapons') {
            items = this.state.items.filter(item => item.group === 'weapons');
        } else {
            items = this.state.items.filter(item => item.group === 'armor');
        }

        return (
            <ItemsTable items={items} />
        );
    }
}