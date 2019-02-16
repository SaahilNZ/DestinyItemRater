import ComparisonActions from "../actions/ComparisonActions";
import alt from "../alt";
import ItemStore from "./ItemStore";
import ComparisonService from "../services/ComparisonService";

class ComparisonStore {
    constructor() {
        this.comparisons = [];
        this.errorMessage = null;
        this.bindListeners({
            onItemsComparing: ComparisonActions.compareItems,
            onItemsCompared: ComparisonActions.onItemsCompared
        });
    }

    onItemsComparing() {
        this.comparisons = [];
    }

    onItemsCompared() {
        this.waitFor(ItemStore);
        let comparisons = [];
        let items = ItemStore.getState().items;
        let comparedItems = ComparisonService.compareAll(items);
        comparedItems.forEach(item => {
            item.comparisons.forEach(comparison => {
                comparisons.push({
                    item1: item.id,
                    item2: comparison.id,
                    result: comparison.result
                });
            });
        });
        this.comparisons = comparisons;
    }
}

export default alt.createStore(ComparisonStore, 'ComparisonStore');