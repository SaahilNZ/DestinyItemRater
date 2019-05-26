import assert from "assert";
import WeaponComparer from "../src/services/WeaponComparer";
import ItemComparisonResult from "../src/services/ItemComparisonResult";
import { newItem, WeaponItemDefiner } from './MockItemBuilder';
import { WeaponPerkRatings } from "../src/model/WeaponPerkRating";

describe("WeaponComparer", () => {
    describe("compare()", () => {
        it("should return incomparable if item 1 is not the same weapon as item 2", () => {
            let weaponComparer = new WeaponComparer({});
            weaponComparerTest(
                item1 => item1.itemHash(1),
                item2 => item2.itemHash(2),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                weaponComparer
            );
        });

        it("should return equivalent if item 1 is the same weapon as item 2", () => {
            let weaponComparer = new WeaponComparer({});
            weaponComparerTest(
                item1 => item1,
                item2 => item2,
                ItemComparisonResult.ITEM_IS_EQUIVALENT,
                weaponComparer
            );
        });
    });
});

export function weaponComparerTest(
    defineItem1: WeaponItemDefiner, defineItem2: WeaponItemDefiner,
    expected: ItemComparisonResult, weaponComparer: WeaponComparer) {

    let item1 = defineItem1(newItem().weapon().itemHash(1)).build();
    let item2 = defineItem2(newItem().weapon().itemHash(1)).build();
    assert.strictEqual(weaponComparer.compare(item1, item2), expected);
}