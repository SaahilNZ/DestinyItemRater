import alt from '../alt';
import PerkSource from '../sources/PerkSource';
import PerkRating from '../model/PerkRating';
import AbstractActionsModel from './AbstractActionsModel';

interface AltPerkActions {
    updatePerks(perks: Map<string, PerkRating>): Map<string, PerkRating>;
    fetchPerks(): (dispatch:any) => void;
    perksFailed(errorMessage: string): string;
}

class PerkActions extends AbstractActionsModel implements AltPerkActions {
    updatePerks(perks: Map<string, PerkRating>): Map<string, PerkRating> {
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

    perksFailed(errorMessage: string): string {
        return errorMessage;
    }
}

export default alt.createActions<AltPerkActions>(PerkActions);