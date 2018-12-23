import alt from "../alt";
import ItemSource from "../sources/ItemSource";

class ItemActions {
    updateItems(items) {
        return items;
    }

    fetchItems() {
        return (dispatch) => {
            dispatch();
            let source = new ItemSource();
            source.fetch()
                .then((items) => {
                    this.updateItems(items);
                    this.rateItems();
                })
                .catch((errorMessage) => {
                    this.itemsFailed(errorMessage);
                })
        }
    }

    rateItems() {
        return true;
    }

    itemsFailed(errorMessage) {
        return errorMessage;
    }
}

export default alt.createActions(ItemActions);