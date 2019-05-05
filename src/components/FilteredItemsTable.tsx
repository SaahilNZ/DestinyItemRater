import DestinyAccount from "../model/DestinyAccount";
import React from "react";
import { ItemsState } from "../model/State";
import ItemStore from "../stores/ItemStore";
import ItemActions_Alt from "../actions/ItemActions_Alt";
import PerkActions from "../actions/PerkActions";
import ItemDefinitionActions from "../actions/ItemDefinitionActions";
import ItemComparisonResult from "../services/ItemComparisonResult";
import ItemsTable from "./ItemsTable";
import { buildItemContainer } from "../model/DestinyItemContainer";

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

        let itemGroup = this.props.itemFilter === 'weapons' ? 'weapons' : 'armor';
        let containers = this.state.items
            .map(item => buildItemContainer(item, this.state.itemDefinitions, this.state.comparisons, this.state.perkRatings))
            .filter(container => container && container.group === itemGroup);

        if (this.props.itemFilter === "bad") {
            containers = containers.filter(container => {
                // don't show items that haven't been compared yet
                return container.comparisons && container.comparisons.length > 0
                    ? container.comparisons.some(comparison => comparison.result === ItemComparisonResult.ITEM_IS_BETTER)
                    : false;
            });
        }

        return (
            <ItemsTable containers={containers} />
        );
    }
}