import { AccountState } from "./State";

interface MissingAccountErrorInfo {
    accountId: string;
    accountState: AccountState;
}

export class MissingAccountError extends Error {
    info: MissingAccountErrorInfo;
    constructor(accountId: string, accountState: AccountState, message?: string) {
        super(message);
        this.info = {
            accountId: accountId,
            accountState: accountState
        }
        this.name = "MissingAccountError";
    }
}