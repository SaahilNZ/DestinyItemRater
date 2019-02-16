import ItemActions from '../actions/ItemActions';
import alt from "../alt";
import ItemDefinitionStore from './ItemDefinitionStore';
import PerkStore from './PerkStore';

class ItemStore {
    constructor() {
        this.items = [];
        this.errorMessage = null;
        this.bindListeners({
            onItemsFetching: ItemActions.fetchItems,

            onItemsUpdated: ItemActions.onItemsUpdated,
            onItemsFailedToLoad: ItemActions.onItemsFailedToLoad
        })        
    }

    onItemsUpdated(bungieResponse) {
        this.waitFor([PerkStore, ItemDefinitionStore]);
        let itemDefinitions = ItemDefinitionStore.getState().itemDefinitions;
        let allPerks = PerkStore.getState().perks;
        const armourTypes = ["Helmet", "Gauntlets", "Chest Armor", "Leg Armor", "Warlock Bond", "Hunter Cloak", "Titan Mark"]
        
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
            .map((item) => {
                let itemDef = itemDefinitions.get(item.itemHash);
                if (itemDef === null || itemDef === undefined) return null;
                let itemInstance = bungieResponse.Response.itemComponents.instances.data[item.itemInstanceId];
                if (itemInstance === null || itemInstance === undefined) return null;
                if (armourTypes.includes(itemDef.itemType)) {
                    let primaryPerkNames = [];
                    let secondaryPerkNames = [];
                    let primaryColumn = 5;
                    let secondaryColumn = 6;
                    let itemSockets = bungieResponse.Response.itemComponents.sockets.data[item.itemInstanceId];
                    if (itemSockets) {
                        if (itemSockets.sockets[primaryColumn]) {
                            let socket = itemSockets.sockets[primaryColumn];
                            if (socket.reusablePlugHashes === null || socket.reusablePlugHashes === undefined) {
                                let plugName = "";
                                let plugDefinition = itemDefinitions.get(socket.plugHash);
                                if (plugDefinition !== null && plugDefinition !== undefined) {
                                    plugName = plugDefinition.name;
                                }
                                primaryPerkNames = [plugName];
                            } else {
                                primaryPerkNames = socket.reusablePlugHashes.map(
                                    plugHash => {
                                        let plugDefinition = itemDefinitions.get(plugHash);
                                        if (plugDefinition === null || plugDefinition === undefined) {
                                            return null;
                                        }
                                        return plugDefinition.name;
                                    }
                                );
                            }
                        }
                        if (itemSockets.sockets[secondaryColumn]) {
                            let socket = itemSockets.sockets[secondaryColumn];
                            if (socket.reusablePlugHashes === null || socket.reusablePlugHashes === undefined) {
                                let plugName = "";
                                let plugDefinition = itemDefinitions.get(socket.plugHash);
                                if (plugDefinition !== null && plugDefinition !== undefined) {
                                    plugName = plugDefinition.name;
                                }
                                secondaryPerkNames = [plugName];
                            } else {
                                secondaryPerkNames = socket.reusablePlugHashes.map(
                                    plugHash => {
                                        let plugDefinition = itemDefinitions.get(plugHash);
                                        if (plugDefinition === null || plugDefinition === undefined) {
                                            return null;
                                        }
                                        return plugDefinition.name;
                                    }
                                );
                            }
                        }
                    }

                    let primaryPerks = primaryPerkNames.filter(name => name !== "" && name !== null && name !== undefined)
                                    .map(perkName => allPerks.get(perkName.toLowerCase()));
                    let secondaryPerks = secondaryPerkNames.filter(name => name !== "" && name !== null && name !== undefined)
                                    .map(perkName => allPerks.get(perkName.toLowerCase()));
                    return {
                        id: item.itemInstanceId,
                        itemHash: item.itemHash,
                        name: itemDef.name,
                        class: itemDef.class,
                        type: itemDef.itemType,
                        tier: itemDef.tier,
                        power: itemInstance.primaryStat.value,
                        primaryPerks: primaryPerks,
                        secondaryPerks: secondaryPerks,
                        comparisons: null
                    };
                }
                return null;
            }).filter(item => item !== null);
        this.errorMessage = null;
    }

    onItemsFetching() {
        this.items = [];
    }

    onItemsFailedToLoad(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

export default alt.createStore(ItemStore, 'ItemStore');