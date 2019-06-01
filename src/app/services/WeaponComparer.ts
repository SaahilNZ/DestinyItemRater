import ItemComparisonResult from './ItemComparisonResult';
import DestinyItemContainer from '../model/DestinyItemContainer';
import PerkRating from '../model/PerkRating';
import PerkConfigurationComparer from './PerkConfigurationComparer';

export default class WeaponComparer {
    perkRatings: Map<string, PerkRating>;

    constructor(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.item.itemHash !== item2.item.itemHash) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }

        // we only ever compare two instances of the same item therefore we use ordered comparison
        // this means we only compare columns in item 1 against the same column in item 2
        return new PerkConfigurationComparer(this.perkRatings, true).compare(item1, item2);
    }
}