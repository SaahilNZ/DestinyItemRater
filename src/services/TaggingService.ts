import DestinyItemContainer from "../model/DestinyItemContainer";
import ItemComparisonResult from "./ItemComparisonResult";

export enum ItemTag {
    KEEP,
    JUNK,
    INFUSE
}

export interface TaggedItem {
    itemContainer: DestinyItemContainer
    tag: ItemTag;
}

class TaggingService {
    tagItems(items: DestinyItemContainer[]): TaggedItem[] {
        let maxInfuseCount = 4;
        let maxPowers = this.getMaxPowerByItemType(items);

        let taggedItems: TaggedItem[] = [];
        let sortedItems = this.sortItemsByPower(items);
        sortedItems.forEach((classMap, classType) => {
            classMap.forEach((slotItems, itemType) => {
                let maxPower = maxPowers.get(classType).get(itemType);
                let infuseCount = 0;
                for (var i = 0; i < slotItems.length; i++) {
                    var item = slotItems[i];

                    let isJunk = false;
                    for (let i = 0; i < item.comparisons.length; i++) {
                        const comparison = item.comparisons[i];
                        if (comparison && comparison.result === ItemComparisonResult.ITEM_IS_BETTER) {
                            isJunk = true;
                            break;
                        }
                    }

                    if (isJunk) {
                        if (item.item.power === maxPower || infuseCount < maxInfuseCount) {
                            taggedItems.push({ itemContainer: item, tag: ItemTag.INFUSE });
                            infuseCount += 1;
                        } else {
                            taggedItems.push({ itemContainer: item, tag: ItemTag.JUNK });
                        }
                    } else {
                        taggedItems.push({ itemContainer: item, tag: ItemTag.KEEP });
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