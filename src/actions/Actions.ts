import { AccountActions, AccountActionType } from "./AccountActions";
import { ItemActionType, ItemActions } from "./ItemActions";

export type Action = AccountActions | ItemActions;
export const ActionType = {
    ...AccountActionType,
    ...ItemActionType
};