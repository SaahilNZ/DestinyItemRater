import ArmourComparer from './ArmourComparer'
import PerkStore from '../stores/PerkStore';

class ComparisonService {
    compare(item1, item2) {
        let comparer = new ArmourComparer(PerkStore);
        return comparer.compare(item1, item2);
    }
}

export default new ComparisonService();