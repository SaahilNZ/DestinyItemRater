import ItemActions from '../actions/ItemActions';
import alt from "../alt";
import ItemDefinitionActions from '../actions/ItemDefinitionActions';
import PerkActions from '../actions/PerkActions';
import ComparisonService from '../services/ComparisonService';

const armorTypeHashes = [
    138197802,      // General
    3448274439,     // Helmet
    3551918588,     // Gauntlets
    14239492,       // Chest Armor
    20886954,       // Leg Armor,
    1585787867      // Class Armor
];

class ItemStore {
    constructor() {
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
        this.itemDefs = new Map();
    }

    onPerkRatingsFetching() {
        this.perkRatings = new Map();
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

                let primaryPerkHashes = [];
                let secondaryPerkHashes = [];
                let itemSockets = bungieResponse.Response.itemComponents.sockets.data[item.itemInstanceId];
                if (itemSockets) {
                    let primaryColumn = 5;
                    let secondaryColumn = 6;

                    // hack for Gambit Prime gear
                    let primarySocket = itemSockets.sockets[primaryColumn];
                    if (primarySocket && primarySocket.plugHash == 4248210736) { // Default Shader
                        primaryColumn++;
                        secondaryColumn++;
                    }

                    if (itemSockets.sockets[primaryColumn]) {
                        let socket = itemSockets.sockets[primaryColumn];
                        if (socket.reusablePlugHashes === null || socket.reusablePlugHashes === undefined) {
                            primaryPerkHashes = [socket.plugHash];
                        } else {
                            primaryPerkHashes = socket.reusablePlugHashes;
                        }
                    }
                    if (itemSockets.sockets[secondaryColumn]) {
                        let socket = itemSockets.sockets[secondaryColumn];
                        if (socket.reusablePlugHashes === null || socket.reusablePlugHashes === undefined) {
                            secondaryPerkHashes = [socket.plugHash];
                        } else {
                            secondaryPerkHashes = socket.reusablePlugHashes;
                        }
                    }
                }
                let primaryPerks = primaryPerkHashes.map(perkHash => {
                    return {
                        name: null,
                        isGood: false,
                        hash: perkHash,
                        upgrades: []
                    };
                });
                let secondaryPerks = secondaryPerkHashes.map(perkHash => {
                    return {
                        name: null,
                        isGood: false,
                        hash: perkHash,
                        upgrades: []
                    };
                });
                let primaryStat = itemInstance.primaryStat;
                return {
                    id: item.itemInstanceId,
                    itemHash: item.itemHash,
                    name: null,
                    class: null,
                    type: null,
                    tier: null,
                    power: primaryStat !== null && primaryStat !== undefined ? primaryStat.value : null,
                    primaryPerks: primaryPerks,
                    secondaryPerks: secondaryPerks,
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

    onItemDefinitionsLoaded(itemDefs) {
        this.itemDefs = itemDefs;
        this.applyItemDefinitions();
        this.compareItems();
    }

    onPerkRatingsLoaded(perkRatings) {
        this.perkRatings = perkRatings;
        this.applyPerkRatings();
        this.compareItems();
    }

    applyItemDefinitions() {
        const armourTypes = ["Helmet", "Gauntlets", "Chest Armor", "Leg Armor", "Warlock Bond", "Hunter Cloak", "Titan Mark"];
        this.items.forEach((item, index) => {
            let itemDef = this.itemDefs.get(item.itemHash);
            if (armourTypes.includes(itemDef.itemType)) {
                item.primaryPerks.forEach(perk => {
                    perk.name = "";
                    let plugDefinition = this.itemDefs.get(perk.hash);
                    if (plugDefinition !== null && plugDefinition !== undefined) {
                        perk.name = plugDefinition.name;
                    }
                });
                item.secondaryPerks.forEach(perk => {
                    perk.name = "";
                    let plugDefinition = this.itemDefs.get(perk.hash);
                    if (plugDefinition !== null && plugDefinition !== undefined) {
                        perk.name = plugDefinition.name;
                    }
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
            item.primaryPerks.forEach(perk => {
                let perkRating = this.perkRatings.get(perk.name.toLowerCase());
                if (perkRating !== null && perkRating !== undefined) {
                    perk.isGood = perkRating.isGood;
                    perk.upgrades = perkRating.upgrades;
                } else {
                    perk = null;
                }
            });
            item.secondaryPerks.forEach(perk => {
                let perkRating = this.perkRatings.get(perk.name.toLowerCase());
                if (perkRating !== null && perkRating !== undefined) {
                    perk.isGood = perkRating.isGood;
                    perk.upgrades = perkRating.upgrades;
                } else {
                    perk = null;
                }
            });
        });
    }

    compareItems() {
        this.items.forEach(item => {
            let comparisons = [];
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

export default alt.createStore(ItemStore, 'ItemStore');