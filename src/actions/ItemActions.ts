export enum ItemActionType {
    REQUEST_ITEMS = 'REQUEST_ITEMS',
    REQUEST_ITEMS_FAILURE = 'REQUEST_ITEMS_FAILURE',

    REQUEST_ITEM_DEFINITIONS = 'REQUEST_ITEM_DEFINITIONS',

    REQUEST_PERK_RATINGS = 'REQUEST_PERK_RATINGS'
}

export interface RequestItemsAction {
    type: typeof ItemActionType.REQUEST_ITEMS;
}
export interface RequestItemsFailureAction {
    type: typeof ItemActionType.REQUEST_ITEMS_FAILURE;
    errorMessage: string;
}

export interface RequestItemDefinitionsAction {
    type: typeof ItemActionType.REQUEST_ITEM_DEFINITIONS;
}

export interface RequestPerkRatingsAction {
    type: typeof ItemActionType.REQUEST_PERK_RATINGS;
}

export function requestItems(): RequestItemsAction {
    return {
        type: ItemActionType.REQUEST_ITEMS
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

export function requestPerkRatings(): RequestPerkRatingsAction {
    return {
        type: ItemActionType.REQUEST_PERK_RATINGS
    };
}

export type ItemActions =
    RequestItemsAction | RequestItemsFailureAction
    | RequestItemDefinitionsAction
    | RequestPerkRatingsAction;