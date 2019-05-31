import assert = require("assert");
import { items } from '../src/app/reducers/ItemReducers';
import { ItemsState } from "../src/app/model/State";
import { ItemActionType } from "../src/app/actions/ItemActions";
import DestinyItem from "../src/app/model/DestinyItem";
import DestinyItemDefinition from "../src/app/model/DestinyItemDefinition";
import PerkRating from "../src/app/model/PerkRating";

describe("Reducers.items()", () => {
    it("should return the initial state", () => {
        let newState = items(undefined, undefined);
        assert.strictEqual(newState.items.length, 0);
        assert.strictEqual(newState.itemDefinitions, null);
        assert.strictEqual(newState.perkRatings, null);
        assert.strictEqual(newState.errorMessage, null);
        assert.strictEqual(newState.comparisons, null);
    });

    describe("REQUEST_ITEMS", () => {
        it("should clear the list of items and retain other state", () => {
            let state = buildSampleItemsState();
            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS
            });

            assert.strictEqual(newState.items.length, 0);
            assert.strictEqual(newState.itemDefinitions.size, 1);
            assert.strictEqual(newState.perkRatings.size, 1);
            assert.strictEqual(newState.errorMessage, 'error');
        });
    });

    describe("REQUEST_ITEMS_SUCCESS", () => {
        it("should clear the error message", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: null
            });

            assert.strictEqual(newState.errorMessage, null);
        });

        it("should clear the list of items if a null profile was provided", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: null
            });

            assert.strictEqual(newState.items.length, 0);
        });

        it("should clear the list of items if all profile components are null", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: {
                    characterEquipment: null,
                    characterInventories: null,
                    itemComponents: null,
                    profileInventory: null
                }
            });

            assert.strictEqual(newState.items.length, 0);
        });

        it("should add items that are equipped on a character", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: {
                    characterEquipment: {
                        data: [
                            { items: [{ itemInstanceId: '10001', itemHash: 1 }] },
                            { items: [{ itemInstanceId: '10002', itemHash: 1 }] },
                            { items: [{ itemInstanceId: '10003', itemHash: 1 }] }
                        ]
                    },
                    characterInventories: null,
                    itemComponents: {
                        instances: {
                            data: {
                                '10001': { primaryStat: { value: 300 } },
                                '10002': { primaryStat: { value: 600 } },
                                '10003': { primaryStat: { value: 700 } }
                            }
                        },
                        sockets: null
                    },
                    profileInventory: null
                }
            });

            assert.strictEqual(newState.items.length, 3);
            assertItem(newState.items[0], '10001', 1, 300);
            assertItem(newState.items[1], '10002', 1, 600);
            assertItem(newState.items[2], '10003', 1, 700);
        });

        it("should add items that are on a character but not currently equipped", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: {
                    characterEquipment: null,
                    characterInventories: {
                        data: [
                            { items: [{ itemInstanceId: '10001', itemHash: 1 }] },
                            { items: [{ itemInstanceId: '10002', itemHash: 1 }] },
                            { items: [{ itemInstanceId: '10003', itemHash: 1 }] }
                        ]
                    },
                    itemComponents: {
                        instances: {
                            data: {
                                '10001': { primaryStat: { value: 300 } },
                                '10002': { primaryStat: { value: 600 } },
                                '10003': { primaryStat: { value: 700 } }
                            }
                        },
                        sockets: null
                    },
                    profileInventory: null
                }
            });

            assert.strictEqual(newState.items.length, 3);
            assertItem(newState.items[0], '10001', 1, 300);
            assertItem(newState.items[1], '10002', 1, 600);
            assertItem(newState.items[2], '10003', 1, 700);
        });

        it("should not add duplicate items for items in the vault", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: {
                    characterEquipment: null,

                    // items in the vault are displayed in all character's inventories
                    characterInventories: {
                        data: [
                            { items: [{ itemInstanceId: '20001', itemHash: 2 }] },
                            { items: [{ itemInstanceId: '20001', itemHash: 2 }] },
                            { items: [{ itemInstanceId: '20001', itemHash: 2 }] }
                        ]
                    },

                    itemComponents: {
                        instances: {
                            data: {
                                '20001': { primaryStat: { value: 100 } }
                            }
                        },
                        sockets: null
                    },
                    profileInventory: null
                }
            });

            assert.strictEqual(newState.items.length, 1);
            assertItem(newState.items[0], '20001', 2, 100);
        });

        it("should add items that are in the account-wide inventory", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: {
                    characterEquipment: null,
                    characterInventories: null,
                    itemComponents: {
                        instances: {
                            data: {
                                '30001': { primaryStat: { value: 310 } },
                                '30002': { primaryStat: { value: 320 } },
                                '30003': { primaryStat: { value: 330 } },
                                '30004': { primaryStat: { value: 340 } },
                                '40001': { primaryStat: { value: 400 } }
                            }
                        },
                        sockets: null
                    },
                    profileInventory: {
                        data: {
                            items: [
                                { itemInstanceId: '30001', itemHash: 3 },
                                { itemInstanceId: '30002', itemHash: 3 },
                                { itemInstanceId: '30003', itemHash: 3 },
                                { itemInstanceId: '30004', itemHash: 3 },
                                { itemInstanceId: '40001', itemHash: 4 },
                            ]
                        }
                    }
                }
            });

            assert.strictEqual(newState.items.length, 5);
            assertItem(newState.items[0], '30001', 3, 310);
            assertItem(newState.items[1], '30002', 3, 320);
            assertItem(newState.items[2], '30003', 3, 330);
            assertItem(newState.items[3], '30004', 3, 340);
            assertItem(newState.items[4], '40001', 4, 400);
        });

        it("should include non-swappable plug hashes in perk column hashes", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: {
                    characterEquipment: {
                        data: [{ items: [{ itemInstanceId: '10001', itemHash: 1 }] }]
                    },
                    characterInventories: null,
                    itemComponents: {
                        instances: {
                            data: {
                                '10001': { primaryStat: { value: 300 } },
                            }
                        },
                        sockets: {
                            data: {
                                '10001': {
                                    // 3 perk columns, each with only one choice
                                    sockets: [
                                        { plugHash: 101 },
                                        { plugHash: 201 },
                                        { plugHash: 301 }
                                    ]
                                }
                            }
                        }
                    },
                    profileInventory: null
                }
            });

            assert.strictEqual(newState.items.length, 1);
            assertItem(newState.items[0], '10001', 1, 300, [
                [101], [201], [301]
            ]);
        });

        it("should include swappable plug hashes in perk column hashes", () => {
            let state = buildSampleItemsState();
            state.items = [];

            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_SUCCESS,
                profile: {
                    characterEquipment: {
                        data: [{ items: [{ itemInstanceId: '10001', itemHash: 1 }] }]
                    },
                    characterInventories: null,
                    itemComponents: {
                        instances: {
                            data: {
                                '10001': { primaryStat: { value: 300 } },
                            }
                        },
                        sockets: {
                            data: {
                                '10001': {
                                    // 2 perk columns, each with three choices
                                    sockets: [
                                        { reusablePlugHashes: [101, 102, 103] },
                                        { reusablePlugHashes: [201, 202, 203] }
                                    ]
                                }
                            }
                        }
                    },
                    profileInventory: null
                }
            });

            assert.strictEqual(newState.items.length, 1);
            assertItem(newState.items[0], '10001', 1, 300, [
                [101, 102, 103],
                [201, 202, 203]
            ]);
        });
    });

    describe("REQUEST_ITEMS_FAILED", () => {
        it("should set the error message and retain other state", () => {
            let state = buildSampleItemsState();
            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEMS_FAILURE,
                errorMessage: 'error: request items failed'
            });

            assert.strictEqual(newState.items.length, 1);
            assert.strictEqual(newState.itemDefinitions.size, 1);
            assert.strictEqual(newState.perkRatings.size, 1);
            assert.strictEqual(newState.errorMessage, 'error: request items failed');
        });
    });

    describe("REQUEST_ITEM_DEFINITIONS", () => {
        it("should clear the item definitions and retain other state", () => {
            let state = buildSampleItemsState();
            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEM_DEFINITIONS
            });

            assert.strictEqual(newState.items.length, 1);
            assert.strictEqual(newState.itemDefinitions, null);
            assert.strictEqual(newState.perkRatings.size, 1);
            assert.strictEqual(newState.errorMessage, 'error');
        });
    });

    describe("REQUEST_ITEM_DEFINITIONS_SUCCESS", () => {
        it("should set the item definitions and retain other state", () => {
            let state = buildSampleItemsState();

            let definitions = new Map<number, DestinyItemDefinition>();
            definitions.set(1, {
                hash: 1,
                name: 'Graviton Forfeit',
                itemType: 'Helmet',
                class: 'Hunter',
                tier: 'Exotic'
            });
            definitions.set(2, {
                hash: 2,
                name: 'Celestial Nighthawk',
                itemType: 'Helmet',
                class: 'Hunter',
                tier: 'Exotic'
            });
            let newState = items(state, {
                type: ItemActionType.REQUEST_ITEM_DEFINITIONS_SUCCESS,
                definitions: definitions
            });

            assert.strictEqual(newState.items.length, 1);
            assert.strictEqual(newState.itemDefinitions.size, 2);
            assert.strictEqual(newState.perkRatings.size, 1);
            assert.strictEqual(newState.errorMessage, 'error');
        });
    });

    describe("REQUEST_PERK_RATINGS", () => {
        it("should clear the perk ratings and retain other state", () => {
            let state = buildSampleItemsState();
            let newState = items(state, {
                type: ItemActionType.REQUEST_PERK_RATINGS
            });

            assert.strictEqual(newState.items.length, 1);
            assert.strictEqual(newState.itemDefinitions.size, 1);
            assert.strictEqual(newState.perkRatings, null);
            assert.strictEqual(newState.errorMessage, 'error');
        });
    });

    describe("REQUEST_PERK_RATINGS_SUCCESS", () => {
        it("should set the perk ratings and retain other state", () => {
            let state = buildSampleItemsState();

            let perkRatings = new Map<string, PerkRating>();
            perkRatings.set('1', {
                name: 'Ashes to Assets',
                isGoodByMode: {
                    'PvE': true,
                    'PvP': true
                },
                upgrades: []
            });
            perkRatings.set('2', {
                name: 'Sniper Rifle Reserves',
                isGoodByMode: {
                    'PvE': true,
                    'PvP': true
                },
                upgrades: []
            });
            let newState = items(state, {
                type: ItemActionType.REQUEST_PERK_RATINGS_SUCCESS,
                perkRatings: perkRatings
            });

            assert.strictEqual(newState.items.length, 1);
            assert.strictEqual(newState.itemDefinitions.size, 1);
            assert.strictEqual(newState.perkRatings.size, 2);
            assert.strictEqual(newState.errorMessage, 'error');
        });
    });

    describe("COMPARE_ITEMS", () => {
        it("should clear out the comparisons if item definitions are not loaded", () => {
            let state = buildSampleItemsState();
            state.itemDefinitions = null;

            let newState = items(state, {
                type: ItemActionType.COMPARE_ITEMS
            });

            assert.strictEqual(newState.items.length, 1);
            assert.strictEqual(newState.itemDefinitions, null);
            assert.strictEqual(newState.perkRatings.size, 1);
            assert.strictEqual(newState.errorMessage, 'error');
            assert.strictEqual(newState.comparisons, null);
        });

        it("should clear out the comparisons if perk ratings are not loaded", () => {
            let state = buildSampleItemsState();
            state.perkRatings = null;

            let newState = items(state, {
                type: ItemActionType.COMPARE_ITEMS
            });

            assert.strictEqual(newState.items.length, 1);
            assert.strictEqual(newState.itemDefinitions.size, 1);
            assert.strictEqual(newState.perkRatings, null);
            assert.strictEqual(newState.errorMessage, 'error');
            assert.strictEqual(newState.comparisons, null);
        });

        it("should add a comparison for each item if item definitions and perk ratings are loaded", () => {
            let state = buildSampleItemsState();
            state.items.push({
                id: '2',
                itemHash: 1,
                power: 600,
                perkColumnHashes: []
            });

            let newState = items(state, {
                type: ItemActionType.COMPARE_ITEMS
            });

            assert.strictEqual(newState.items.length, 2);
            assert.strictEqual(newState.itemDefinitions.size, 1);
            assert.strictEqual(newState.perkRatings.size, 1);
            assert.strictEqual(newState.errorMessage, 'error');

            assert.strictEqual(newState.comparisons.size, 2);
            assert.strictEqual(newState.comparisons.get('1').length, 1);
            assert.strictEqual(newState.comparisons.get('1')[0].id, '2');
            assert.strictEqual(newState.comparisons.get('2').length, 1);
            assert.strictEqual(newState.comparisons.get('2')[0].id, '1');
        });
    });
});

function buildSampleItemsState(): ItemsState {
    let state: ItemsState = {
        items: [{
            id: '1',
            itemHash: 1,
            power: 700,
            perkColumnHashes: []
        }],
        itemDefinitions: new Map(),
        perkRatings: new Map(),
        comparisons: new Map(),
        itemTags: new Map(),
        errorMessage: 'error',
    };
    state.itemDefinitions.set(1, {
        hash: 1,
        name: 'Graviton Forfeit',
        itemType: 'Helmet',
        class: 'Hunter',
        tier: 'Exotic'
    });
    state.perkRatings.set('1', {
        name: 'Ashes to Assets',
        isGoodByMode: {
            'PvE': true,
            'PvP': true
        },
        upgrades: []
    });
    return state;
}

function assertItem(item: DestinyItem, id: string, hash: number, power: number, perkColumnHashes?: number[][]) {
    assert.strictEqual(item.id, id);
    assert.strictEqual(item.itemHash, hash);

    if (power) assert.strictEqual(item.power, power);

    if (perkColumnHashes) {
        // does it have the correct number of columns?
        assert.strictEqual(item.perkColumnHashes.length, perkColumnHashes.length);

        // check as many columns as we can
        let numColsToCheck = Math.min(item.perkColumnHashes.length, perkColumnHashes.length);
        for (let i = 0; i < numColsToCheck; i++) {
            const actualColumn = item.perkColumnHashes[i];
            const expectedColumn = perkColumnHashes[i];

            // does the column have the correct number of perks (rows)?
            assert.strictEqual(actualColumn.length, expectedColumn.length);

            // check as many perks as we can
            let numRowsToCheck = Math.min(actualColumn.length, expectedColumn.length);
            for (let j = 0; j < numRowsToCheck; j++) {
                assert.strictEqual(actualColumn[j], expectedColumn[j]);
            }
        }
    }
}