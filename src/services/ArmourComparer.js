import ItemComparisonResult from './ItemComparisonResult';
import PerkStore from '../stores/PerkStore';

class ArmourComparer {
    compare(item1, item2) {
        if (item1.class !== item2.class) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.type !== item2.type) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        let perks = PerkStore.getState().perks;
        let item1GoodPerks = [];
        let item2GoodPerks = [];
        if (item1.type === "Warlock Bond" ||
            item1.type === "Hunter Cloak" ||
            item1.type === "Titan Mark") {
            if (item1.perks[0] && item2.perks[0] &&
                item1.perks[1] && item2.perks[1]) {
                item1GoodPerks = [
                    item1.perks[0].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase())),
                    item1.perks[1].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase()))
                ];

                item2GoodPerks = [
                    item2.perks[0].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase())),
                    item2.perks[1].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase()))
                ];
            }
        } else {
            if (item1.perks[2] && item2.perks[2] &&
                item1.perks[3] && item2.perks[3]) {
                item1GoodPerks = [
                    ...item1.perks[2].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase())),
                    ...item1.perks[3].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase()))
                ];
                item2GoodPerks = [
                    ...item2.perks[2].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase())),
                    ...item2.perks[3].filter(perkName => perkName !== "")
                        .filter(perkName => perks.get(perkName.toLowerCase()).isGood)
                        .map(perkName => perks.get(perkName.toLowerCase()))
                ];
            }
        }
        let intersect = item1GoodPerks.filter(perk => item2GoodPerks.includes(perk));
        if (intersect.length < item1GoodPerks.length &&
            intersect.length < item2GoodPerks.length) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (intersect.length === item1GoodPerks.length &&
            intersect.length < item2GoodPerks.length) {
            return ItemComparisonResult.ITEM_IS_BETTER;
        }
        if (intersect.length === item2GoodPerks.length &&
            intersect.length < item1GoodPerks.length) {
            return ItemComparisonResult.ITEM_IS_WORSE;
        }
        return ItemComparisonResult.ITEM_IS_EQUIVALENT;
    }
}

export default new ArmourComparer();