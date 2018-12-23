import PerkActions from "../actions/PerkActions";
import alt from "../alt";

export class DestinyPerk {
    constructor(name, isGood, upgrade1, upgrade2) {
        this.name = name;
        this.isGood = isGood;
        this.upgrade1 = upgrade1;
        this.upgrade2 = upgrade2;
    }
}

class PerkStore {
    constructor() {
        this.perks = new Map();
        this.errorMessage = null;
        this.bindListeners({
            handleUpdatePerks: PerkActions.UPDATE_PERKS,
            handleFetchPerks: PerkActions.FETCH_PERKS,
            handlePerksFailed: PerkActions.PERKS_FAILED
        })
    }

    handleUpdatePerks(perks) {
        this.perks = perks;
        this.errorMessage = null;
    }

    handleFetchPerks() {
        this.perks = [];
    }

    handlePerksFailed(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

export default alt.createStore(PerkStore, 'PerkStore');