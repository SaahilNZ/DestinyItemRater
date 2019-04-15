import assert = require("assert");
import { accounts } from '../src/reducers/AccountReducers';
import { ActionType } from "../src/actions/Actions";
import { AccountState } from "../src/model/State";
import DestinyAccount from "../src/model/DestinyAccount";

describe("Reducers", () => {
    describe("accounts()", () => {
        it("should return the initial state", () => {
            let newState = accounts(undefined, undefined);
            assert.strictEqual(newState.allAccounts.length, 0);
            assert.strictEqual(newState.selectedAccount, null);
        });

        describe("SELECT_ACCOUNT", () => {
            it("should throw an error if no accounts are loaded", () => {
                assert.throws(() => {
                    accounts(undefined, {
                        type: ActionType.SELECT_ACCOUNT,
                        accountId: "12345"
                    });
                }, {
                    name: "MissingAccountError",
                    message: "No account found with membership id '12345'.",
                    info: {
                        accountId: "12345",
                        accountState: {
                            allAccounts: [],
                            selectedAccount: null
                        }
                    }
                })
            });

            it("should throw an error if a non-existent account is selected", () => {
                let state : AccountState = {
                    allAccounts: [
                        new DestinyAccount("11111", 1, "Test 1"),
                        new DestinyAccount("22222", 2, "Test 2"),
                        new DestinyAccount("33333", 4, "Test 3")
                    ],
                    selectedAccount: null
                }
                assert.throws(() => {
                    accounts(state, {
                        type: ActionType.SELECT_ACCOUNT,
                        accountId: "44444"
                    });
                }, {
                    name: "MissingAccountError",
                    message: "No account found with membership id '44444'.",
                    info: {
                        accountId: "44444",
                        accountState: state
                    }
                });
            });

            it("should select the account with the specified id", () => {
                let state : AccountState = {
                    allAccounts: [
                        new DestinyAccount("11111", 1, "Test 1"),
                        new DestinyAccount("22222", 2, "Test 2"),
                        new DestinyAccount("33333", 4, "Test 3")
                    ],
                    selectedAccount: null
                }
                let newState = accounts(state, {
                    type: ActionType.SELECT_ACCOUNT,
                    accountId: "22222"
                });
                
                assert.strictEqual(newState.allAccounts.length, 3);
                assert.strictEqual(newState.selectedAccount.displayName, "Test 2");
                assert.strictEqual(newState.selectedAccount.membershipId, "22222");
                assert.strictEqual(newState.selectedAccount.membershipType, 2);
            });
        });
    });
});