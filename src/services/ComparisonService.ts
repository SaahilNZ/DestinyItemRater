import ArmourComparer from './ArmourComparer'
import ItemStore from '../stores/ItemStore'
import DestinyItemComparison from '../model/DestinyItemComparison';
import ItemComparisonResult from './ItemComparisonResult';
import WeaponComparer from './WeaponComparer';
import DestinyItemContainer from '../model/DestinyItemContainer';

interface ItemComparer {
    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult;
}

class ComparisonService {
    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult {
        if (item1.item.group !== item2.item.group) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }

        let comparer: ItemComparer = null;
        if (item1.item.group === 'armor') {
            comparer = new ArmourComparer(ItemStore);
        } else if (item1.item.group === 'weapons') {
            comparer = new WeaponComparer(ItemStore);
        }

        if (!comparer) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }

        return comparer.compare(item1, item2);
    }

    compareAll(items: DestinyItemContainer[]) {
        let output: { [id: string]: DestinyItemComparison[]; } = {};
        items.forEach(item => {
            let comparisons = new Array(items.length - 1);
            for (let i = 0; i < items.length; i++) {
                const item2 = items[i];
                if (item.item.id === item2.item.id) {
                    continue;
                }
                comparisons[i] = {
                    id: item2.item.id,
                    result: this.compare(item, item2)
                };
            }
            output[item.item.id] = comparisons;
        });
        return output;
    }
}

export default new ComparisonService();