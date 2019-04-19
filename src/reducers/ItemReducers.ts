import { ItemsState } from "../model/State";
import { Action } from "../actions/Actions";

const initialState : ItemsState = {
    items: [],
    itemDefs: new Map(),
    perkRatings: new Map(),
    errorMessage: null
}

export function items(state = initialState, action?: Action) : ItemsState {
    if (action) {
        switch (action.type) {
            default:
                return state;
        }
    }
    return state;
}