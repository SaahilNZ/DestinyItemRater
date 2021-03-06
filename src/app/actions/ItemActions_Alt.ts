import alt from "../alt";
import ItemSource from "../sources/ItemSource";
import AbstractActionsModel from "./AbstractActionsModel";
import DestinyAccount from "../model/DestinyAccount";
import BungieDestinyProfile from "../model/bungie/BungieDestinyProfile";

interface AltItemActions {
    fetchItems(account: DestinyAccount): (dispatch: any) => Promise<void>;
    onItemsFailedToLoad(errorMessage): string;
    onItemsLoadedForAccount(bungieResponse: BungieResponse<BungieDestinyProfile>): BungieResponse<BungieDestinyProfile>;
}

class ItemActions_Alt extends AbstractActionsModel implements AltItemActions {
    fetchItems(account: DestinyAccount) {
        return async (dispatch) => {
            dispatch();
            let source = new ItemSource();
            try {
                let bungieResponse = await source.fetch(account);
                this.onItemsLoadedForAccount(bungieResponse);

            } catch (e) {
                this.onItemsFailedToLoad(e.message);
            }
        }
    }

    // Events

    onItemsFailedToLoad(errorMessage: string) {
        return errorMessage;
    }

    onItemsLoadedForAccount(bungieResponse: BungieResponse<BungieDestinyProfile>) {
        return bungieResponse;
    }
}

export default alt.createActions<AltItemActions>(ItemActions_Alt);