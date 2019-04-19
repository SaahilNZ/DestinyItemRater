export enum ItemActionType {
    REQUEST_ITEMS = 'REQUEST_ITEMS',
    REQUEST_ITEM_DEFINITIONS = 'REQUEST_ITEM_DEFINITIONS'
}

export interface RequestItemsAction {
    type: typeof ItemActionType.REQUEST_ITEMS;
}

export interface RequestItemDefinitionsAction {
    type: typeof ItemActionType.REQUEST_ITEM_DEFINITIONS;
}

export function requestItems(): RequestItemsAction {
    return {
        type: ItemActionType.REQUEST_ITEMS
    };
}

export function requestItemDefinitions(): RequestItemDefinitionsAction {
    return {
        type: ItemActionType.REQUEST_ITEM_DEFINITIONS
    };
}

export type ItemActions = RequestItemsAction | RequestItemDefinitionsAction;