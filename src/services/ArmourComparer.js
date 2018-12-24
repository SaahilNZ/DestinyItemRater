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
        let item1GoodPerks = this.getGoodPerks(item1, perks);
        let item2GoodPerks = this.getGoodPerks(item2, perks);

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

    getGoodPerks(item, perks) {
        let columns = [2,3];
        if (item.type === "Warlock Bond" ||
            item.type === "Hunter Cloak" ||
            item.type === "Titan Mark") {
            columns = [0,1];
        }
        let goodPerksInColumns = columns.map(column => {
            let perkColumn = item.perks[column];
            if (perkColumn) {
                return perkColumn
                    .map(perkName => perks.get(perkName.toLowerCase()))
                    .filter(perk => perk !== null && perk.isGood);
            }
            return [];
        })
        return [].concat(...goodPerksInColumns);
    }
}

export default new ArmourComparer();