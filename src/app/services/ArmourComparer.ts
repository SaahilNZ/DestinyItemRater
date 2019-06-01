import ItemComparisonResult from './ItemComparisonResult';
import PerkRating from '../model/PerkRating';
import DestinyItemContainer from '../model/DestinyItemContainer';
import PerkConfigurationComparer from './PerkConfigurationComparer';

export default class ArmourComparer {
    perkRatings: Map<string, PerkRating>;

    constructor(perkRatings: Map<string, PerkRating>) {
        this.perkRatings = perkRatings;
    }

    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.definition.class !== item2.definition.class) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.definition.itemType !== item2.definition.itemType) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.definition.tier === "Exotic") {
            if (item1.item.itemHash !== item2.item.itemHash) {
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            }
        } else {
            if (item2.definition.tier === "Exotic") {
                return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
            }
        }

        // compare armour items using unordered comparison
        // this means we compare every column in item 1 against each column in item 2
        return new PerkConfigurationComparer(this.perkRatings, false).compare(item1, item2);
    }
}