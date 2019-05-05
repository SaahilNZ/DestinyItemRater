import { ItemsState } from "../model/State";
import { Action } from "../actions/Actions";
import { ItemActionType } from "../actions/ItemActions";

const initialState: ItemsState = {
    items: [],
    itemDefinitions: new Map(),
    perkRatings: new Map(),
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
            default:
                return state;
        }
    }
    return state;
}