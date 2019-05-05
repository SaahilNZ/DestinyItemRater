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

    itemHash(hash) {
        this.container.item.itemHash = hash;
        return this;
    }

    addIntrinsicPerk(perk) {
        this.container.perkColumns[0].push(perk);
        return this;
    }

    addPrimaryPerk(perk) {
        this.container.perkColumns[1].push(perk);
        return this;
    }

    addSecondaryPerk(perk) {
        this.container.perkColumns[2].push(perk);
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