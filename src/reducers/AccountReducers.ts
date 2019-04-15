import { AccountState } from "../model/State";
import { Action, ActionType } from "../actions/Actions";
import { MissingAccountError } from "../model/Errors";

const initialState : AccountState = {
    allAccounts: [],
    selectedAccount: null
}

export function accounts(state = initialState, action?: Action) : AccountState {
    if (action) {
        switch (action.type) {
            case ActionType.SELECT_ACCOUNT:
                let selectedAccount = state.allAccounts
                    .find(account => account.membershipId === action.accountId);
                if (!selectedAccount) {
                    throw new MissingAccountError(action.accountId, state,
                        `No account found with membership id '${action.accountId}'.`);
                }
                return {
                    allAccounts: state.allAccounts.concat(),
                    selectedAccount: selectedAccount
                }
            default:
                return state;
        }
    }
    return state;
}