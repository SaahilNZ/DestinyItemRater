import ItemComparisonResult from './ItemComparisonResult';
import PerkRating from '../model/PerkRating';
import DestinyItemContainer from '../model/DestinyItemContainer';
import DestinyPerkContainer from '../model/DestinyPerkContainer';

interface PerkTreeNode {
    perk: DestinyPerkContainer;
    children: PerkTreeNode[];
}

export default class ArmourComparer {
    perkRatings: Map<string, PerkRating>

    constructor(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.definition.class !== item2.definition.class) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.definition.itemType !== item2.definition.itemType) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.definition.tier === "Exotic") {
            if (item1.item.itemHash !== item2.item.itemHash) {
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            }
        } else {
            if (item2.definition.tier === "Exotic") {
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            }
        }

        // determine good perks on each item
        let item1GoodPerks = this.getGoodPerks(item1);
        let item2GoodPerks = this.getGoodPerks(item2);

        return this.comparePerks(item1GoodPerks, item2GoodPerks);
    }

    getGoodPerks(container: DestinyItemContainer): DestinyPerkContainer[][] {
        return container.perkColumns.map(
            column => column.filter(perk => perk && perk.isGood));
    }

    comparePerks(item1Perks: DestinyPerkContainer[][], item2Perks: DestinyPerkContainer[][]): ItemComparisonResult {
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

    scoreConfigInclusion(configs1: DestinyPerkContainer[][], configs2: DestinyPerkContainer[][]): number {
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

    determineConfigInclusion(configs: DestinyPerkContainer[][], configToFind: DestinyPerkContainer[]): number {
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

    getPerkUpgrades(perk: DestinyPerkContainer): DestinyPerkContainer[] {
        if (this.perkRatings === null || this.perkRatings === undefined) {
            return [];
        }
        let upgradePerks = perk.upgrades
            .map(perkName => this.perkRatings.get(perkName.toLowerCase()));
        let upgrades = upgradePerks.concat();
        upgradePerks.forEach(upgrade => {
            upgrades = upgrades.concat(...this.getPerkUpgrades(upgrade));
        });
        return upgrades;
    }

    getPerkConfigs(perkColumns: DestinyPerkContainer[][]): DestinyPerkContainer[][] {
        let filteredColumns = perkColumns.filter(column => column.length > 0);
        let perkTree = this.convertToTree(null, filteredColumns);
        return this.getPerkConfigsFromTree(perkTree);
    }

    convertToTree(perk: DestinyPerkContainer, perkColumns: DestinyPerkContainer[][]) {
        let node: PerkTreeNode = {
            perk: perk,
            children: []
        };
        let children: PerkTreeNode[] = [];
        if (perkColumns[0]) {
            perkColumns[0].forEach(nextPerk => {
                children.push(this.convertToTree(nextPerk, perkColumns.slice(1)));
            })
        }
        node.children = children;
        return node;
    }

    getPerkConfigsFromTree(perkTree: PerkTreeNode): DestinyPerkContainer[][] {
        let configs: DestinyPerkContainer[][] = [];
        perkTree.children.forEach(perk => {
            configs.push(...this.getPerkConfigsFromNode(perk));
        });
        return configs;
    }

    getPerkConfigsFromNode(perkNode: PerkTreeNode): DestinyPerkContainer[][] {
        let configs: DestinyPerkContainer[][] = [];
        let baseConfig: DestinyPerkContainer[] = [perkNode.perk];
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