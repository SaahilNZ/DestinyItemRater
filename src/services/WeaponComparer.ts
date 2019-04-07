import ItemComparisonResult from './ItemComparisonResult';
import DestinyItem from '../model/DestinyItem';
import PerkRating from '../model/PerkRating';
import Store from '../stores/Store';

export default class WeaponComparer {
    perkStore: Store<{ perkRatings: Map<string, PerkRating> }>
    perks: Map<string, PerkRating>

    constructor(perkStore) {
        this.perkStore = perkStore;
        this.perks = this.perkStore.getState().perkRatings;
    }

    compare(item1: DestinyItem, item2: DestinyItem): ItemComparisonResult {
        if (item1.itemHash === item2.itemHash) {
            return ItemComparisonResult.ITEM_IS_EQUIVALENT;
        }
        return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
    }
}