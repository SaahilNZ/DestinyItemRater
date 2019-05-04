import { MainAppState } from "../model/State";
import { accounts } from "../reducers/AccountReducers";
import PerkRating from "../model/PerkRating";
import { Action } from "../actions/Actions";
import { items } from "../reducers/ItemReducers";

class AppStore {
    private state: MainAppState;

    constructor() {
        this.state = this.reduce(undefined, undefined);
    }

    dispatch(action: Action): MainAppState {
        this.state = this.reduce(this.state, action);
        return this.state;
    }

    reduce(currentState: MainAppState, action: Action) {
        return {
            signedIn: false,
            accounts: accounts(currentState && currentState.accounts, action),
            items: items(currentState && currentState.items, action),
            showAllItems: true,
            showBadItems: false,
            showWeapons: false,
            showSearch: false,
            showPerkRater: false,
            junkSearchString: "",
            infuseSearchString: "",
            copyResult: "",
            perkRatings: new Map<string, PerkRating>()
        }
    }

    getState(): MainAppState {
        return this.state;
    }

    // todo: remove this
    setState(newState) {
        Object.assign(this.state, newState);
    }
}

export default new AppStore();