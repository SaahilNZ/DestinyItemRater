import { AccountActions, AccountActionType } from "./AccountActions";

export type Action = AccountActions;
export const ActionType = {
    ...AccountActionType
};