import ItemComparisonResult from './ItemComparisonResult';
import PerkRating from '../model/PerkRating';
import Store from '../stores/Store';
import DestinyItemContainer from '../model/DestinyItemContainer';

export default class WeaponComparer {
    perkStore: Store<{ perkRatings: Map<string, PerkRating> }>
    perks: Map<string, PerkRating>

    constructor(perkStore) {
        this.perkStore = perkStore;
        this.perks = this.perkStore.getState().perkRatings;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.item.itemHash === item2.item.itemHash) {
            return ItemComparisonResult.ITEM_IS_EQUIVALENT;
        }
        return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
    }
}