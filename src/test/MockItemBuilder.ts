import uuid from 'uuid';
import PerkRating from '../app/model/PerkRating';
import DestinyItemContainer from '../app/model/DestinyItemContainer';
import ItemComparisonResult from '../app/services/ItemComparisonResult';
import { PerkTier } from '../app/model/DestinyPerkContainer';
import { ItemTag } from '../app/services/TaggingService';
import { WeaponPerkRating } from '../app/model/WeaponPerkRating';

class PerkBuilder {
    private perk: PerkRating;

    constructor(name: string) {
        this.perk = {
            name: name,
            isGoodByMode: {
                'PvE': false,
                'PvP': false
            },
            upgrades: []
        };
    }

    good() {
        this.perk.isGoodByMode = {
            'PvE': true,
            'PvP': true
        };
        return this;
    }

    bad() {
        this.perk.isGoodByMode = {
            'PvE': false,
            'PvP': false
        };
        return this;
    }

    upgrade() {
        let upgradeName = uuid.v4();
        let upgradedPerk = new PerkBuilder(upgradeName);
        this.perk.upgrades = this.perk.upgrades.concat(upgradeName);
        return upgradedPerk;
    }

    build() {
        return this.perk;
    }
}

class WeaponPerkBuilder {
    private perk: WeaponPerkRating;

    constructor(name: string) {
        this.perk = {
            name: name,
            tierByMode: {
                'PvE': PerkTier.S_TIER,
                'PvP': PerkTier.S_TIER
            }
        };
    }

    pve(tier: ('S' | 'A' | 'B' | 'C')): WeaponPerkBuilder {
        this.perk.tierByMode['PvE'] = this.parseTier(tier);
        return this;
    }

    pvp(tier: ('S' | 'A' | 'B' | 'C')): WeaponPerkBuilder {
        this.perk.tierByMode['PvP'] = this.parseTier(tier);
        return this;
    }

    private parseTier(tier: ('S' | 'A' | 'B' | 'C')): PerkTier {
        switch (tier) {
            case 'S':
                return PerkTier.S_TIER;
            case 'A':
                return PerkTier.A_TIER;
            case 'B':
                return PerkTier.B_TIER;
            case 'C':
                return PerkTier.C_TIER;
        }
    }

    build(): WeaponPerkRating {
        return this.perk;
    }
}

class ArmorItemBuilder {
    private container: DestinyItemContainer;
    private classItemType: string;

    constructor(definition, classItemType) {
        this.container = {
            item: {
                id: uuid.v4(),
                itemHash: uuid.v4(),
                power: 700,
                perkColumnHashes: []
            },
            definition: definition,
            comparisons: null,
            group: null,
            tag: ItemTag.KEEP,
            perkColumns: [
                [],
                [],
                []
            ]
        };
        this.classItemType = classItemType;
    }

    helmet() {
        this.container.definition.itemType = "Helmet";
        return this;
    }

    gauntlets() {
        this.container.definition.itemType = "Gauntlets";
        return this;
    }

    chest() {
        this.container.definition.itemType = "Chest Armor";
        return this;
    }

    boots() {
        this.container.definition.itemType = "Leg Armor";
        return this;
    }

    classItem() {
        this.container.definition.itemType = this.classItemType;
        return this;
    }

    exotic() {
        this.container.definition.tier = "Exotic";
        return this;
    }

    itemHash(hash: number) {
        this.container.item.itemHash = hash;
        return this;
    }

    power(power: number) {
        this.container.item.power = power;
        return this;
    }

    addIntrinsicPerk(rating: PerkRating) {
        this.container.perkColumns[0].push({
            ...rating,
            tierByMode: {
                'PvE': PerkTier.NO_TIER,
                'PvP': PerkTier.NO_TIER
            }
        });
        return this;
    }

    addPrimaryPerk(rating: PerkRating) {
        this.container.perkColumns[1].push({
            ...rating,
            tierByMode: {
                'PvE': PerkTier.NO_TIER,
                'PvP': PerkTier.NO_TIER
            }
        });
        return this;
    }

    addSecondaryPerk(rating: PerkRating) {
        this.container.perkColumns[2].push({
            ...rating,
            tierByMode: {
                'PvE': PerkTier.NO_TIER,
                'PvP': PerkTier.NO_TIER
            }
        });
        return this;
    }

    addComparison(itemId: string, result: ItemComparisonResult) {
        if (!this.container.comparisons) {
            this.container.comparisons = [];
        }
        this.container.comparisons.push({
            id: itemId,
            result: result
        });
        return this;
    }

    build() {
        return this.container;
    }
}

class WeaponItemBuilder {
    private container: DestinyItemContainer;

    constructor() {
        this.container = {
            item: {
                id: uuid.v4(),
                itemHash: uuid.v4(),
                power: 700,
                perkColumnHashes: []
            },
            definition: null,
            comparisons: null,
            group: null,
            tag: ItemTag.KEEP,
            perkColumns: []
        };
    }

    itemHash(hash: number) {
        this.container.item.itemHash = hash;
        return this;
    }

    addPerkColumn(perks: WeaponPerkRating[]): WeaponItemBuilder {
        this.container.perkColumns.push(
            perks.map(perk => {
                return {
                    ...perk,
                    isGoodByMode: {
                        'PvE': false,
                        'PvP': false
                    },
                    upgrades: []
                }
            }));
        return this;
    }

    build() {
        return this.container;
    }
}

export function newItem() {
    return {
        armor: () => {
            return {
                hunter: () => new ArmorItemBuilder({
                    class: "Hunter",
                    itemType: "Helmet"
                }, "Hunter Cloak"),
                warlock: () => new ArmorItemBuilder({
                    class: "Warlock",
                    itemType: "Helmet"
                }, "Warlock Bond"),
                titan: () => new ArmorItemBuilder({
                    class: "Titan",
                    itemType: "Helmet"
                }, "Titan Mark")
            };
        },
        weapon: () => new WeaponItemBuilder()
    };
}

export function newPerk(): PerkBuilder {
    let name = uuid.v4();
    return new PerkBuilder(name);
}

export function newWeaponPerk(name: string): WeaponPerkBuilder {
    return new WeaponPerkBuilder(name);
}

export type ArmorItemDefiner = (builder: ArmorItemBuilder) => ArmorItemBuilder;
export type WeaponItemDefiner = (builder: WeaponItemBuilder) => WeaponItemBuilder;