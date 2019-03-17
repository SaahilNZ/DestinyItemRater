import PerkRating from "../model/PerkRating";

class PerkSource {
    async fetch() {
        return await fetch("/api/perks")
            .then(response => response.text())
            .then(json => JSON.parse(json))
            .then(parsed => this.populatePerkMap(parsed))
            .catch(error => console.log(error));
    }
    
    populatePerkMap(data): Map<string, PerkRating> {
        let map = new Map<string, PerkRating>();
        data.perks.forEach(perk => {
            map.set(perk.name.toLowerCase(),
                {
                    name: perk.name,
                    isGood: perk.isGood,
                    upgrades: perk.upgrades
                });
        });
        return map;
    }
}

export default PerkSource;