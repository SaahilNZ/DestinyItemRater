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

        // determine good perks on each item
        let perks = PerkStore.getState().perks;
        let item1GoodPerks = this.getGoodPerks(item1, perks);
        let item2GoodPerks = this.getGoodPerks(item2, perks);

        return this.comparePerks(item1GoodPerks, item2GoodPerks, perks);
    }

    getGoodPerks(item, perks) {
        let columns = this.getRateablePerkColumns(item);
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

    getRateablePerkColumns(item) {
        let columns = [2,3];
        if (item.type === "Warlock Bond" ||
            item.type === "Hunter Cloak" ||
            item.type === "Titan Mark") {
            columns = [0,1];
        }
        return columns;
    }

    comparePerks(item1Perks, item2Perks, perks) {
        let sharedPerks = [];
        let item1UpgradedPerks = [];
        let item2UpgradedPerks = [];

        for (let i1 = 0; i1 < item1Perks.length; i1++) {
            const item1Perk = item1Perks[i1];
            let item1PerkUpgrades = this.getPerkUpgrades(item1Perk, perks);
            for (let i2 = 0; i2 < item2Perks.length; i2++) {
                const item2Perk = item2Perks[i2];
                let item2PerkUpgrades = this.getPerkUpgrades(item2Perk, perks);
                if (item1Perk === item2Perk) {
                    sharedPerks.push(item1Perk);
                    break;
                } else if (item1PerkUpgrades.includes(item2Perk)) {
                    item2UpgradedPerks.push(item2Perk);
                    break;
                } else if (item2PerkUpgrades.includes(item1Perk)) {
                    item1UpgradedPerks.push(item1Perk);
                }
            }
        }

        /*
        item2 is incomparable when:
        - item2 does not contain all of item1's good perks or better versions of these perks
        AND
        item1 does not contain all of item2's good perks or better versions of these perks
         */
        if (sharedPerks.length + item2UpgradedPerks.length < item1Perks.length &&
            sharedPerks.length + item1UpgradedPerks.length < item2Perks.length) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }

        /*
        item2 is better when:
        - item2 contains all of item1's good perks, including at least 1 perk upgrade
        - item2 contains all of item1's good perks
        AND
        item2 contains at least 1 good perk that item1 does not have
         */
        if (sharedPerks.length + item2UpgradedPerks.length === item1Perks.length ||
            (sharedPerks.length === item1Perks.length && item2Perks.length > sharedPerks.length)) {
            return ItemComparisonResult.ITEM_IS_BETTER;
        }

        /*
        item2 is worse when:
        - item1 contains all of item2's good perks
        AND
        item1 contains at least 1 good perk that item2 does not have
         */
        if (sharedPerks.length === item2Perks.length &&
            item1Perks.length > item2Perks.length) {
            return ItemComparisonResult.ITEM_IS_WORSE;
        }

        return ItemComparisonResult.ITEM_IS_EQUIVALENT;
    }

    getPerkUpgrades(perk, perks) {
        let upgradePerks = perk.upgrades
            .map(perkName => perks.get(perkName.toLowerCase()));
        let upgrades = upgradePerks.concat();
        upgradePerks.forEach(upgrade => {
            upgrades = upgrades.concat(...this.getPerkUpgrades(upgrade));
        });
        return upgrades;
    }
}

export default new ArmourComparer();