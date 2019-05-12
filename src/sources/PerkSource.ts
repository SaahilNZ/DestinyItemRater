import PerkRating from "../model/PerkRating";

class PerkSource {
    async fetch(): Promise<Map<string, PerkRating>> {
        return await fetch("/api/perks")
            .then(response => response.text())
            .then(json => JSON.parse(json))
            .then(parsed => this.populatePerkMap(parsed))
            .catch(error => {
                console.log(error);
                throw error;
            });
    }

    private populatePerkMap(data): Map<string, PerkRating> {
        let perkRatingsString = localStorage.getItem("perk_ratings");
        let storedPerkRatings = perkRatingsString != null && perkRatingsString != undefined ?
            JSON.parse(perkRatingsString) : { perks: [] };

        let map = new Map<string, PerkRating>();
        data.perks.forEach(perk => {
            map.set(perk.name.toLowerCase(),
                {
                    name: perk.name,
                    isGoodByMode: perk.isGoodByMode,
                    upgrades: perk.upgrades
                });
        });

        storedPerkRatings.perks.forEach(perk => {
            map.set(perk.name.toLowerCase(),
                {
                    name: perk.name,
                    isGoodByMode: perk.isGoodByMode,
                    upgrades: perk.upgrades
                });
        });

        return map;
    }
}

export default PerkSource;