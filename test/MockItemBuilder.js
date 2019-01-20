import assert from 'assert';
import uuid from 'uuid';

class PerkBuilder {
  constructor(name) {
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
  constructor(item, classItemType) {
    this.item = item;
    this.classItemType = classItemType;
  }

  helmet() {
    this.item.type = "Helmet";
    return this;
  }
  
  gauntlets() {
    this.item.type = "Gauntlets";
    return this;
  }

  chest() {
    this.item.type = "Chest Armor";
    return this;
  }
  
  boots() {
    this.item.type = "Leg Armor";
    return this;
  }
  
  classItem() {
    this.item.type = this.classItemType;
    return this;
  }

  exotic() {
    this.item.tier = "Exotic";
    return this;
  }

  itemHash(hash) {
    this.item.itemHash = hash;
    return this;
  }

  addPrimaryPerk(perk) {
    this.item.primaryPerks.push(perk);
    return this;
  }

  addSecondaryPerk(perk) {
    this.item.secondaryPerks.push(perk);
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
          type: "Helmet",
          primaryPerks: [],
          secondaryPerks: []
        }, "Hunter Cloak"),
        warlock: () => new ArmorItemBuilder({
          class: "Warlock",
          type: "Helmet",
          primaryPerks: [],
          secondaryPerks: []
        }, "Warlock Bond"),
        titan: () => new ArmorItemBuilder({
          class: "Titan",
          type: "Helmet",
          primaryPerks: [],
          secondaryPerks: []
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
  assert(
      armourComparer.compare(item1, item2),
      expected
  );
}