import alt from "../alt";
import ItemSource from "../sources/ItemSource";
import ComparisonActions from "./ComparisonActions";

class ItemActions {

    fetchItems() {
        return async (dispatch) => {
            dispatch();
            let source = new ItemSource();
            try {
                let items = await source.fetch();
                this.onItemsUpdated(items);
                ComparisonActions.compareItems();
                
            } catch (e) {
                this.onItemsFailedToLoad(e.message);
            }
        }
    }

    // Events

    onItemsUpdated(items) {
        return items;
    }

    onItemsFailedToLoad(errorMessage) {
        return errorMessage;
    }
}

export default alt.createActions(ItemActions);