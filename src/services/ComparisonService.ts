import ArmourComparer from './ArmourComparer'
import ItemStore from '../stores/ItemStore'
import DestinyItem from '../model/DestinyItem';
import DestinyItemComparison from '../model/DestinyItemComparison';
import ItemComparisonResult from './ItemComparisonResult';
import WeaponComparer from './WeaponComparer';

interface ItemComparer {
    compare(item1: DestinyItem, item2: DestinyItem): ItemComparisonResult;
}

class ComparisonService {
    compare(item1: DestinyItem, item2: DestinyItem): ItemComparisonResult {
        if (item1.group !== item2.group) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }

        let comparer: ItemComparer = null;
        if (item1.group === 'armor') {
            comparer = new ArmourComparer(ItemStore);
        } else if (item1.group === 'weapons') {
            comparer = new WeaponComparer(ItemStore);
        }

        if (!comparer) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }

        return comparer.compare(item1, item2);
    }

    compareAll(items: DestinyItem[]) {
        let output: { [id: string]: DestinyItemComparison[]; } = {};
        items.forEach(item => {
            let comparisons = new Array(items.length - 1);
            for (let i = 0; i < items.length; i++) {
                const item2 = items[i];
                if (item.id === item2.id) {
                    continue;
                }
                comparisons[i] = {
                    id: item2.id,
                    result: this.compare(item, item2)
                };
            }
            output[item.id] = comparisons;
        });
        return output;
    }
}

export default new ComparisonService();