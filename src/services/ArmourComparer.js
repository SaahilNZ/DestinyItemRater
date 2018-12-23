import ItemComparisonResult from './ItemComparisonResult';

class ArmourComparer {
    compare(item1, item2) {
        if (item1.class !== item2.class) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        if (item1.type !== item2.type) {
            return ItemComparisonResult.ITEM_IS_INCOMPARABLE;
        }
        return ItemComparisonResult.ITEM_IS_EQUIVALENT;
    }
}

export default new ArmourComparer();