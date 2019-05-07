import ItemActions_Alt from '../actions/ItemActions_Alt';
import alt from "../alt";
import ItemDefinitionActions from '../actions/ItemDefinitionActions';
import PerkActions from '../actions/PerkActions';
import ComparisonService from '../services/ComparisonService';
import DestinyItem from '../model/DestinyItem';
import DestinyItemDefinition from '../model/DestinyItemDefinition';
import PerkRating from '../model/PerkRating';
import AbstractStoreModel from './AbstractStoreModel';
import { ItemsState } from '../model/State';
import AppStore from './AppStore';
import { requestItems, requestItemDefinitions, requestItemsFailure, requestPerkRatings } from '../actions/ItemActions';
import { Action } from '../actions/Actions';
import { buildItemContainer } from '../model/DestinyItemContainer';
import DestinyItemComparison from '../model/DestinyItemComparison';

class ItemStore extends AbstractStoreModel<ItemsState> implements ItemsState {
    items: DestinyItem[];
    itemDefinitions: Map<string, DestinyItemDefinition>;
    perkRatings: Map<string, PerkRating>;
    comparisons: Map<string, DestinyItemComparison[]>;
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
        this.items = this.buildItems(bungieResponse);
        this.compareItems();
        this.errorMessage = null;
        this.updateAppStore();
    }

    onItemDefinitionsLoaded(itemDefs: Map<string, DestinyItemDefinition>) {
        this.itemDefinitions = itemDefs;
        this.compareItems();
        this.updateAppStore();
    }

    onPerkRatingsLoaded(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
        this.compareItems();
        this.updateAppStore();
    }

    private buildItems(bungieResponse: BungieResponse<BungieDestinyProfile>): DestinyItem[] {
        let rawItems: BungieDestinyItem[] = [];
        bungieResponse.Response.profileInventory.data.items.forEach(item => {
            rawItems.push(item);
        });
        for (var i in bungieResponse.Response.characterInventories.data) {
            let characterInventory = bungieResponse.Response.characterInventories.data[i];
            characterInventory.items.forEach(item => {
                rawItems.push(item);
            });
        }
        for (var e in bungieResponse.Response.characterEquipment.data) {
            let characterEquipment = bungieResponse.Response.characterEquipment.data[e];
            characterEquipment.items.forEach(item => {
                rawItems.push(item);
            });
        }
        let allItems = Array.from(new Set(rawItems));

        return allItems.filter(item => item.itemInstanceId)
            .map(item => {
                let itemInstance = bungieResponse.Response.itemComponents.instances.data[item.itemInstanceId];
                if (!itemInstance) return null;

                let perkColumnHashes: string[][] = [];
                let itemSockets = bungieResponse.Response.itemComponents.sockets.data[item.itemInstanceId];
                if (itemSockets) {
                    perkColumnHashes = itemSockets.sockets.map(
                        socket => socket.reusablePlugHashes || [socket.plugHash]);
                }

                let primaryStat = itemInstance.primaryStat;
                return {
                    id: item.itemInstanceId,
                    itemHash: item.itemHash,
                    power: primaryStat && primaryStat.value,
                    perkColumnHashes: perkColumnHashes,
                    perkColumns: null,
                    comparisons: [],
                    group: null
                };
            }).filter(item => item);
    }

    compareItems() {
        if (this.perkRatings) {
            let containers = this.items.map(item => buildItemContainer(item, this.itemDefinitions, new Map(), this.perkRatings))
                .filter(container => container);
            this.comparisons = ComparisonService.compareAll(containers, this.perkRatings);
        } else {
            this.comparisons = new Map();
        }
    }

    onItemsFailedToLoad(errorMessage) {
        this.dispatch(requestItemsFailure(errorMessage));
    }

    private dispatch(action: Action) {
        let newState = AppStore.dispatch(action);
        Object.assign(this, newState.items);
    }

    // todo: remove this
    private updateAppStore() {
        AppStore.setState({
            items: {
                items: this.items,
                itemDefs: this.itemDefinitions,
                comparisons: this.comparisons,
                perkRatings: this.perkRatings,
                errorMessage: this.errorMessage
            }
        });
    }
}

// @ts-ignore: Alt.js has no TS typings defined for this usage
export default alt.createStore<ItemsState>(ItemStore, 'ItemStore');