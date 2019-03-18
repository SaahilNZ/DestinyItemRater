import PerkRating from "../src/model/PerkRating";
import MockStore from './MockStore';

interface MockPerkStore {
  perkRatings: Map<string, PerkRating>;
  errorMessage: string;
}

class TestHelper {
  createMockPerkStore(perks: PerkRating[]): MockStore<MockPerkStore> {
    let perkMap = new Map<string, PerkRating>();
    perks.forEach(perk => {
      perkMap.set(
        perk.name.toLowerCase(),
        {
          name: perk.name,
          isGood: perk.isGood,
          upgrades: perk.upgrades
        }
      );
    });
    return new MockStore<MockPerkStore>({
      perkRatings: perkMap,
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