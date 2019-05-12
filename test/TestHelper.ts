import PerkRating from "../src/model/PerkRating";

class TestHelper {
    createPerkMap(perks: PerkRating[]): Map<string, PerkRating> {
        let perkMap = new Map<string, PerkRating>();
        perks.forEach(perk => {
            perkMap.set(
                perk.name.toLowerCase(),
                {
                    name: perk.name,
                    isGoodByMode: perk.isGoodByMode,
                    upgrades: perk.upgrades
                }
            );
        });
        return perkMap;
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