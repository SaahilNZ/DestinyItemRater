import Papa from 'papaparse';
import DestinyPerk from '../model/DestinyPerk';

class PerkSource {
    async fetch() {
        return await fetch("/perks")
            .then(response => response.text())
            .then(csv => Papa.parse(csv))
            .then(parsed => this.populatePerkMap(parsed))
            .catch(error => console.log(error));
    }
    
    populatePerkMap(data) {
        let map = new Map();
        data.data.forEach(perk => {
            let upgrades = [];
            if (perk[2] !== '') {
                upgrades.push(perk[2]);
            }
            if (perk[3] !== '') {
                upgrades.push(perk[3]);
            }

            map.set(perk[0].toLowerCase(),
                new DestinyPerk(perk[0], perk[1] === 'good', upgrades));
        });
        return map;
    }
}

export default PerkSource;