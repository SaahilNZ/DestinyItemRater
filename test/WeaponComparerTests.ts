import assert from "assert";
import WeaponComparer from "../src/services/WeaponComparer";
import ItemComparisonResult from "../src/services/ItemComparisonResult";
import { newItem, WeaponItemDefiner, newPerk, newWeaponPerk } from './MockItemBuilder';

describe("WeaponComparer", () => {
    describe("compare()", () => {
        it("should return incomparable if item 1 is not the same weapon as item 2", () => {
            let weaponComparer = new WeaponComparer();
            weaponComparerTest(
                item1 => item1.itemHash(1),
                item2 => item2.itemHash(2),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                weaponComparer
            );
        });

        it("should return equivalent if item 1 is the same weapon as item 2", () => {
            let weaponComparer = new WeaponComparer();
            weaponComparerTest(
                item1 => item1,
                item2 => item2,
                ItemComparisonResult.ITEM_IS_EQUIVALENT,
                weaponComparer
            );
        });

        it("should return equivalent if item 1 has the same perks as item 2", () => {
            let weaponComparer = new WeaponComparer();

            let primaryPerkSTier = newWeaponPerk('outlaw').pve('S').pvp('S').build();
            weaponComparerTest(
                item1 => item1.addPerkColumn([primaryPerkSTier]),
                item2 => item2.addPerkColumn([primaryPerkSTier]),
                ItemComparisonResult.ITEM_IS_EQUIVALENT,
                weaponComparer
            );
        });

        it("should return worse if item 1 has a better primary perk than item 2", () => {
            let primaryPerkSTier = newWeaponPerk('outlaw').pve('S').pvp('S').build();
            let primaryPerkCTier = newWeaponPerk('under pressure').pve('C').pvp('C').build();
            let secondaryPerkSTier = newWeaponPerk('kill clip').pve('S').pvp('S').build();

            let weaponComparer = new WeaponComparer();

            weaponComparerTest(
                item1 => item1
                    .addPerkColumn([primaryPerkSTier])
                    .addPerkColumn([secondaryPerkSTier]),
                item2 => item2
                    .addPerkColumn([primaryPerkCTier])
                    .addPerkColumn([secondaryPerkSTier]),
                ItemComparisonResult.ITEM_IS_WORSE,
                weaponComparer
            );
        });

        it("should return better if item 2 has a better primary perk than item 1", () => {
            let primaryPerkSTier = newWeaponPerk('outlaw').pve('S').pvp('S').build();
            let primaryPerkCTier = newWeaponPerk('under pressure').pve('C').pvp('C').build();
            let secondaryPerkSTier = newWeaponPerk('kill clip').pve('S').pvp('S').build();

            let weaponComparer = new WeaponComparer();

            weaponComparerTest(
                item1 => item1
                    .addPerkColumn([primaryPerkCTier])
                    .addPerkColumn([secondaryPerkSTier]),
                item2 => item2
                    .addPerkColumn([primaryPerkSTier])
                    .addPerkColumn([secondaryPerkSTier]),
                ItemComparisonResult.ITEM_IS_BETTER,
                weaponComparer
            );
        });

        it("should return worse if item 1 has a better secondary perk than item 2", () => {
            let primaryPerkSTier = newWeaponPerk('outlaw').pve('S').pvp('S').build();
            let secondaryPerkSTier = newWeaponPerk('kill clip').pve('S').pvp('S').build();
            let secondaryPerkCTier = newWeaponPerk('high-impact reserves').pve('C').pvp('C').build();

            let weaponComparer = new WeaponComparer();

            weaponComparerTest(
                item1 => item1
                    .addPerkColumn([primaryPerkSTier])
                    .addPerkColumn([secondaryPerkSTier]),
                item2 => item2
                    .addPerkColumn([primaryPerkSTier])
                    .addPerkColumn([secondaryPerkCTier]),
                ItemComparisonResult.ITEM_IS_WORSE,
                weaponComparer
            );
        });

        it("should return better if item 2 has a better secondary perk than item 1", () => {
            let primaryPerkSTier = newWeaponPerk('outlaw').pve('S').pvp('S').build();
            let secondaryPerkSTier = newWeaponPerk('kill clip').pve('S').pvp('S').build();
            let secondaryPerkCTier = newWeaponPerk('high-impact reserves').pve('C').pvp('C').build();

            let weaponComparer = new WeaponComparer();

            weaponComparerTest(
                item1 => item1
                    .addPerkColumn([primaryPerkSTier])
                    .addPerkColumn([secondaryPerkCTier]),
                item2 => item2
                    .addPerkColumn([primaryPerkSTier])
                    .addPerkColumn([secondaryPerkSTier]),
                ItemComparisonResult.ITEM_IS_BETTER,
                weaponComparer
            );
        });

        it("should return incomparable if both items have different perks but the same tier", () => {
            let primaryPerkSTier1 = newWeaponPerk('kill clip').pve('S').pvp('S').build();
            let primaryPerkSTier2 = newWeaponPerk('rampage').pve('S').pvp('S').build();

            let weaponComparer = new WeaponComparer();

            weaponComparerTest(
                item1 => item1
                    .addPerkColumn([primaryPerkSTier1]),
                item2 => item2
                    .addPerkColumn([primaryPerkSTier2]),
                ItemComparisonResult.ITEM_IS_INCOMPARABLE,
                weaponComparer
            );
        });

        it("should return equivalent if item 2 has all of item 1's S-tier perks even if it is missing some of item 1's perks that are not S-tier", () => {
            let perk_sTier = newWeaponPerk('kill clip').pve('S').pvp('S').build();
            let perk_bTier = newWeaponPerk('headseeker').pve('B').pvp('B').build();

            let weaponComparer = new WeaponComparer();

            weaponComparerTest(
                item1 => item1
                    .addPerkColumn([perk_sTier, perk_bTier]),
                item2 => item2
                    .addPerkColumn([perk_sTier]),
                ItemComparisonResult.ITEM_IS_EQUIVALENT,
                weaponComparer
            );
        });

        it("should return better if item 2 has all of item 1's S-tier perks as well as one other S-tier perk", () => {
            let perk_sTier1 = newWeaponPerk('kill clip').pve('S').pvp('S').build();
            let perk_sTier2 = newWeaponPerk('rampage').pve('S').pvp('S').build();
            let perk_bTier = newWeaponPerk('headseeker').pve('B').pvp('B').build();

            let weaponComparer = new WeaponComparer();

            weaponComparerTest(
                item1 => item1
                    .addPerkColumn([perk_sTier1, perk_bTier]),
                item2 => item2
                    .addPerkColumn([perk_sTier1, perk_sTier2]),
                ItemComparisonResult.ITEM_IS_BETTER,
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