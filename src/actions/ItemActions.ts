import BungieDestinyProfile from '../model/bungie/BungieDestinyProfile';
import DestinyItemDefinition from '../model/DestinyItemDefinition';
import PerkRating from '../model/PerkRating';

export enum ItemActionType {
    REQUEST_ITEMS = 'REQUEST_ITEMS',
    REQUEST_ITEMS_SUCCESS = 'REQUEST_ITEMS_SUCCESS',
    REQUEST_ITEMS_FAILURE = 'REQUEST_ITEMS_FAILURE',

    REQUEST_ITEM_DEFINITIONS = 'REQUEST_ITEM_DEFINITIONS',
    REQUEST_ITEM_DEFINITIONS_SUCCESS = 'REQUEST_ITEM_DEFINITIONS_SUCCESS',

    REQUEST_PERK_RATINGS = 'REQUEST_PERK_RATINGS',
    REQUEST_PERK_RATINGS_SUCCESS = 'REQUEST_PERK_RATINGS_SUCCESS',
}

export interface RequestItemsAction {
    type: typeof ItemActionType.REQUEST_ITEMS;
}
export interface RequestItemsSuccessAction {
    type: typeof ItemActionType.REQUEST_ITEMS_SUCCESS;
    profile: BungieDestinyProfile;
}
export interface RequestItemsFailureAction {
    type: typeof ItemActionType.REQUEST_ITEMS_FAILURE;
    errorMessage: string;
}

export interface RequestItemDefinitionsAction {
    type: typeof ItemActionType.REQUEST_ITEM_DEFINITIONS;
}
export interface RequestItemDefinitionsSuccessAction {
    type: typeof ItemActionType.REQUEST_ITEM_DEFINITIONS_SUCCESS;
    definitions: Map<string, DestinyItemDefinition>;
}

export interface RequestPerkRatingsAction {
    type: typeof ItemActionType.REQUEST_PERK_RATINGS;
}
export interface RequestPerkRatingsSuccessAction {
    type: typeof ItemActionType.REQUEST_PERK_RATINGS_SUCCESS;
    perkRatings: Map<string, PerkRating>;
}

export function requestItems(): RequestItemsAction {
    return {
        type: ItemActionType.REQUEST_ITEMS
    };
}
export function requestItemsSuccess(profile: BungieDestinyProfile): RequestItemsSuccessAction {
    return {
        type: ItemActionType.REQUEST_ITEMS_SUCCESS,
        profile: profile
    };
}
export function requestItemsFailure(errorMessage: string): RequestItemsFailureAction {
    return {
        type: ItemActionType.REQUEST_ITEMS_FAILURE,
        errorMessage: errorMessage
    };
}

export function requestItemDefinitions(): RequestItemDefinitionsAction {
    return {
        type: ItemActionType.REQUEST_ITEM_DEFINITIONS
    };
}
export function requestItemDefinitionsSuccess(definitions: Map<string, DestinyItemDefinition>): RequestItemDefinitionsSuccessAction {
    return {
        type: ItemActionType.REQUEST_ITEM_DEFINITIONS_SUCCESS,
        definitions: definitions
    };
}

export function requestPerkRatings(): RequestPerkRatingsAction {
    return {
        type: ItemActionType.REQUEST_PERK_RATINGS
    };
}
export function requestPerkRatingsSuccess(perkRatings: Map<string, PerkRating>): RequestPerkRatingsSuccessAction {
    return {
        type: ItemActionType.REQUEST_PERK_RATINGS_SUCCESS,
        perkRatings: perkRatings
    };
}

export type ItemActions =
    RequestItemsAction | RequestItemsSuccessAction | RequestItemsFailureAction
    | RequestItemDefinitionsAction | RequestItemDefinitionsSuccessAction
    | RequestPerkRatingsAction | RequestPerkRatingsSuccessAction;