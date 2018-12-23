import Papa from "papaparse";

export class DestinyPerk {
    constructor(name, isGood, upgrade1, upgrade2) {
        this.name = name;
        this.isGood = isGood;
        this.upgrade1 = upgrade1;
        this.upgrade2 = upgrade2;
    }
}