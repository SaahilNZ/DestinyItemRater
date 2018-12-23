import ItemActions from '../actions/ItemActions';
import alt from "../alt";

class ItemStore {
    constructor() {
        this.items = [];
        this.errorMessage = null;
        this.bindListeners({
            handleUpdateItems: ItemActions.UPDATE_ITEMS,
            handleFetchItems: ItemActions.FETCH_ITEMS,
            handleItemsFailed: ItemActions.ITEMS_FAILED
        })        
    }

    handleUpdateItems(items) {
        this.items = items;
        this.errorMessage = null;
    }

    handleFetchItems() {
        this.items = [];
    }

    handleItemsFailed(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

export default alt.createStore(ItemStore, 'ItemStore');