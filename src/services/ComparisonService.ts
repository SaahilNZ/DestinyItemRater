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

    compareAll(items: DestinyItemContainer[]): Map<string, DestinyItemComparison[]> {
        let output = new Map<string, DestinyItemComparison[]>();
        items.forEach(container => {
            let comparisons = new Array(items.length - 1);
            for (let i = 0; i < items.length; i++) {
                const item2 = items[i];
                if (container.item.id === item2.item.id) {
                    // skip because we don't want to compare against self
                    continue;
                }
                comparisons[i] = {
                    id: item2.item.id,
                    result: this.compare(container, item2)
                };
            }
            // filter out the one undefined comparison - this is the one we skipped earlier
            output.set(container.item.id, comparisons.filter(c => c));
        });
        return output;
    }
}

export default new ComparisonService();