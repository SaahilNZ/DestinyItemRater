import ItemComparisonResult from './ItemComparisonResult';
import PerkRating from '../model/PerkRating';
import DestinyItemContainer from '../model/DestinyItemContainer';

export default class WeaponComparer {
    perkRatings: Map<string, PerkRating>

    constructor(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.item.itemHash === item2.item.itemHash) {
            return ItemComparisonResult.ITEM_IS_EQUIVALENT;
        }
        return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
    }
}