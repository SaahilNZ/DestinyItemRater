import alt from "../alt";
import ItemSource from "../sources/ItemSource";
import ComparisonService from '../services/ComparisonService';

class ItemActions {

    fetchItems() {
        return async (dispatch) => {
            dispatch();
            let source = new ItemSource();
            try {
                let items = await source.fetch();
                this.onItemsUpdated(items);
                this.compareItems(items);
                
            } catch (e) {
                this.onItemsFailedToLoad(e.message);
            }
        }
    }

    compareItems(items) {
        return (dispatch) => {
            dispatch();
            this.onItemsCompared(
                items.map(item => this.compareItem(item, items)));
        }
    }

    compareItem(item, items) {
        let comparisons = new Array(items.length - 1);
        for (let i = 0; i < items.length; i++) {
            const item2 = items[i];
            if (item.id === item2.id) {
                continue;
            }
            comparisons[i] = {
                id: item2.id,
                result: ComparisonService.compare(item, item2)
            };
        }
        return {
            id: item.id,
            comparisons: comparisons
        };
    }

    // Events

    onItemsUpdated(items) {
        return items;
    }

    onItemsCompared(items) {
        return items;
    }

    onItemsFailedToLoad(errorMessage) {
        return errorMessage;
    }
}

export default alt.createActions(ItemActions);