import DestinyPerk from '../model/DestinyPerk';

class PerkSource {
    async fetch() {
        return await fetch("/api/perks")
            .then(response => response.text())
            .then(json => JSON.parse(json))
            .then(parsed => this.populatePerkMap(parsed))
            .catch(error => console.log(error));
    }
    
    populatePerkMap(data) {
        let map = new Map();
        data.perks.forEach(perk => {
            map.set(perk.name.toLowerCase(),
                new DestinyPerk(perk.name, perk.isGood, perk.upgrades));
        });
        return map;
    }
}

export default PerkSource;