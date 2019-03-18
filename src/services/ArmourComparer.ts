import ItemComparisonResult from './ItemComparisonResult';
import DestinyItem from '../model/DestinyItem';
import PerkRating from '../model/PerkRating';
import Store from '../stores/Store';

interface PerkTreeNode {
    perk: PerkRating;
    children: PerkTreeNode[];
}

export default class ArmourComparer {
    perkStore: Store<{perkRatings: Map<string, PerkRating>}>
    perks: Map<string, PerkRating>

    constructor(perkStore) {
        this.perkStore = perkStore;
        this.perks = this.perkStore.getState().perkRatings;
    }

    compare(item1: DestinyItem, item2: DestinyItem): ItemComparisonResult {
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

    getGoodPerks(item: DestinyItem) {
        return item.perkColumns.map(
            column => column.filter(perk => perk !== null && perk !== undefined && perk.isGood));
    }

    comparePerks(item1Perks: PerkRating[][], item2Perks: PerkRating[][]): ItemComparisonResult {
        let item1PerkConfigs = this.getPerkConfigs(item1Perks);
        let item2PerkConfigs = this.getPerkConfigs(item2Perks);

        let i1ConfigInclusion = this.scoreConfigInclusion(item1PerkConfigs, item2PerkConfigs);
        if (i1ConfigInclusion === 2) {
            // item 2 contains all of item 1's configurations and at least one improved version
            return ItemComparisonResult.ITEM_IS_BETTER;
        } else if (i1ConfigInclusion === 1) {
            if (item2PerkConfigs.length > item1PerkConfigs.length) {
                // item 2 contains all of item 1's configurations, but also has additional good configurations
                return ItemComparisonResult.ITEM_IS_BETTER;
            } else {
                // item 2 contains all of item 1's configurations, but no others
                return ItemComparisonResult.ITEM_IS_EQUIVALENT;
            }
        } else {
            let i2ConfigInclusion = this.scoreConfigInclusion(item2PerkConfigs, item1PerkConfigs);
            if (i2ConfigInclusion >= item2PerkConfigs.length) {
                // item 1 contains all of item 2's configurations
                return ItemComparisonResult.ITEM_IS_WORSE;
            } else {
                // neither item includes all of the other's configurations
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            }
        }
    }

    scoreConfigInclusion(configs1: PerkRating[][], configs2: PerkRating[][]): number {
        if (configs1.length === 0) {
            return 1;
        }

        let bestScore = 0;
        for (let i = 0; i < configs1.length; i++) {
            const config = configs1[i];
            let score = this.determineConfigInclusion(configs2, config);
            if (score === 0) {
                return 0;
            } else {
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    }

    determineConfigInclusion(configs, configToFind): number {
        // 0 = config not included
        // 1 = exact config included
        // 2 = better version of config included

        // identify comparable perks for each column
        let columns = configToFind.map(perk => {
            let upgradeNames = this.getPerkUpgrades(perk).map(perk => perk.name);
            return {
                basePerk: perk.name,
                upgradedPerks: upgradeNames
            }
        });

        let bestInclusionScore = 0;

        for (let i = 0; i < configs.length; i++) {
            const currentConfigNames = configs[i].map(perk => perk.name);

            let inclusionScore = 0;
            for (let c = 0; c < columns.length; c++) {
                const comparablePerks = columns[c];
                if (currentConfigNames.some(x => comparablePerks.upgradedPerks.some(y => y === x))) {
                    // this config includes an upgraded version of the perk
                    inclusionScore = Math.max(inclusionScore, 2);
                } else if (currentConfigNames.some(perk => perk === comparablePerks.basePerk)) {
                    // this config includes the perk
                    inclusionScore = Math.max(inclusionScore, 1);
                } else {
                    // this config does not include a comparable perk
                    inclusionScore = 0;
                    break;
                }
            }
            if (inclusionScore === 1 && currentConfigNames.length > columns.length) {
                // this config includes all of the perks in the desired config (but no upgraded perks)
                // it also includes additional perks
                inclusionScore = 2;
            }
            bestInclusionScore = Math.max(bestInclusionScore, inclusionScore);
        }
        return bestInclusionScore;
    }

    getPerkUpgrades(perk: PerkRating): PerkRating[] {
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

    getPerkConfigs(perkColumns: PerkRating[][]): PerkRating[][] {
        let filteredColumns = perkColumns.filter(column => column.length > 0);
        let perkTree = this.convertToTree(null, filteredColumns);
        return this.getPerkConfigsFromTree(perkTree);
    }

    convertToTree(perk: PerkRating, perkColumns: PerkRating[][]) {
        let node: PerkTreeNode = {
            perk: null,
            children: []
        };
        node.perk = perk;
        let children: PerkTreeNode[] = [];
        if (perkColumns[0]) {
            perkColumns[0].forEach(nextPerk => {
                children.push(this.convertToTree(nextPerk, perkColumns.slice(1)));
            })
        }
        node.children = children;
        return node;
    }

    getPerkConfigsFromTree(perkTree: PerkTreeNode): PerkRating[][] {
        let configs: PerkRating[][] = [];
        perkTree.children.forEach(perk => {
            configs.push(...this.getPerkConfigsFromNode(perk));
        });
        return configs;
    }

    getPerkConfigsFromNode(perkNode: PerkTreeNode): PerkRating[][] {
        let configs: PerkRating[][] = [];
        let baseConfig: PerkRating[] = [perkNode.perk];
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