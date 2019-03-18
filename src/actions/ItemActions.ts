import alt from "../alt";
import ItemSource from "../sources/ItemSource";
import ComparisonActions from "./ComparisonActions";
import AbstractActionsModel from "./AbstractActionsModel";

interface AltItemActions {
    fetchItems(): (dispatch: any) => Promise<void>;
    onItemsFailedToLoad(errorMessage): any;
    onItemsLoadedForAccount(bungieResponse: any): any;
}

class ItemActions extends AbstractActionsModel implements AltItemActions {
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
}

export default alt.createActions<AltItemActions>(ItemActions);