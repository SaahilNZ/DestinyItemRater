import alt from "../alt";
import ItemSource from "../sources/ItemSource";
import ComparisonActions from "./ComparisonActions";

class ItemActions {

    fetchItems() {
        return async (dispatch) => {
            dispatch();
            let source = new ItemSource();
            try {
                let bungieResponse = await source.fetch();
                this.onItemsLoadedForAccount(bungieResponse);
                ComparisonActions.compareItems();
                
            } catch (e) {
                this.onItemsFailedToLoad(e.message);
            }
        }
    }

    // Events

    onItemsFailedToLoad(errorMessage) {
        return errorMessage;
    }

    onItemsLoadedForAccount(bungieResponse) {
        return bungieResponse;
    }

    onItemDefinitionsLoaded(itemDefs) {
        return itemDefs;
    }

    onPerkRatingsLoaded(perkRatings) {
        return perkRatings;
    }
}

export default alt.createActions(ItemActions);