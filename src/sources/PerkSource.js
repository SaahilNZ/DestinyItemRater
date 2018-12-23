import Papa from 'papaparse';
import DestinyPerk from '../model/DestinyPerk';

class PerkSource {
    async fetch() {
        return await fetch("data/d2-armour-perks.csv")
            .then(response => response.text())
            .then(csv => Papa.parse(csv))
            .then(parsed => this.populatePerkMap(parsed))
            .catch(error => console.log(error));
    }
    
    populatePerkMap(data) {
        let map = new Map();
        data.data.forEach(perk => {
            map.set(perk[0].toLowerCase(),
                new DestinyPerk(perk[0], perk[1] === 'good',
                    perk[2] === '' ? null : perk[2],
                    perk[3] === '' ? null : perk[3]));
        });
        return map;
    }
}

export default PerkSource;