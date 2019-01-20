import DestinyPerk from "../src/model/DestinyPerk";
import MockStore from './MockStore';

class TestHelper {
  createMockPerkStore(perks) {
    let perkMap = new Map();
    perks.forEach(perk => {
      perkMap.set(
        perk.name.toLowerCase(),
        new DestinyPerk(perk.name, perk.isGood, perk.upgrades)
      );
    });
    return new MockStore({
      perks: perkMap,
      errorMessage: null
    });
  }

  getPermutations(options) {
    let permutations = [];
    options.forEach(option1 => {
      options.forEach(option2 => {
        if (option1 !== option2) {
          permutations.push([option1, option2]);
        }
      });
    });
    return permutations;
  }
}

export default new TestHelper();