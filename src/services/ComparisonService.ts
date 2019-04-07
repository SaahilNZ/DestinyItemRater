import ArmourComparer from './ArmourComparer'
import ItemStore from '../stores/ItemStore'
import DestinyItem from '../model/DestinyItem';
import DestinyItemComparison from '../model/DestinyItemComparison';

class ComparisonService {
    compare(item1: DestinyItem, item2: DestinyItem) {
        let comparer = new ArmourComparer(ItemStore);
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