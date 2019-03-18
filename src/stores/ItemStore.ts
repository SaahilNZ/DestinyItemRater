import ItemActions from '../actions/ItemActions';
import alt from "../alt";
import ItemDefinitionActions from '../actions/ItemDefinitionActions';
import PerkActions from '../actions/PerkActions';
import ComparisonService from '../services/ComparisonService';
import DestinyItem from '../model/DestinyItem';
import ItemDefinition from '../model/ItemDefinition';
import PerkRating from '../model/PerkRating';
import AbstractStoreModel from './AbstractStoreModel';
import DestinyItemComparison from '../model/DestinyItemComparison';

const armorTypeHashes = [
    138197802,      // General
    3448274439,     // Helmet
    3551918588,     // Gauntlets
    14239492,       // Chest Armor
    20886954,       // Leg Armor,
    1585787867      // Class Armor
];

export interface ItemStoreState {
    items: DestinyItem[];
    itemDefs: Map<string, ItemDefinition>;
    perkRatings: Map<string, PerkRating>;
    errorMessage: string;
}

class ItemStore extends AbstractStoreModel<ItemStoreState> implements ItemStoreState {
    items: DestinyItem[];
    itemDefs: Map<string, ItemDefinition>;
    perkRatings: Map<string, PerkRating>;
    errorMessage: string;

    constructor() {
        super();
        this.items = [];
        this.itemDefs = new Map();
        this.perkRatings = new Map();
        this.errorMessage = null;
        this.bindListeners({
            onItemsFetching: ItemActions.fetchItems,
            onItemDefinitionsFetching: ItemDefinitionActions.fetchItemDefinitions,
            onPerkRatingsFetching: PerkActions.fetchPerks,

            onItemsFailedToLoad: ItemActions.onItemsFailedToLoad,
            onItemsLoadedForAccount: ItemActions.onItemsLoadedForAccount,
            onItemDefinitionsLoaded: ItemDefinitionActions.updateItemDefinitions,
            onPerkRatingsLoaded: PerkActions.updatePerks
        })
    }

    onItemsFetching() {
        this.items = [];
    }

    onItemDefinitionsFetching() {
        this.itemDefs = new Map<string, ItemDefinition>();
    }

    onPerkRatingsFetching() {
        this.perkRatings = new Map<string, PerkRating>();
    }

    onItemsLoadedForAccount(bungieResponse) {
        let rawItems = [];
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

        this.items = allItems.filter(item => item.itemInstanceId !== null && item.itemInstanceId !== undefined)
            .filter(item => armorTypeHashes.includes(item.bucketHash))
            .map((item) => {
                let itemInstance = bungieResponse.Response.itemComponents.instances.data[item.itemInstanceId];
                if (itemInstance === null || itemInstance === undefined) return null;

                let perkColumnHashes = [];
                let itemSockets = bungieResponse.Response.itemComponents.sockets.data[item.itemInstanceId];
                if (itemSockets) {
                    let columnIndices = [0, 5, 6];

                    // hack for Gambit Prime gear
                    let primarySocket = itemSockets.sockets[columnIndices[1]];
                    if (primarySocket && primarySocket.plugHash == 4248210736) { // Default Shader
                        columnIndices = [0, 6, 7];
                    }

                    perkColumnHashes = columnIndices.map(i => {
                        let socket = itemSockets.sockets[i];
                        if (!socket) {
                            return [];
                        }
                        if (socket.reusablePlugHashes === null || socket.reusablePlugHashes === undefined) {
                            return [socket.plugHash];
                        } else {
                            return socket.reusablePlugHashes;
                        }
                    });
                }
                let perkColumns = perkColumnHashes.map(column =>
                    column.map(perkHash => {
                        return {
                            name: null,
                            isGood: false,
                            hash: perkHash,
                            upgrades: []
                        }
                    }));

                let primaryStat = itemInstance.primaryStat;
                return {
                    id: item.itemInstanceId,
                    itemHash: item.itemHash,
                    name: null,
                    class: null,
                    type: null,
                    tier: null,
                    power: primaryStat !== null && primaryStat !== undefined ? primaryStat.value : null,
                    perkColumns: perkColumns,
                    comparisons: []
                };
            }).filter(item => item !== null);
        if (this.itemDefs.size > 0) {
            this.applyItemDefinitions();
        }
        if (this.perkRatings.size > 0) {
            this.applyPerkRatings();
        }
        this.compareItems();
        this.errorMessage = null;
    }

    onItemDefinitionsLoaded(itemDefs: Map<string, ItemDefinition>) {
        this.itemDefs = itemDefs;
        this.applyItemDefinitions();
        this.compareItems();
    }

    onPerkRatingsLoaded(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
        this.applyPerkRatings();
        this.compareItems();
    }

    applyItemDefinitions() {
        const armourTypes = ["Helmet", "Gauntlets", "Chest Armor", "Leg Armor", "Warlock Bond", "Hunter Cloak", "Titan Mark"];
        this.items.forEach((item, index) => {
            let itemDef = this.itemDefs.get(item.itemHash);
            if (armourTypes.includes(itemDef.itemType)) {
                item.perkColumns.forEach(column => {
                    column.forEach(perk => {
                        perk.name = "";
                        let plugDefinition = this.itemDefs.get(perk.hash);
                        if (plugDefinition !== null && plugDefinition !== undefined) {
                            perk.name = plugDefinition.name;
                        }
                    });
                });
                item.name = itemDef.name;
                item.class = itemDef.class;
                item.type = itemDef.itemType;
                item.tier = itemDef.tier;
            } else {
                this.items[index] = null;
            }
        });
        this.items = this.items.filter(item => item !== null);
    }

    applyPerkRatings() {
        this.items.forEach(item => {
            item.perkColumns.forEach(column => {
                column.forEach(perk => {
                    let perkRating = this.perkRatings.get(perk.name.toLowerCase());
                    if (perkRating !== null && perkRating !== undefined) {
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
        this.items.forEach(item => {
            let comparisons: DestinyItemComparison[] = [];
            for (let i = 0; i < this.items.length; i++) {
                const item2 = this.items[i];
                if (item.id !== item2.id) {
                    comparisons.push({
                        id: item2.id,
                        result: ComparisonService.compare(item, item2)
                    });
                }
            }
            item.comparisons = comparisons;
        });
    }

    onItemsFailedToLoad(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

// @ts-ignore: Alt.js has no TS typings defined for this usage
export default alt.createStore<ItemStoreState>(ItemStore, 'ItemStore');