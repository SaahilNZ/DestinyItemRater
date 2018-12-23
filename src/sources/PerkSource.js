import Papa from 'papaparse';
import { DestinyPerk } from '../data';

let perkMap;

class PerkSource {
    async fetch() {
        if (perkMap == null) {
            let tempMap = new Map();
            await fetch("data/d2-armour-perks.csv")
            .then(csv => csv.text())
            .then(data => Papa.parse(data))
            .then(parsed => populatePerkMap(tempMap, parsed));
            perkMap = tempMap;
            return perkMap;
        }
        return perkMap;
    }

    populatePerkMap(map, data) {
        data.data.forEach(perk => {
            map.set(perk[0].toLowerCase(),
                new DestinyPerk(perk[0], perk[1] === 'good',
                    perk[2] === '' ? null : perk[2],
                    perk[3] === '' ? null : perk[3]));
        })
    }
}

export default PerkSource;