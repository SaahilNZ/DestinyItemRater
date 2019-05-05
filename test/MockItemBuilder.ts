import assert from 'assert';
import uuid from 'uuid';
import PerkRating from '../src/model/PerkRating';
import DestinyItemContainer from '../src/model/DestinyItemContainer';

class PerkBuilder {
    perk: PerkRating;

    constructor(name: string) {
        this.perk = {
            name: name,
            isGood: false,
            upgrades: []
        };
    }

    good() {
        this.perk.isGood = true;
        return this;
    }

    bad() {
        this.perk.isGood = false;
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
    item: DestinyItemContainer;
    classItemType: string;

    constructor(definition, classItemType) {
        this.item = {
            item: {
                id: uuid.v4(),
                itemHash: uuid.v4(),
                power: 700,
                perkColumnHashes: [],
                perkColumns: [
                    [],
                    [],
                    []
                ]
            },
            definition: definition,
            comparisons: null,
            group: null
        };
        this.classItemType = classItemType;
    }

    helmet() {
        this.item.definition.itemType = "Helmet";
        return this;
    }

    gauntlets() {
        this.item.definition.itemType = "Gauntlets";
        return this;
    }

    chest() {
        this.item.definition.itemType = "Chest Armor";
        return this;
    }

    boots() {
        this.item.definition.itemType = "Leg Armor";
        return this;
    }

    classItem() {
        this.item.definition.itemType = this.classItemType;
        return this;
    }

    exotic() {
        this.item.definition.tier = "Exotic";
        return this;
    }

    itemHash(hash) {
        this.item.item.itemHash = hash;
        return this;
    }

    addIntrinsicPerk(perk) {
        this.item.item.perkColumns[0].push(perk);
        return this;
    }

    addPrimaryPerk(perk) {
        this.item.item.perkColumns[1].push(perk);
        return this;
    }

    addSecondaryPerk(perk) {
        this.item.item.perkColumns[2].push(perk);
        return this;
    }

    build() {
        return this.item;
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
        }
    };
}

export function newPerk() {
    let name = uuid.v4();
    return new PerkBuilder(name);
}

export function armourComparerTest(defineItem1, defineItem2, expected, armourComparer) {
    let item1 = defineItem1(newItem().armor().warlock().gauntlets()).build();
    let item2 = defineItem2(newItem().armor().warlock().gauntlets()).build();
    assert.strictEqual(armourComparer.compare(item1, item2), expected);
}