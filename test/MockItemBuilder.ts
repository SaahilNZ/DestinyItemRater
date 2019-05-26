import uuid from 'uuid';
import PerkRating from '../src/model/PerkRating';
import DestinyItemContainer from '../src/model/DestinyItemContainer';
import ItemComparisonResult from '../src/services/ItemComparisonResult';
import { PerkTier } from '../src/model/DestinyPerkContainer';
import { ItemTag } from '../src/services/TaggingService';

class PerkBuilder {
    perk: PerkRating;

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

class ArmorItemBuilder {
    container: DestinyItemContainer;
    classItemType: string;

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
    container: DestinyItemContainer;

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
            perkColumns: [
                [],
                [],
                []
            ]
        };
    }

    itemHash(hash: number) {
        this.container.item.itemHash = hash;
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

export function newPerk() {
    let name = uuid.v4();
    return new PerkBuilder(name);
}

export type ArmorItemDefiner = (builder: ArmorItemBuilder) => ArmorItemBuilder;
export type WeaponItemDefiner = (builder: WeaponItemBuilder) => WeaponItemBuilder;