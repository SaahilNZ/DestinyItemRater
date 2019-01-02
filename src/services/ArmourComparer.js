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
                    .filter(name => name !== "" && name !== null && name !== undefined)
                    .map(perkName => perks.get(perkName.toLowerCase()))
                    .filter(perk => perk !== null && perk !== undefined && perk.isGood);
            }
            return [];
        })
        return goodPerksInColumns;
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
        let item1PerkConfigs = this.getPerkConfigs(item1Perks);
        let item2PerkConfigs = this.getPerkConfigs(item2Perks);

        let isBetterOrEqual = true;
        for (let i1 = 0; i1 < item1PerkConfigs.length; i1++) {
            const item1PerkConfig = item1PerkConfigs[i1];
            let containsConfig = false;

            let comparablePerks = [];
            item1PerkConfig.forEach(perk => {
                comparablePerks.push(perk);
                comparablePerks.push(...this.getPerkUpgrades(perk, perks));
            });

            for (let i2 = 0; i2 < item2PerkConfigs.length; i2++) {
                const item2PerkConfig = item2PerkConfigs[i2];
                if (comparablePerks.filter(
                    p => item2PerkConfig.includes(p)).length === item1PerkConfig.length) {
                    containsConfig = true;
                    break;
                }
            }
            
            if (!containsConfig) {
                isBetterOrEqual = false;
                break;
            }
        }

        if (isBetterOrEqual) {
            if (item2PerkConfigs.length > item1PerkConfigs.length) {
                return ItemComparisonResult.ITEM_IS_BETTER;
            }
            return ItemComparisonResult.ITEM_IS_EQUIVALENT;
        } else {
            let containsAll = true;
            for (let i1 = 0; i1 < item2PerkConfigs.length; i1++) {
                const item2PerkConfig = item2PerkConfigs[i1];
                let containsConfig = false;
    
                let comparablePerks = [];
                item2PerkConfig.forEach(perk => {
                    comparablePerks.push(perk);
                    comparablePerks.push(...this.getPerkUpgrades(perk, perks));
                });
    
                for (let i2 = 0; i2 < item1PerkConfigs.length; i2++) {
                    const item1PerkConfig = item1PerkConfigs[i2];
                    if (comparablePerks.filter(
                        p => item1PerkConfig.includes(p)).length === item2PerkConfig.length) {
                        containsConfig = true;
                        break;
                    }
                }
                
                if (!containsConfig) {
                    containsAll = false;
                    break;
                }
            }
            if (containsAll) {
                return ItemComparisonResult.ITEM_IS_WORSE;
            }

            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
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

    getPerkConfigs(perkColumns) {
        let filteredColumns = perkColumns.filter(column => column.length > 0);
        let perkTree = this.convertToTree(null, filteredColumns);
        return this.getPerkConfigsFromTree(perkTree);
    }

    convertToTree(perk, perkColumns) {
        let node = {};
        node.perk = perk;
        let children = [];
        if (perkColumns[0]) {
            perkColumns[0].forEach(nextPerk => {
                children.push(this.convertToTree(nextPerk, perkColumns.slice(1)));
            })
        }
        node.children = children;
        return node;
    }

    getPerkConfigsFromTree(perkTree) {
        let configs = [];
        perkTree.children.forEach(perk => {
            configs.push(...this.getPerkConfigsFromNode(perk));
        });
        return configs;
    }

    getPerkConfigsFromNode(perkNode) {
        let configs = [];
        let baseConfig = [perkNode.perk];
        perkNode.children.forEach(child => {
            let childConfigs = this.getPerkConfigsFromNode(child);
            childConfigs.forEach(childConfig => {
                configs.push(baseConfig.concat(...childConfig));
            });
        });
        if (configs.length === 0) {
            configs.push(baseConfig);
        }
        return configs;
    }
}

export default new ArmourComparer();