import ItemComparisonResult from './ItemComparisonResult';
import DestinyItemContainer from '../model/DestinyItemContainer';

export default class WeaponComparer {
    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.item.itemHash === item2.item.itemHash) {
            return ItemComparisonResult.ITEM_IS_EQUIVALENT;
        }
        return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
    }
}