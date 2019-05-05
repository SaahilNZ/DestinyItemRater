import assert = require("assert");
import { accounts } from '../src/reducers/AccountReducers';
import { items } from '../src/reducers/ItemReducers';
import { ActionType } from "../src/actions/Actions";
import { AccountState, ItemsState } from "../src/model/State";
import DestinyAccount from "../src/model/DestinyAccount";
import { ItemActionType } from "../src/actions/ItemActions";

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
                let state: AccountState = {
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
                let state: AccountState = {
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

    describe("items()", () => {
        it("should return the initial state", () => {
            let newState = items(undefined, undefined);
            assert.strictEqual(newState.items.length, 0);
            assert.strictEqual(newState.itemDefinitions.size, 0);
            assert.strictEqual(newState.perkRatings, null);
            assert.strictEqual(newState.errorMessage, null);
        });

        describe("REQUEST_ITEMS", () => {
            it("should clear the list of items and retain other state", () => {
                let state: ItemsState = {
                    items: [{
                        id: '1',
                        itemHash: '1',
                        power: 700,
                        perkColumnHashes: [],
                        perkColumns: [],
                        group: 'armor'
                    }],
                    itemDefinitions: new Map(),
                    perkRatings: new Map(),
                    comparisons: new Map(),
                    errorMessage: 'error',
                };
                state.itemDefinitions.set('1', {
                    hash: 1,
                    name: 'Graviton Forfeit',
                    itemType: 'Helmet',
                    class: 'Hunter',
                    tier: 'Exotic'
                });
                state.perkRatings.set('1', {
                    name: 'Ashes to Assets',
                    isGood: true,
                    upgrades: []
                });

                let newState = items(state, {
                    type: ItemActionType.REQUEST_ITEMS
                });

                assert.strictEqual(newState.items.length, 0);
                assert.strictEqual(newState.itemDefinitions.size, 1);
                assert.strictEqual(newState.perkRatings.size, 1);
                assert.strictEqual(newState.errorMessage, 'error');
            });
        });

        describe("REQUEST_ITEMS_FAILED", () => {
            it("should set the error message and retain other state", () => {
                let state: ItemsState = {
                    items: [{
                        id: '1',
                        itemHash: '1',
                        power: 700,
                        perkColumnHashes: [],
                        perkColumns: [],
                        group: 'armor'
                    }],
                    itemDefinitions: new Map(),
                    perkRatings: new Map(),
                    comparisons: new Map(),
                    errorMessage: null,
                };
                state.itemDefinitions.set('1', {
                    hash: 1,
                    name: 'Graviton Forfeit',
                    itemType: 'Helmet',
                    class: 'Hunter',
                    tier: 'Exotic'
                });
                state.perkRatings.set('1', {
                    name: 'Ashes to Assets',
                    isGood: true,
                    upgrades: []
                });

                let newState = items(state, {
                    type: ItemActionType.REQUEST_ITEMS_FAILURE,
                    errorMessage: 'error'
                });

                assert.strictEqual(newState.items.length, 1);
                assert.strictEqual(newState.itemDefinitions.size, 1);
                assert.strictEqual(newState.perkRatings.size, 1);
                assert.strictEqual(newState.errorMessage, 'error');
            });
        });

        describe("REQUEST_ITEM_DEFINITIONS", () => {
            it("should clear the item definitions and retain other state", () => {
                let state: ItemsState = {
                    items: [{
                        id: '1',
                        itemHash: '1',
                        power: 700,
                        perkColumnHashes: [],
                        perkColumns: [],
                        group: 'armor'
                    }],
                    itemDefinitions: new Map(),
                    perkRatings: new Map(),
                    comparisons: new Map(),
                    errorMessage: 'error',
                };
                state.itemDefinitions.set('1', {
                    hash: 1,
                    name: 'Graviton Forfeit',
                    itemType: 'Helmet',
                    class: 'Hunter',
                    tier: 'Exotic'
                });
                state.perkRatings.set('1', {
                    name: 'Ashes to Assets',
                    isGood: true,
                    upgrades: []
                });

                let newState = items(state, {
                    type: ItemActionType.REQUEST_ITEM_DEFINITIONS
                });

                assert.strictEqual(newState.items.length, 1);
                assert.strictEqual(newState.itemDefinitions.size, 0);
                assert.strictEqual(newState.perkRatings.size, 1);
                assert.strictEqual(newState.errorMessage, 'error');
            });
        });
    });
});