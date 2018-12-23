import alt from '../alt';
import PerkSource from '../sources/PerkSource';

class PerkActions {
    updatePerks(perks) {
        return perks;
    }

    fetchPerks() {
        return (dispatch) => {
            dispatch();
            let source = new PerkSource();
            source.fetch()
                .then((perks) => {
                    this.updatePerks(perks);
                })
                .catch((errorMessage) => {
                    this.perksFailed(errorMessage);
                })
        }
    }

    perksFailed(errorMessage) {
        return errorMessage;
    }
}

export default alt.createActions(PerkActions);