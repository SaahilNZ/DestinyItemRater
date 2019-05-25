import ItemComparisonResult from './ItemComparisonResult';
import DestinyItemContainer from '../model/DestinyItemContainer';
import { WeaponPerkRatings } from '../model/WeaponPerkRating';

export default class WeaponComparer {
    perkRatings: WeaponPerkRatings

    constructor(perkRatings: WeaponPerkRatings) {
        this.perkRatings = perkRatings;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.item.itemHash === item2.item.itemHash) {
            return ItemComparisonResult.ITEM_IS_EQUIVALENT;
        }
        return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
    }
}