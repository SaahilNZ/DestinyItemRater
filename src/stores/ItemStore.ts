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
import { requestItems, requestItemDefinitions, requestItemsFailure } from '../actions/ItemActions';
import { Action } from '../actions/Actions';

class ItemStore extends AbstractStoreModel<ItemsState> implements ItemsState {
    items: DestinyItem[];
    itemDefinitions: Map<string, DestinyItemDefinition>;
    perkRatings: Map<string, PerkRating>;
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
        this.perkRatings = new Map<string, PerkRating>();
        this.updateAppStore();
    }

    onItemsLoadedForAccount(bungieResponse: BungieResponse<BungieDestinyProfile>) {
        this.items = this.buildItems(bungieResponse);
        if (this.itemDefinitions.size > 0) {
            this.applyItemDefinitions();
        }
        if (this.perkRatings.size > 0) {
            this.applyPerkRatings();
        }
        this.compareItems();
        this.errorMessage = null;
        this.updateAppStore();
    }

    onItemDefinitionsLoaded(itemDefs: Map<string, DestinyItemDefinition>) {
        this.itemDefinitions = itemDefs;
        this.applyItemDefinitions();
        this.compareItems();
    }

    onPerkRatingsLoaded(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
        this.applyPerkRatings();
        this.compareItems();
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

    applyItemDefinitions() {
        const armourTypes = [
            'Helmet', 'Gauntlets', 'Chest Armor', 'Leg Armor',
            'Warlock Bond', 'Hunter Cloak', 'Titan Mark'
        ];
        const weaponTypes = [
            'Auto Rifle', 'Pulse Rifle', 'Scout Rifle', 'Hand Cannon', 'Submachine Gun', 'Sidearm', 'Combat Bow',
            'Sniper Rifle', 'Shotgun', 'Fusion Rifle', 'Grenade Launcher',
            'Rocket Launcher', 'Sword', 'Linear Fusion Rifle', 'Machine Gun'
        ];
        this.items.forEach((item, index) => {
            let itemDef = this.itemDefinitions.get(item.itemHash);

            let isArmor = armourTypes.includes(itemDef.itemType);
            let isWeapon = weaponTypes.includes(itemDef.itemType);

            if (isArmor || isWeapon) {

                let perkColumnIndices =
                    isArmor ? [0, 1, 2, 5, 6, 7] :
                        isWeapon ? [0, 1, 2, 3, 4, 9] : [];

                item.perkColumns = [];
                for (let i = 0; i < item.perkColumnHashes.length; i++) {
                    if (perkColumnIndices.includes(i)) {
                        const column = item.perkColumnHashes[i];
                        item.perkColumns.push(column.map(hash => {
                            let plugDefinition = this.itemDefinitions.get(hash);
                            return {
                                hash: hash,
                                name: (plugDefinition && plugDefinition.name) || "",
                                isGood: false,
                                upgrades: []
                            };
                        }));
                    }
                }

                item.group = isArmor ? 'armor' : (isWeapon ? 'weapons' : null);
            } else {
                this.items[index] = null;
            }
        });
        this.items = this.items.filter(item => item !== null);
        this.updateAppStore();
    }

    applyPerkRatings() {
        this.items.forEach(item => {
            item.perkColumns.forEach(column => {
                column.forEach(perk => {
                    let perkRating = this.perkRatings.get(perk.name.toLowerCase());
                    if (perkRating) {
                        perk.isGood = perkRating.isGood;
                        perk.upgrades = perkRating.upgrades;
                    } else {
                        perk = null;
                    }
                });
            });
        });
    }

    compareItems() {
        let containers = this.items.map(item => {
            let itemDef = this.itemDefinitions.get(item.itemHash);
            return itemDef && {
                item: item,
                definition: itemDef
            };
        }).filter(item => item !== null);

        let comparisons = ComparisonService.compareAll(containers);
        this.items.forEach(item => {
            item.comparisons = comparisons[item.id];
        });
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
                perkRatings: this.perkRatings,
                errorMessage: this.errorMessage
            }
        });
    }
}

// @ts-ignore: Alt.js has no TS typings defined for this usage
export default alt.createStore<ItemsState>(ItemStore, 'ItemStore');