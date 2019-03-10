import ItemComparisonResult from './ItemComparisonResult';

export default class ArmourComparer {
    constructor(perkStore) {
        this.perkStore = perkStore;
        this.perks = this.perkStore.getState().perkRatings;
    }

    compare(item1, item2) {
        if (item1.class !== item2.class) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.type !== item2.type) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.tier === "Exotic") {
            if (item1.itemHash !== item2.itemHash) {
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            }
        } else {
            if (item2.tier === "Exotic") {
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            }
        }

        // determine good perks on each item
        this.perks = this.perkStore.getState().perkRatings;
        let item1GoodPerks = this.getGoodPerks(item1);
        let item2GoodPerks = this.getGoodPerks(item2);

        return this.comparePerks(item1GoodPerks, item2GoodPerks);
    }

    getGoodPerks(item) {
        return item.perkColumns.map(
            column => column.filter(perk => perk !== null && perk !== undefined && perk.isGood));
    }

    comparePerks(item1Perks, item2Perks) {
        let item1PerkConfigs = this.getPerkConfigs(item1Perks);
        let item2PerkConfigs = this.getPerkConfigs(item2Perks);

        if (item1PerkConfigs.every(i1Config => this.isConfigIncluded(item2PerkConfigs, i1Config))) {
            if (item2PerkConfigs.length > item1PerkConfigs.length) {
                return ItemComparisonResult.ITEM_IS_BETTER;
            }

            // both items have the same number of configurations
            // the better item is the one that has the highest number of good perks across all configurations
            let item1TotalPerks = item1PerkConfigs.reduce((total, config) => total + config.length, 0);
            let item2TotalPerks = item2PerkConfigs.reduce((total, config) => total + config.length, 0);

            if (item2TotalPerks > item1TotalPerks) {
                return ItemComparisonResult.ITEM_IS_BETTER;
            } else if (item1TotalPerks > item2TotalPerks) {
                return ItemComparisonResult.ITEM_IS_WORSE;
            }

            return ItemComparisonResult.ITEM_IS_EQUIVALENT;
        } else {
            if (item2PerkConfigs.every(i2Config => this.isConfigIncluded(item1PerkConfigs, i2Config))) {
                return ItemComparisonResult.ITEM_IS_WORSE;
            }

            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
    }

    isConfigIncluded(configs, configToFind) {
        // identify comparable perks for each column
        let columns = configToFind.map(perk => {
            let upgradeNames = this.getPerkUpgrades(perk).map(perk => perk.name);
            return [perk.name, ...upgradeNames];
        });
        for (let i = 0; i < configs.length; i++) {
            const currentConfigNames = configs[i].map(perk => perk.name);
            if (columns.every(comparablePerks => comparablePerks.some(x => currentConfigNames.some(y => y === x)))) {
                return true;
            }
        }
    }

    getPerkUpgrades(perk) {
        if (this.perks === null || this.perks === undefined) {
            return [];
        }
        let upgradePerks = perk.upgrades
            .map(perkName => this.perks.get(perkName.toLowerCase()));
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