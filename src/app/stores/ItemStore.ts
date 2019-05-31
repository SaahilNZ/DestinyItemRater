import ItemActions_Alt from '../actions/ItemActions_Alt';
import alt from "../alt";
import ItemDefinitionActions from '../actions/ItemDefinitionActions';
import PerkActions from '../actions/PerkActions';
import DestinyItem from '../model/DestinyItem';
import DestinyItemDefinition from '../model/DestinyItemDefinition';
import PerkRating from '../model/PerkRating';
import AbstractStoreModel from './AbstractStoreModel';
import { ItemsState } from '../model/State';
import AppStore from './AppStore';
import { requestItems, requestItemDefinitions, requestItemsFailure, requestPerkRatings, requestItemsSuccess, requestItemDefinitionsSuccess, requestPerkRatingsSuccess, compareItems, tagItems } from '../actions/ItemActions';
import { Action } from '../actions/Actions';
import DestinyItemComparison from '../model/DestinyItemComparison';
import BungieDestinyProfile from '../model/bungie/BungieDestinyProfile';
import { ItemTag } from '../services/TaggingService';

class ItemStore extends AbstractStoreModel<ItemsState> implements ItemsState {
    items: DestinyItem[];
    itemDefinitions: Map<number, DestinyItemDefinition>;
    perkRatings: Map<string, PerkRating>;
    comparisons: Map<string, DestinyItemComparison[]>;
    itemTags: Map<string, ItemTag>;
    errorMessage: string;

    constructor() {
        super();
        Object.assign(this, AppStore.getState().items);
        this.bindListeners({
            onItemsFetching: ItemActions_Alt.fetchItems,
            onItemDefinitionsFetching: ItemDefinitionActions.fetchItemDefinitions,
            onPerkRatingsFetching: PerkActions.fetchPerks,

            onItemsFailedToLoad: ItemActions_Alt.onItemsFailedToLoad,
            onItemsLoadedForAccount: ItemActions_Alt.onItemsLoadedForAccount,
            onItemDefinitionsLoaded: ItemDefinitionActions.updateItemDefinitions,
            onPerkRatingsLoaded: PerkActions.updatePerks
        })
    }

    onItemsFetching() {
        this.dispatch(requestItems());
    }

    onItemDefinitionsFetching() {
        this.dispatch(requestItemDefinitions());
    }

    onPerkRatingsFetching() {
        this.dispatch(requestPerkRatings());
    }

    onItemsLoadedForAccount(bungieResponse: BungieResponse<BungieDestinyProfile>) {
        this.dispatch(requestItemsSuccess(bungieResponse.Response));
        this.compareItems();
        this.tagItems();
    }

    onItemDefinitionsLoaded(itemDefs: Map<number, DestinyItemDefinition>) {
        this.dispatch(requestItemDefinitionsSuccess(itemDefs));
        this.compareItems();
        this.tagItems();
    }

    onPerkRatingsLoaded(perkRatings: Map<string, PerkRating>) {
        this.dispatch(requestPerkRatingsSuccess(perkRatings));
        this.compareItems();
        this.tagItems();
    }

    compareItems() {
        this.dispatch(compareItems());
    }

    tagItems() {
        this.dispatch(tagItems());
    }

    onItemsFailedToLoad(errorMessage) {
        this.dispatch(requestItemsFailure(errorMessage));
    }

    private dispatch(action: Action) {
        let newState = AppStore.dispatch(action);
        Object.assign(this, newState.items);
    }
}

// @ts-ignore: Alt.js has no TS typings defined for this usage
export default alt.createStore<ItemsState>(ItemStore, 'ItemStore');