import { ItemsState } from "../model/State";
import { Action } from "../actions/Actions";
import { ItemActionType } from "../actions/ItemActions";
import DestinyItem from "../model/DestinyItem";
import BungieDestinyProfile from '../model/bungie/BungieDestinyProfile';
import BungieDestinyItem from "../model/bungie/BungieDestinyItem";
import DestinyItemComparison from "../model/DestinyItemComparison";
import DestinyItemDefinition from "../model/DestinyItemDefinition";
import PerkRating from "../model/PerkRating";
import ComparisonService from "../services/ComparisonService";
import { buildItemContainer } from "../model/DestinyItemContainer";
import { WeaponPerkRatings, getWeaponPerkRatings } from "../model/WeaponPerkRating";

const initialState: ItemsState = {
    items: [],
    itemDefinitions: null,
    perkRatings: null,
    comparisons: null,
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
                    items: buildItems(action.profile),
                    errorMessage: null
                };
            case ItemActionType.REQUEST_ITEMS_FAILURE:
                return {
                    ...state,
                    errorMessage: action.errorMessage
                };

            case ItemActionType.REQUEST_ITEM_DEFINITIONS:
                return {
                    ...state,
                    itemDefinitions: null
                };
            case ItemActionType.REQUEST_ITEM_DEFINITIONS_SUCCESS:
                return {
                    ...state,
                    itemDefinitions: action.definitions
                };

            case ItemActionType.REQUEST_PERK_RATINGS:
                return {
                    ...state,
                    perkRatings: null
                };
            case ItemActionType.REQUEST_PERK_RATINGS_SUCCESS:
                return {
                    ...state,
                    perkRatings: action.perkRatings
                };

            case ItemActionType.COMPARE_ITEMS:
                return {
                    ...state,
                    comparisons: compareItems(state.items, state.itemDefinitions, state.perkRatings,
                        getWeaponPerkRatings())
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
                if (itemSockets) {
                    perkColumnHashes = itemSockets.sockets.map(socket =>
                        socket.reusablePlugHashes
                        || (socket.plugHash && [socket.plugHash])
                        || []);
                }
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

function compareItems(items: DestinyItem[],
    itemDefs: Map<string, DestinyItemDefinition>,
    perkRatings: Map<string, PerkRating>, weaponPerkRatings: WeaponPerkRatings)
    : Map<string, DestinyItemComparison[]> {

    if (perkRatings && itemDefs) {
        let containers = items.map(item =>
            buildItemContainer(item, itemDefs, new Map(), perkRatings, weaponPerkRatings, new Map()))
            .filter(container => container);
        return ComparisonService.compareAll(containers, perkRatings, weaponPerkRatings);
    }
    return null;
}