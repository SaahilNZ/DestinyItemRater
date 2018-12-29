import ArmourComparer from './ArmourComparer'

class ComparisonService {
    compare(item1, item2) {
        let comparer = ArmourComparer;
        return comparer.compare(item1, item2);
    }
}

export default new ComparisonService();