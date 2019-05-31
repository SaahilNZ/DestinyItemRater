export enum AccountActionType {
    SELECT_ACCOUNT = 'SELECT_ACCOUNT'
}

export interface SelectAccountAction {
    type: typeof AccountActionType.SELECT_ACCOUNT;
    accountId: string;
}

export function selectAccount(accountId: string): SelectAccountAction {
    return {
        type: AccountActionType.SELECT_ACCOUNT,
        accountId
    };
}

export type AccountActions = SelectAccountAction;