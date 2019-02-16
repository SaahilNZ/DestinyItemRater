import ArmourComparer from './ArmourComparer'
import PerkStore from '../stores/PerkStore';

class ComparisonService {
    compare(item1, item2) {
        let comparer = new ArmourComparer(PerkStore);
        return comparer.compare(item1, item2);
    }

    compareAll(items) {
        return items.map(item => {
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
            return {
                id: item.id,
                comparisons: comparisons
            };
        });
    }
}

export default new ComparisonService();