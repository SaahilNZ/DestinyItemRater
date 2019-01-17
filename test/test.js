import assert from "assert";
import ArmourComparer from "../src/services/ArmourComparer";
import ItemComparisonResult from "../src/services/ItemComparisonResult";
import MockStore from "./MockStore";
import fs from "fs";
import path from "path";
import papa from "papaparse";
import DestinyPerk from "../src/model/DestinyPerk";

require("babel-core/register");
require("babel-polyfill");

function getPerkData() {
  var perkFile = fs.readFileSync(
    path.join(__dirname, "../public/data/d2-armour-perks.csv")
  );

  let perks = [];
  papa.parse(perkFile.toString()).data.slice(1).forEach(perk => {
    if (perk[0].trim() !== "") {
      let upgrades = [];
      if (perk[2] !== "") {
        upgrades.push(perk[2]);
      }
      if (perk[3] !== "") {
        upgrades.push(perk[3]);
      }
      perks.push({
        name: perk[0],
        isGood: perk[1] === "good",
        upgrades: upgrades
      });
    }
  });
  
  let perkMap = new Map();
  perks.forEach(perk => {
    perkMap.set(perk.name.toLowerCase(),
      new DestinyPerk(perk.name, perk.isGood, perk.upgrades));
  });
  return perkMap;
}

describe("ArmourComparer", () => {
  let perkData = getPerkData();
  let perkStore = new MockStore({
    perks: perkData,
    errorMessage: null
  });
  let armourComparer = new ArmourComparer(perkStore);
  describe("compare()", () => {
    it("should return incomparable with mismatched classes", () => {
      let item1 = {
        id: "6917529086448177966",
        itemHash: 2891490654,
        name: "Frostveil Mask",
        class: "Hunter",
        type: "Helmet",
        tier: "Legendary",
        power: 10,
        primaryPerks: [
          {
            name: "Heavy Lifting",
            isGood: true,
            upgrades: ["Enhanced Heavy Lifting"]
          }
        ],
        secondaryPerks: [
          { name: "Special Ammo Finder", isGood: false, upgrades: [] }
        ]
      };
      let item2 = {
        id: "6917529083660248389",
        itemHash: 2411325265,
        name: "Scatterhorn Hood",
        class: "Warlock",
        type: "Helmet",
        tier: "Legendary",
        power: 649,
        primaryPerks: [
          { name: "Remote Connection", isGood: true, upgrades: [] },
          { name: "Scatter Projectile Targeting", isGood: true, upgrades: [] }
        ],
        secondaryPerks: [
          { name: "Heavy Ammo Finder", isGood: false, upgrades: [] },
          { name: "Machine Gun Reserves", isGood: true, upgrades: [] }
        ]
      };
      assert.strictEqual(
        armourComparer.compare(item1, item2),
        ItemComparisonResult.ITEM_IS_INCOMPARABLE
      );
    });
    it("should return incomparable with mismatched types", () => {
      let item1 = {
        id: "6917529086448177966",
        itemHash: 2891490654,
        name: "Frostveil Mask",
        class: "Hunter",
        type: "Helmet",
        tier: "Legendary",
        power: 10,
        primaryPerks: [
          {
            name: "Heavy Lifting",
            isGood: true,
            upgrades: ["Enhanced Heavy Lifting"]
          }
        ],
        secondaryPerks: [
          { name: "Special Ammo Finder", isGood: false, upgrades: [] }
        ]
      };
      let item2 = {
        id: "6917529087630511663",
        itemHash: 3916064886,
        name: "Vigil of Heroes",
        class: "Hunter",
        type: "Chest Armor",
        tier: "Legendary",
        power: 648,
        primaryPerks: [
          { name: "Unflinching Rifle Aim", isGood: true, upgrades: [] },
          { name: "Unflinching Large Arms", isGood: true, upgrades: [] }
        ],
        secondaryPerks: [
          { name: "Pulse Rifle Reserves", isGood: false, upgrades: [] },
          { name: "Scout Rifle Reserves", isGood: false, upgrades: [] }
        ]
      };
      assert.strictEqual(
        armourComparer.compare(item1, item2),
        ItemComparisonResult.ITEM_IS_INCOMPARABLE
      );
    });
    it("should return incomparable if item 1 is exotic, but item 2 is not the same exotic", () => {
      let item1 = {
        id: "6917529081429018383",
        itemHash: 2523259395,
        name: "Crown of Tempests",
        class: "Warlock",
        type: "Helmet",
        tier: "Exotic",
        power: 580,
        primaryPerks: [
          {
            name: "Auto Rifle Targeting",
            isGood: false,
            upgrades: ["Scatter Projectile Targeting"]
          }
        ],
        secondaryPerks: [
          { name: "Special Ammo Finder", isGood: false, upgrades: [] }
        ]
      };
      let item2 = {
        id: "6917529077009256427",
        itemHash: 2523259392,
        name: "Eye of Another World",
        class: "Warlock",
        type: "Helmet",
        tier: "Exotic",
        power: 562,
        primaryPerks: [
          { name: "Kinetic Weapon Targeting", isGood: false, upgrades: [] },
          { name: "Energy Weapon Targeting", isGood: false, upgrades: [] },
          { name: "Enhanced Bow Targeting", isGood: true, upgrades: [] }
        ],
        secondaryPerks: [
          { name: "Rocket Launcher Reserves", isGood: true, upgrades: [] },
          { name: "Sniper Rifle Reserves", isGood: true, upgrades: [] }
        ]
      };
      assert.strictEqual(
        armourComparer.compare(item1, item2),
        ItemComparisonResult.ITEM_IS_INCOMPARABLE
      );
    });
    it("should return worse if item 1 contains all of item 2's good perks, and has more good perks than item 2", () => {
      let item1 = {
        id: "6917529084467248251",
        itemHash: 2442309039,
        name: "Vigil of Heroes",
        class: "Warlock",
        type: "Gauntlets",
        tier: "Legendary",
        power: 614,
        primaryPerks: [
          { name: "Fastball", isGood: true, upgrades: [] },
          {
            name: "Impact Induction",
            isGood: true,
            upgrades: ["Enhanced Impact Induction"]
          }
        ],
        secondaryPerks: [
          {
            name: "Linear Fusion Rifle Scavenger",
            isGood: true,
            upgrades: []
          },
          { name: "Machine Gun Scavenger", isGood: true, upgrades: [] }
        ]
      };
      let item2 = {
        id: "6917529080384581496",
        itemHash: 2598685593,
        name: "Gloves of the Great Hunt",
        class: "Warlock",
        type: "Gauntlets",
        tier: "Legendary",
        power: 581,
        primaryPerks: [
          {
            name: "Fusion Rifle Loader",
            isGood: false,
            upgrades: ["Rifle Loader"]
          },
          {
            name: "Sidearm Loader",
            isGood: false,
            upgrades: ["Light Arms Loader"]
          },
          {
            name: "Impact Induction",
            isGood: true,
            upgrades: ["Enhanced Impact Induction"]
          }
        ],
        secondaryPerks: [
          { name: "Special Ammo Finder", isGood: false, upgrades: [] },
          { name: "Heavy Ammo Finder", isGood: false, upgrades: [] }
        ]
      };
      assert(
        armourComparer.compare(item1, item2),
        ItemComparisonResult.ITEM_IS_WORSE
      );
    });
    it("should return better if item 2 contains all of item 1's good perk perks, and has more good perks than item 1", () => {
      let item1 = {
        id: "6917529080384581496",
        itemHash: 2598685593,
        name: "Gloves of the Great Hunt",
        class: "Warlock",
        type: "Gauntlets",
        tier: "Legendary",
        power: 581,
        primaryPerks: [
          {
            name: "Fusion Rifle Loader",
            isGood: false,
            upgrades: ["Rifle Loader"]
          },
          {
            name: "Sidearm Loader",
            isGood: false,
            upgrades: ["Light Arms Loader"]
          },
          {
            name: "Impact Induction",
            isGood: true,
            upgrades: ["Enhanced Impact Induction"]
          }
        ],
        secondaryPerks: [
          { name: "Special Ammo Finder", isGood: false, upgrades: [] },
          { name: "Heavy Ammo Finder", isGood: false, upgrades: [] }
        ]
      };
      let item2 = {
        id: "6917529084467248251",
        itemHash: 2442309039,
        name: "Vigil of Heroes",
        class: "Warlock",
        type: "Gauntlets",
        tier: "Legendary",
        power: 614,
        primaryPerks: [
          { name: "Fastball", isGood: true, upgrades: [] },
          {
            name: "Impact Induction",
            isGood: true,
            upgrades: ["Enhanced Impact Induction"]
          }
        ],
        secondaryPerks: [
          {
            name: "Linear Fusion Rifle Scavenger",
            isGood: true,
            upgrades: []
          },
          { name: "Machine Gun Scavenger", isGood: true, upgrades: [] }
        ]
      };
      assert(
        armourComparer.compare(item1, item2),
        ItemComparisonResult.ITEM_IS_BETTER
      );
    });
    it("should return incomparable if item 1 and item 2 don't share any good perk configurations", () => {
      let item1 = {
        id: "6917529075494009441",
        itemHash: 2012084760,
        name: "Prodigal Hood",
        class: "Warlock",
        type: "Helmet",
        tier: "Legendary",
        power: 559,
        primaryPerks: [
          { name: "Light Reactor", isGood: true, upgrades: [] },
          { name: "Pump Action", isGood: true, upgrades: [] }
        ],
        secondaryPerks: [
          { name: "Grenade Launcher Reserves", isGood: true, upgrades: [] },
          { name: "Heavy Ammo Finder", isGood: false, upgrades: [] }
        ]
      };
      let item2 = {
        id: "6917529085330714889",
        itemHash: 2012084760,
        name: "Prodigal Hood",
        class: "Warlock",
        type: "Helmet",
        tier: "Legendary",
        power: 617,
        primaryPerks: [
          {
            name: "Ashes To Assets",
            isGood: true,
            upgrades: ["Enhanced Ashes To Assets"]
          },
          {
            name: "Heavy Lifting",
            isGood: true,
            upgrades: ["Enhanced Heavy Lifting"]
          }
        ],
        secondaryPerks: [
          { name: "Fusion Rifle Reserves", isGood: true, upgrades: [] },
          { name: "Sword Reserves", isGood: false, upgrades: [] }
        ]
      };
      assert(
        armourComparer.compare(item1, item2),
        ItemComparisonResult.ITEM_IS_INCOMPARABLE
      );
    });
    it("should return equivalent if item 1 and item 2 have the exact same good perk configurations", () => {
      let item1 = {
        id: "6917529083663271730",
        itemHash: 2475888361,
        name: "Prodigal Gloves",
        class: "Warlock",
        type: "Gauntlets",
        tier: "Legendary",
        power: 573,
        primaryPerks: [
          {
            name: "Grenade Launcher Loader",
            isGood: false,
            upgrades: [
              "Large Weapon Loader",
              "Enhanced Grenade Launcher Loader"
            ]
          },
          { name: "Rifle Loader", isGood: true, upgrades: [] }
        ],
        secondaryPerks: [
          { name: "Grenade Launcher Scavenger", isGood: true, upgrades: [] },
          { name: "Sniper Rifle Scavenger", isGood: true, upgrades: [] }
        ]
      };
      let item2 = {
        id: "6917529085459168441",
        itemHash: 2475888361,
        name: "Prodigal Gloves",
        class: "Warlock",
        type: "Gauntlets",
        tier: "Legendary",
        power: 618,
        primaryPerks: [
          {
            name: "Sidearm Loader",
            isGood: false,
            upgrades: ["Light Arms Loader"]
          },
          { name: "Rifle Loader", isGood: true, upgrades: [] }
        ],
        secondaryPerks: [
          { name: "Grenade Launcher Scavenger", isGood: true, upgrades: [] },
          { name: "Sniper Rifle Scavenger", isGood: true, upgrades: [] }
        ]
      };
      assert(
        armourComparer.compare(item1, item2),
        ItemComparisonResult.ITEM_IS_EQUIVALENT
      );
    });
  });
});
