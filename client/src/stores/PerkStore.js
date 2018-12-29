import PerkActions from "../actions/PerkActions";
import alt from "../alt";

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
        this.perks = new Map();
    }

    handlePerksFailed(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

export default alt.createStore(PerkStore, 'PerkStore');