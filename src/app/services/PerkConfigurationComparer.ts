import ItemComparisonResult from './ItemComparisonResult';
import PerkRating from '../model/PerkRating';
import DestinyItemContainer from '../model/DestinyItemContainer';
import { DestinyPerkContainer, buildPerkContainer, PerkTier } from '../model/DestinyPerkContainer';

interface PerkTreeNode {
    perk: DestinyPerkContainer;
    children: PerkTreeNode[];
}
interface PerkConfiguration {
    perks: DestinyPerkContainer[];
    mode: string;
}
enum PerkComparisonResult {
    PERK_IS_INCOMPARABLE = 0,
    PERK_IS_EQUIVALENT = 1,
    PERK_IS_BETTER = 2,
    PERK_IS_WORSE = 3
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

export default class PerkConfigurationComparer {
    perkRatings: Map<string, PerkRating>;
    compareOrdered: boolean;

    constructor(perkRatings: Map<string, PerkRating>, compareOrdered: boolean) {
        this.perkRatings = perkRatings;
        this.compareOrdered = compareOrdered;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        // determine the best perk configurations for each item
        let item1PerkConfigs = this.getGoodPerkConfigs(item1);
        let item2PerkConfigs = this.getGoodPerkConfigs(item2);

        // compare perk configurations
        return this.compareItemPerkConfigs(item1PerkConfigs, item2PerkConfigs);
    }

    private getGoodPerkConfigs(item: DestinyItemContainer): PerkConfiguration[] {
        const modes = ['PvE', 'PvP'];

        // identify good perks for each mode
        let bestPerksForMode: { mode: string; columns: DestinyPerkContainer[][] }[] =
            modes.map(mode => {
                return {
                    mode: mode,
                    columns: item.perkColumns.map(
                        column => {
                            let highestTierInColumn: number = Math.max(...column.map(p => p.tierByMode[mode]));
                            let isPerkGood: ((perk: DestinyPerkContainer) => boolean) =
                                highestTierInColumn === PerkTier.NO_TIER
                                    ? perk => perk.isGoodByMode[mode]
                                    : perk => perk.tierByMode[mode] === highestTierInColumn;
                            return column.filter(perk => perk && isPerkGood(perk));
                        }).filter(column => column.length > 0)
                };
            });

        // identify available good perk configurations for each mode
        let perkConfigsForMode = bestPerksForMode.map(perksForMode =>
            this.getPerkConfigs(perksForMode.mode, perksForMode.columns));

        // remove duplicate configs
        let perkConfigs: PerkConfiguration[] = [];
        let existingConfigIds: string[] = [];
        [].concat(...perkConfigsForMode).forEach((config: PerkConfiguration) => {
            let id = `${config.mode}_${config.perks.map(perk => perk.name).join('+')}`;
            if (!existingConfigIds.includes(id)) {
                existingConfigIds.push(id);
                perkConfigs.push(config);
            }
        });

        return perkConfigs;
    }

    private getPerkConfigs(mode: string, perks: DestinyPerkContainer[][]): PerkConfiguration[] {
        let perkTree = this.convertToTree(null, perks);
        return this.getPerkConfigsFromTree(perkTree).map(perks => {
            return {
                mode: mode,
                perks: perks
            };
        });
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

    private compareItemPerkConfigs(item1PerkConfigs: PerkConfiguration[], item2PerkConfigs: PerkConfiguration[]): ItemComparisonResult {
        // test whether item 1 contain's all of item 2's configs
        let i1ConfigInclusion = item2PerkConfigs.map(i2Config =>
            this.determineConfigInclusion(i2Config, item1PerkConfigs.filter(c => c.mode === i2Config.mode)));

        // test whether item 2 contain's all of item 1's configs
        let i2ConfigInclusion = item1PerkConfigs.map(i1Config =>
            this.determineConfigInclusion(i1Config, item2PerkConfigs.filter(c => c.mode === i1Config.mode)));

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

    private determineConfigInclusion(configToFind: PerkConfiguration,
        configs: PerkConfiguration[]): ConfigInclusion {

        let comparisons = configs.map(configToTest =>
            this.comparePerkConfigs(configToFind, configToTest));
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

    private comparePerkConfigs(config1: PerkConfiguration, config2: PerkConfiguration)
        : PerkConfigComparisonResult {

        if (this.compareOrdered && config1.perks.length !== config2.perks.length) {
            // configs have a different number of perk columns
            return PerkConfigComparisonResult.CONFIG_IS_INCOMPARABLE;
        }

        let comparisons = this.compareOrdered
            ? this.comparePerkConfigsOrdered(config1, config2)
            : this.comparePerkConfigsUnordered(config1, config2);

        if (comparisons.some(c => c === PerkComparisonResult.PERK_IS_INCOMPARABLE ||
            c === PerkComparisonResult.PERK_IS_WORSE)) {

            // at least one column has a different or worse perk
            return PerkConfigComparisonResult.CONFIG_IS_INCOMPARABLE;
        }

        if (comparisons.some(c => c === PerkComparisonResult.PERK_IS_BETTER)) {
            // config 2 contains at least one better perk than config 1 and no worse perks
            return PerkConfigComparisonResult.CONFIG_IS_BETTER;
        }

        // all perks are equivalent
        return PerkConfigComparisonResult.CONFIG_IS_EQUIVALENT;
    }

    private comparePerkConfigsOrdered(config1: PerkConfiguration, config2: PerkConfiguration)
        : PerkComparisonResult[] {

        let comparisons: PerkComparisonResult[] = [];
        for (let i = 0; i < config1.perks.length; i++) {
            const config1Perk = config1.perks[i];
            const config2Perk = config2.perks[i];
            comparisons.push(this.comparePerk(config1Perk, config2Perk, config1.mode));
        }
        return comparisons;
    }

    private comparePerkConfigsUnordered(config1: PerkConfiguration, config2: PerkConfiguration)
        : PerkComparisonResult[] {

        let comparisons: PerkComparisonResult[] = [];
        config1.perks.forEach(perkToFind => {
            let comparisonsLocal = config2.perks.map(perkToTest =>
                this.comparePerk(perkToFind, perkToTest, config1.mode));
            if (comparisonsLocal.some(c => c === PerkComparisonResult.PERK_IS_BETTER)) {
                // config 2 contains a better version of the perk
                comparisons.push(PerkComparisonResult.PERK_IS_BETTER);
            } else if (comparisonsLocal.some(c => c === PerkComparisonResult.PERK_IS_EQUIVALENT)) {
                // config 2 contains the perk
                comparisons.push(PerkComparisonResult.PERK_IS_EQUIVALENT);
            } else if (comparisonsLocal.some(c => c === PerkComparisonResult.PERK_IS_INCOMPARABLE)) {
                // config 2 does not contain the perk
                comparisons.push(PerkComparisonResult.PERK_IS_INCOMPARABLE);
            } else {
                // config 2 contains a worse version of the perk
                comparisons.push(PerkComparisonResult.PERK_IS_WORSE);
            }
        });
        return comparisons;
    }

    private comparePerk(perk1: DestinyPerkContainer, perk2: DestinyPerkContainer, mode: string): PerkComparisonResult {
        if (perk2.name === perk1.name) {
            // same perk
            return PerkComparisonResult.PERK_IS_EQUIVALENT;
        }

        let upgrades = this.getPerkUpgrades(perk1);
        if (upgrades.some(u => u.name === perk2.name)) {
            // perk 2 is better than perk 1
            return PerkComparisonResult.PERK_IS_BETTER;
        }

        if (perk2.tierByMode[mode] > perk1.tierByMode[mode]) {
            // perk 2 is in a better tier than perk 1
            return PerkComparisonResult.PERK_IS_BETTER;
        }

        if (perk2.tierByMode[mode] < perk1.tierByMode[mode]) {
            // perk 2 is in a worse tier than perk 1
            return PerkComparisonResult.PERK_IS_WORSE;
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
}