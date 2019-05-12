import ItemComparisonResult from './ItemComparisonResult';
import PerkRating from '../model/PerkRating';
import DestinyItemContainer from '../model/DestinyItemContainer';
import DestinyPerkContainer, { buildPerkContainer } from '../model/DestinyPerkContainer';

interface PerkTreeNode {
    perk: DestinyPerkContainer;
    children: PerkTreeNode[];
}
enum PerkComparisonResult {
    PERK_IS_INCOMPARABLE = 0,
    PERK_IS_EQUIVALENT = 1,
    PERK_IS_BETTER = 2
}
enum PerkConfigComparisonResult {
    CONFIG_IS_INCOMPARABLE = 0,
    CONFIG_IS_EQUIVALENT = 1,
    CONFIG_IS_BETTER = 2
}
enum ConfigInclusion {
    CONFIG_NOT_INCLUDED = 0,
    CONFIG_IS_INCLUDED = 1,
    BETTER_CONFIG_INCLUDED = 2
}

export default class ArmourComparer {
    perkRatings: Map<string, PerkRating>

    constructor(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.item.id === '6917529085856201652' && item2.item.id === '6917529092262278684') {
            debugger;
        }
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
        let item1PerkConfigs = this.getGoodPerkConfigs(item1);
        let item2PerkConfigs = this.getGoodPerkConfigs(item2);

        return this.compareItemPerkConfigs(item1PerkConfigs, item2PerkConfigs);
    }

    private compareItemPerkConfigs(item1PerkConfigs: DestinyPerkContainer[][], item2PerkConfigs: DestinyPerkContainer[][]): ItemComparisonResult {
        // test whether item 1 contain's all of item 2's configs
        let i1ConfigInclusion = item2PerkConfigs.map(i2Config => this.determineConfigInclusion(i2Config, item1PerkConfigs));

        // test whether item 2 contain's all of item 1's configs
        let i2ConfigInclusion = item1PerkConfigs.map(i1Config => this.determineConfigInclusion(i1Config, item2PerkConfigs));

        if (i2ConfigInclusion.some(comparison => comparison === ConfigInclusion.CONFIG_NOT_INCLUDED)) {
            // item 2 does not contain all of item 1's configs
            if (i1ConfigInclusion.some(comparison => comparison === ConfigInclusion.CONFIG_NOT_INCLUDED)) {
                // item 1 does not contain all of item 2's configs
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            } else {
                // item 1 contains all of item 2's configs
                return ItemComparisonResult.ITEM_IS_WORSE;
            }
        } else if (i2ConfigInclusion.some(comparison => comparison === ConfigInclusion.BETTER_CONFIG_INCLUDED)) {
            // item 2 contains a better version of at least one of item 1's configs
            if (i1ConfigInclusion.some(comparison => comparison === ConfigInclusion.CONFIG_NOT_INCLUDED)) {
                // item 1 does not contain all of item 2's configs
                return ItemComparisonResult.ITEM_IS_BETTER;
            } else if (i1ConfigInclusion.some(comparison => comparison === ConfigInclusion.BETTER_CONFIG_INCLUDED)) {
                // item 1 contains a better version of at least one of item 2's configs
                // todo: test which has a higher number of 'better' configs
                return ItemComparisonResult.ITEM_IS_EQUIVALENT;
            } else {
                // item 1 contains all of item 2's configs
                return ItemComparisonResult.ITEM_IS_BETTER;
            }
        } else {
            // item 2 contains all of item 1's configs
            if (i1ConfigInclusion.some(comparison => comparison === ConfigInclusion.CONFIG_NOT_INCLUDED)) {
                // item 1 does not contain all of item 2's configs
                return ItemComparisonResult.ITEM_IS_BETTER;
            } else if (i1ConfigInclusion.some(comparison => comparison === ConfigInclusion.BETTER_CONFIG_INCLUDED)) {
                // item 1 contains a better version of at least one of item 2's configs
                return ItemComparisonResult.ITEM_IS_WORSE;
            } else {
                // item 1 contains all of item 2's configs
                return ItemComparisonResult.ITEM_IS_EQUIVALENT;
            }
        }
    }

    private determineConfigInclusion(configToFind: DestinyPerkContainer[], configs: DestinyPerkContainer[][]): ConfigInclusion {
        let comparisons = configs.map(configToTest => this.comparePerkConfigs(configToFind, configToTest));
        if (comparisons.some(c => c === PerkConfigComparisonResult.CONFIG_IS_BETTER)) {
            // item 2 contains a better version of this configuration
            return ConfigInclusion.BETTER_CONFIG_INCLUDED;
        } else if (comparisons.some(c => c === PerkConfigComparisonResult.CONFIG_IS_EQUIVALENT)) {
            // item 2 contains this configuration
            return ConfigInclusion.CONFIG_IS_INCLUDED;
        }

        // item 2 does not contain this configuration
        return ConfigInclusion.CONFIG_NOT_INCLUDED;
    }

    private comparePerkConfigs(config1: DestinyPerkContainer[], config2: DestinyPerkContainer[]): PerkConfigComparisonResult {
        let isMissingPerk: boolean = false;
        let hasBetterPerk: boolean = false;

        // test whether config 2 is better or equal to config 1
        config1.forEach(perkToFind => {
            let comparisons = config2.map(perkToTest => this.comparePerk(perkToFind, perkToTest));
            if (comparisons.some(c => c === PerkComparisonResult.PERK_IS_BETTER)) {
                // config 2 contains a better version of the perk
                hasBetterPerk = true;
            } else if (comparisons.some(c => c === PerkComparisonResult.PERK_IS_EQUIVALENT)) {
                // config 2 contains the perk
            } else {
                // config 2 does not contain the perk
                isMissingPerk = true;
                return;
            }
        });

        if (isMissingPerk) {
            // config 2 does not contain one of the perks in config 1
            return PerkConfigComparisonResult.CONFIG_IS_INCOMPARABLE;
        }

        // config 2 has all perks (or better versions of the perks) in config 1

        if (hasBetterPerk) {
            // config 2 has a better version of a perk in config 1
            return PerkConfigComparisonResult.CONFIG_IS_BETTER;
        }

        if (config2.length > config1.length) {
            // config 2 has more perks than config 1
            return PerkConfigComparisonResult.CONFIG_IS_BETTER;
        }

        return PerkConfigComparisonResult.CONFIG_IS_EQUIVALENT;
    }

    private comparePerk(perk1: DestinyPerkContainer, perk2: DestinyPerkContainer): PerkComparisonResult {
        if (perk2.name === perk1.name) {
            // same perk
            return PerkComparisonResult.PERK_IS_EQUIVALENT;
        }

        let upgrades = this.getPerkUpgrades(perk1);
        if (upgrades.some(u => u.name === perk2.name)) {
            // perk 2 is better than perk 1
            return PerkComparisonResult.PERK_IS_BETTER;
        }

        return PerkComparisonResult.PERK_IS_INCOMPARABLE;
    }

    private getPerkUpgrades(perk: DestinyPerkContainer): DestinyPerkContainer[] {
        if (!this.perkRatings) {
            return [];
        }

        let upgradePerks = perk.upgrades.map(perkName => {
            let perk = this.perkRatings.get(perkName.toLowerCase());
            return buildPerkContainer(perk, this.perkRatings);
        });

        let upgrades = upgradePerks;
        upgradePerks.forEach(upgrade => {
            upgrades = upgrades.concat(...this.getPerkUpgrades(upgrade));
        });

        return upgrades;
    }

    private getGoodPerkConfigs(item: DestinyItemContainer): DestinyPerkContainer[][] {
        const modes = ['PvE', 'PvP'];

        // identify good perks for each mode
        let goodPerksForMode: DestinyPerkContainer[][][] =
            modes.map(mode => item.perkColumns.map(column =>
                column.filter(perk => perk && perk.isGoodByMode[mode])).filter(column => column.length > 0));

        // identify available good perk configurations for each mode
        let perkConfigsForMode = goodPerksForMode.map(perks => this.getPerkConfigs(perks));

        // remove duplicate configs
        let perkConfigs: DestinyPerkContainer[][] = [];
        let existingConfigIds: string[] = [];
        [].concat(...perkConfigsForMode).forEach((config: DestinyPerkContainer[]) => {
            let id = config.map(perk => perk.name).join('+');
            if (!existingConfigIds.includes(id)) {
                existingConfigIds.push(id);
                perkConfigs.push(config);
            }
        });

        return perkConfigs;
    }

    private getPerkConfigs(perks: DestinyPerkContainer[][]): DestinyPerkContainer[][] {
        let perkTree = this.convertToTree(null, perks);
        return this.getPerkConfigsFromTree(perkTree);
    }

    private convertToTree(perk: DestinyPerkContainer, perkColumns: DestinyPerkContainer[][]) {
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

    private getPerkConfigsFromTree(perkTree: PerkTreeNode): DestinyPerkContainer[][] {
        let configs: DestinyPerkContainer[][] = [];
        perkTree.children.forEach(perk => {
            configs.push(...this.getPerkConfigsFromNode(perk));
        });
        return configs;
    }

    private getPerkConfigsFromNode(perkNode: PerkTreeNode): DestinyPerkContainer[][] {
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