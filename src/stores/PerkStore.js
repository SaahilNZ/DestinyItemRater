import PerkActions from "../actions/PerkActions";
import alt from "../alt";
import ItemActions from "../actions/ItemActions";

class PerkStore {
    constructor() {
        this.perks = [];
        this.errorMessage = null;
        this.bindListeners({
            handleUpdatePerks: PerkActions.UPDATE_PERKS,
            handleFetchPerks: PerkActions.FETCH_PERKS,
            handlePerksFailed: ItemActions.PERKS_FAILED
        })
    }

    handleUpdatePerks(perks) {
        this.perks = perks;
        this.errorMessage = null;
    }

    handleFetchItems() {
        this.perks = [];
    }

    handlePerksFailed(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

export default alt.createStore(PerkStore, 'PerkStore');