import DestinyItemContainer from "../model/DestinyItemContainer";
import ItemComparisonResult from "./ItemComparisonResult";

export enum ItemTag {
    KEEP,
    JUNK,
    INFUSE
}

class TaggingService {
    tagItems(items: DestinyItemContainer[]): Map<string, ItemTag> {
        let taggedItems: Map<string, ItemTag> = new Map();
        if (!items) {
            return taggedItems;
        }
        let maxInfuseCount = 4;
        let maxPowers = this.getMaxPowerByItemType(items);

        let sortedItems = this.sortItemsByPower(items);
        sortedItems.forEach((classMap, classType) => {
            classMap.forEach((slotItems, itemType) => {
                let maxPower = maxPowers.get(classType).get(itemType);
                let infuseCount = 0;
                for (var i = 0; i < slotItems.length; i++) {
                    var item = slotItems[i];

                    let isJunk = false;
                    if (item.comparisons) {
                        for (let i = 0; i < item.comparisons.length; i++) {
                            const comparison = item.comparisons[i];
                            if (comparison && comparison.result === ItemComparisonResult.ITEM_IS_BETTER) {
                                isJunk = true;
                                break;
                            }
                        }
                    }

                    if (isJunk) {
                        if (item.item.power === maxPower || infuseCount < maxInfuseCount) {
                            taggedItems.set(item.item.id, ItemTag.INFUSE);
                            infuseCount += 1;
                        } else {
                            taggedItems.set(item.item.id, ItemTag.JUNK);
                        }
                    } else {
                        taggedItems.set(item.item.id, ItemTag.KEEP);
                    }
                }
            });
        });
        return taggedItems;
    }

    private sortItemsByPower(items: DestinyItemContainer[]): Map<string, Map<string, DestinyItemContainer[]>> {
        let sortedItems = new Map<string, Map<string, DestinyItemContainer[]>>();
        items.forEach(item => {
            let classMap = sortedItems.get(item.definition.class);
            if (classMap) {
                let itemArray = classMap.get(item.definition.itemType);
                if (itemArray) {
                    itemArray.push(item);
                } else {
                    classMap.set(item.definition.itemType, [item]);
                }
            } else {
                classMap = new Map<string, DestinyItemContainer[]>();
                classMap.set(item.definition.itemType, [item]);
                sortedItems.set(item.definition.class, classMap);
            }
        });

        sortedItems.forEach(classMap => {
            classMap.forEach(slotItems => {
                slotItems.sort((a: DestinyItemContainer,
                    b: DestinyItemContainer) => b.item.power - a.item.power);
            });
        });
        return sortedItems;
    }

    private getMaxPowerByItemType(items: DestinyItemContainer[]): Map<string, Map<string, number>> {
        let maxPowers = new Map<string, Map<string, number>>();
        items.forEach(item => {
            let classMap = maxPowers.get(item.definition.class);
            if (classMap) {
                let itemTypePower = classMap.get(item.definition.itemType);
                if (itemTypePower) {
                    if (item.item.power > itemTypePower) {
                        classMap.set(item.definition.itemType, item.item.power);
                    }
                } else {
                    classMap.set(item.definition.itemType, item.item.power);
                }
            } else {
                classMap = new Map<string, number>();
                classMap.set(item.definition.itemType, item.item.power);
                maxPowers.set(item.definition.class, classMap);
            }
        });
        return maxPowers;
    }
}

export default new TaggingService();