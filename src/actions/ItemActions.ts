import alt from "../alt";
import ItemSource from "../sources/ItemSource";
import ComparisonActions from "./ComparisonActions";
import AbstractActionsModel from "./AbstractActionsModel";
import DestinyAccount from "../model/DestinyAccount";

interface AltItemActions {
    fetchItems(account: DestinyAccount): (dispatch: any) => Promise<void>;
    onItemsFailedToLoad(errorMessage): any;
    onItemsLoadedForAccount(bungieResponse: any): any;
}

class ItemActions extends AbstractActionsModel implements AltItemActions {
    fetchItems(account: DestinyAccount) {
        return async (dispatch) => {
            dispatch();
            let source = new ItemSource();
            try {
                let bungieResponse = await source.fetch(account);
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