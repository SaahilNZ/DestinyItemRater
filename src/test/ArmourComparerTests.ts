import TestHelper from "./TestHelper";
import assert from "assert";
import ArmourComparer from "../app/services/ArmourComparer";
import ItemComparisonResult from "../app/services/ItemComparisonResult";
import { armourComparerTest, newItem, newPerk } from './MockItemBuilder';

describe("ArmourComparer", () => {
    describe("compare()", () => {
        TestHelper.getPermutations(['hunter', 'warlock', 'titan']).forEach((classes) => {
            let class1 = classes[0];
            let class2 = classes[1];
            it(`should return incomparable if item classes are mismatched: ${class1} - ${class2}`, () => {
                let item1 = newItem().armor()[class1]().build();
                let item2 = newItem().armor()[class2]().build();
                let perkStore = TestHelper.createPerkMap([]);
                let armourComparer = new ArmourComparer(perkStore);
                assert.strictEqual(
                    armourComparer.compare(item1, item2),
                    ItemComparisonResult.ITEM_IS_INCOMPARABLE
                );
            });
        });

        ['hunter', 'warlock', 'titan'].forEach(itemClass => {
            TestHelper.getPermutations(['helmet', 'gauntlets', 'chest', 'boots', 'classItem'])
                .forEach(types => {
                    let type1 = types[0];
                    let type2 = types[1];
                    it(`should return incomparable with mismatched types: ${itemClass} ${type1} - ${type2}`, () => {
                        let item1 = newItem().armor()[itemClass]()[type1]().build();
                        let item2 = newItem().armor()[itemClass]()[type2]().build();
                        let perkStore = TestHelper.createPerkMap([]);
                        let armourComparer = new ArmourComparer(perkStore);
                        assert.strictEqual(
                            armourComparer.compare(item1, item2),
                            ItemComparisonResult.ITEM_IS_INCOMPARABLE
                        );
                    });
                });
        });

        it("should return incomparable if item 1 is exotic, but item 2 is not the same exotic", () => {
            let item1 = newItem().armor().warlock().helmet().exotic().itemHash('1').build();
            let item2 = newItem().armor().warlock().helmet().exotic().itemHash('2').build();
            let perkStore = TestHelper.createPerkMap([]);
            let armourComparer = new ArmourComparer(perkStore);
            assert.strictEqual(
                armourComparer.compare(item1, item2),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE
            );
        });

        it("should return worse if item 1 has a good primary perk and item 2 has no good primary or secondary perks", () => {
            let perkStore = TestHelper.createPerkMap([]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(newPerk().good().build()),
                item2 => item2,
                ItemComparisonResult.ITEM_IS_WORSE,
                armourComparer
            )
        });

        it("should return equivalent if both items have the same good primary perk, no other good primary perks and no good secondary perks", () => {
            let goodPerk = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerk]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerk),
                item2 => item2.addPrimaryPerk(goodPerk),
                ItemComparisonResult.ITEM_IS_EQUIVALENT,
                armourComparer
            );
        });

        it("should return better if item 2 has a good primary perk and item 1 has no good primary or secondary perks", () => {
            let goodPerk = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerk]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1,
                item2 => item2.addPrimaryPerk(goodPerk),
                ItemComparisonResult.ITEM_IS_BETTER,
                armourComparer
            );
        });

        it("should return worse if item 1 has a good secondary perk and item 2 has no good primary or secondary perks", () => {
            let goodPerk = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerk]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerk),
                item2 => item2,
                ItemComparisonResult.ITEM_IS_WORSE,
                armourComparer
            );
        });

        it("should return equivalent if both items have the same good secondary perk, no other good secondary perks and no good primary perks", () => {
            let goodPerk = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerk]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerk),
                item2 => item2.addSecondaryPerk(goodPerk),
                ItemComparisonResult.ITEM_IS_EQUIVALENT,
                armourComparer
            );
        });

        it("should return better if item 2 has a good secondary perk and item 1 has no good primary or secondary perks", () => {
            let goodPerk = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerk]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1,
                item2 => item2.addSecondaryPerk(goodPerk),
                ItemComparisonResult.ITEM_IS_BETTER,
                armourComparer
            );
        });

        it("should return worse if item 1 has a good primary perk that item 2 does not have, even though they both have the same good secondary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerkA).addPrimaryPerk(goodPerkB),
                item2 => item2.addSecondaryPerk(goodPerkA),
                ItemComparisonResult.ITEM_IS_WORSE,
                armourComparer
            );
        });

        it("should return incomparable if item 1 has a good primary perk that item 2 does not have, and item 2 has a good secondary perk that item 1 does not have", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA),
                item2 => item2.addSecondaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                armourComparer
            );
        });

        it("should return worse if item 1 has a good secondary perk that item 2 does not have, even though they both have the same good primary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA).addSecondaryPerk(goodPerkB),
                item2 => item2.addPrimaryPerk(goodPerkA),
                ItemComparisonResult.ITEM_IS_WORSE,
                armourComparer
            );
        });

        it("should return better if item 2 has a good secondary perk that item 1 does not have, even though they both have the same good primary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA),
                item2 => item2.addPrimaryPerk(goodPerkA).addSecondaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_BETTER,
                armourComparer
            );
        });

        it("should return incomparable if item 1 has a good secondary perk that item 2 does not have, and item 2 has a good primary perk that item 1 does not have", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerkA),
                item2 => item2.addPrimaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                armourComparer
            );
        });

        it("should return better if item 2 has a good primary perk that item 1 does not have, even though they both have the same good secondary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerkA),
                item2 => item2.addSecondaryPerk(goodPerkA).addPrimaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_BETTER,
                armourComparer
            );
        });

        it("should return worse if item 1 has a good primary perk that item 2 does not have, even though they both share one good primary perk and neither have good secondary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA).addSecondaryPerk(goodPerkB),
                item2 => item2.addPrimaryPerk(goodPerkA),
                ItemComparisonResult.ITEM_IS_WORSE,
                armourComparer
            );
        });

        it("should return incomparable if item 1 has a good primary perk that item 2 does not have, and item 2 has a good primary perk that item 1 does not have", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA),
                item2 => item2.addPrimaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                armourComparer
            );
        });

        it("should return better if item 2 has a good primary perk that item 1 does not have, even though they both share one good primary perk and neither have good secondary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA),
                item2 => item2.addPrimaryPerk(goodPerkA).addSecondaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_BETTER,
                armourComparer
            );
        });

        it("should return worse if item 1 has a good secondary perk that item 2 does not have, even though they both share one good secondary perk and neither have good primary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerkA).addSecondaryPerk(goodPerkB),
                item2 => item2.addSecondaryPerk(goodPerkA),
                ItemComparisonResult.ITEM_IS_WORSE,
                armourComparer
            );
        });

        it("should return incomparable if item 1 has a good secondary perk that item 2 does not have, and item 2 has a good secondary perk that item 1 does not have", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerkA),
                item2 => item2.addSecondaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                armourComparer
            );
        });

        it("should return better if item 2 has a good secondary perk that item 1 does not have, even though they both share one good secondary perk and neither have good primary perks", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addSecondaryPerk(goodPerkA),
                item2 => item2.addSecondaryPerk(goodPerkA).addSecondaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_BETTER,
                armourComparer
            );
        });

        it("should return better if item 2 has all of item 1's good perk configurations, as well as an upgraded perk", () => {
            let goodPerkABuilder = newPerk().good();
            let goodPerkBBuilder = newPerk().good();
            let enhancedPerkA = goodPerkABuilder.upgrade().good().build();
            let goodPerkA = goodPerkABuilder.build();
            let goodPerkB = goodPerkBBuilder.build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB, enhancedPerkA]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA).addPrimaryPerk(goodPerkB),
                item2 => item2.addPrimaryPerk(enhancedPerkA).addPrimaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_BETTER,
                armourComparer
            );
        });

        it("should return worse if item 1 has all of item 2's good perk configurations, as well as an upgraded perk", () => {
            let goodPerkABuilder = newPerk().good();
            let goodPerkBBuilder = newPerk().good();
            let enhancedPerkA = goodPerkABuilder.upgrade().good().build();
            let goodPerkA = goodPerkABuilder.build();
            let goodPerkB = goodPerkBBuilder.build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB, enhancedPerkA]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(enhancedPerkA).addPrimaryPerk(goodPerkB),
                item2 => item2.addPrimaryPerk(goodPerkA).addPrimaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_WORSE,
                armourComparer
            );
        });

        it("should return equivalent if item 1 and item 2 have the same good perk configurations, but the perks are in different columns", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA).addSecondaryPerk(goodPerkB),
                item2 => item2.addSecondaryPerk(goodPerkA).addPrimaryPerk(goodPerkB),
                ItemComparisonResult.ITEM_IS_EQUIVALENT,
                armourComparer
            );
        });

        it("should return incomparable if both items share one good primary perk but not another, and only item 1 has a good secondary perk", () => {
            let goodPerkA = newPerk().good().build();
            let goodPerkB = newPerk().good().build();
            let goodPerkC = newPerk().good().build();
            let goodPerkX = newPerk().good().build();
            let perkStore = TestHelper.createPerkMap([goodPerkA, goodPerkB, goodPerkC, goodPerkX]);
            let armourComparer = new ArmourComparer(perkStore);
            armourComparerTest(
                item1 => item1.addPrimaryPerk(goodPerkA).addPrimaryPerk(goodPerkB)
                    .addSecondaryPerk(goodPerkX),
                item2 => item2.addPrimaryPerk(goodPerkA).addPrimaryPerk(goodPerkC),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                armourComparer
            );
        });
    });
});
