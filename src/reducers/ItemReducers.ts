import { ItemsState } from "../model/State";
import { Action } from "../actions/Actions";
import { ItemActionType } from "../actions/ItemActions";
import DestinyItem from "../model/DestinyItem";
import BungieDestinyProfile from '../model/bungie/BungieDestinyProfile';
import BungieDestinyItem from "../model/bungie/BungieDestinyItem";

const initialState: ItemsState = {
    items: [],
    itemDefinitions: new Map(),
    perkRatings: null,
    comparisons: new Map(),
    errorMessage: null
}

export function items(state = initialState, action?: Action): ItemsState {
    if (action) {
        switch (action.type) {
            case ItemActionType.REQUEST_ITEMS:
                return {
                    ...state,
                    items: []
                };
            case ItemActionType.REQUEST_ITEMS_SUCCESS:
                return {
                    ...state,
                    items: buildItems(action.profile)
                };
            case ItemActionType.REQUEST_ITEMS_FAILURE:
                return {
                    ...state,
                    errorMessage: action.errorMessage
                };

            case ItemActionType.REQUEST_ITEM_DEFINITIONS:
                return {
                    ...state,
                    itemDefinitions: new Map()
                };

            case ItemActionType.REQUEST_PERK_RATINGS:
                return {
                    ...state,
                    perkRatings: null
                };

            default:
                return state;
        }
    }
    return state;
}

function buildItems(profile: BungieDestinyProfile): DestinyItem[] {
    if (!profile || !profile.itemComponents) return [];

    let rawItems: BungieDestinyItem[] = [];

    // add items in account-wide inventory
    if (profile.profileInventory) {
        rawItems.push(...profile.profileInventory.data.items);
    }

    // add items on a character but not equipped or in the vault
    if (profile.characterInventories) {
        for (let i in profile.characterInventories.data) {
            let characterInventory = profile.characterInventories.data[i];
            rawItems.push(...characterInventory.items);
        }
    }

    // add items equipped on a character
    if (profile.characterEquipment) {
        for (let e in profile.characterEquipment.data) {
            let characterEquipment = profile.characterEquipment.data[e];
            rawItems.push(...characterEquipment.items);
        }
    }

    // remove duplicates
    let existingInstanceIds: string[] = [];
    let uniqueItems: BungieDestinyItem[] = [];
    rawItems.forEach(item => {
        if (!existingInstanceIds.includes(item.itemInstanceId)) {
            existingInstanceIds.push(item.itemInstanceId);
            uniqueItems.push(item);
        }
    });

    return uniqueItems.filter(item => item.itemInstanceId)
        .map(item => {
            let itemInstance = profile.itemComponents.instances.data[item.itemInstanceId];
            if (!itemInstance) return null;

            let perkColumnHashes: string[][] = [];
            if (profile.itemComponents.sockets) {
                let itemSockets = profile.itemComponents.sockets.data[item.itemInstanceId];
                perkColumnHashes =
                    (itemSockets && itemSockets.sockets.map(socket => socket.reusablePlugHashes || [socket.plugHash])) || [];
            }

            let primaryStat = itemInstance.primaryStat;
            return {
                id: item.itemInstanceId,
                itemHash: item.itemHash,
                power: primaryStat && primaryStat.value,
                perkColumnHashes: perkColumnHashes
            };
        }).filter(item => item);
}