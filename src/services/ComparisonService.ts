import ArmourComparer from './ArmourComparer'
import DestinyItemComparison from '../model/DestinyItemComparison';
import ItemComparisonResult from './ItemComparisonResult';
import WeaponComparer from './WeaponComparer';
import DestinyItemContainer from '../model/DestinyItemContainer';
import PerkRating from '../model/PerkRating';

type Dictionary<T> = { [key: string]: T };

interface ItemComparer {
    compare(item1: DestinyItemContainer, item2: DestinyItemContainer): ItemComparisonResult;
}

class ComparisonService {
    compareAll(items: DestinyItemContainer[], perkRatings: Map<string, PerkRating>): Map<string, DestinyItemComparison[]> {
        // group items by item group
        let itemsByGroup: Dictionary<DestinyItemContainer[]> = {};
        items.forEach(container => {
            const group = itemsByGroup[container.item.group];
            if (group) {
                group.push(container);
            } else {
                itemsByGroup[container.item.group] = [container];
            }
        });

        let output = new Map<string, DestinyItemComparison[]>();

        for (const groupId in itemsByGroup) {
            const items = itemsByGroup[groupId];

            let comparer = this.getComparer(groupId, perkRatings);
            let groupComparisons = this.compareGroup(items, comparer);

            for (const itemId in groupComparisons) {
                output.set(itemId, groupComparisons[itemId]);
            }
        }

        return output;
    }

    private getComparer(group: string, perkRatings: Map<string, PerkRating>): ItemComparer {
        switch (group) {
            case 'armor':
                return new ArmourComparer(perkRatings);
            case 'weapons':
                return new WeaponComparer(perkRatings);
        }
        return null;
    }

    private compareGroup(items: DestinyItemContainer[], comparer: ItemComparer): Dictionary<DestinyItemComparison[]> {
        const output: Dictionary<DestinyItemComparison[]> = {};

        if (!comparer) {
            items.forEach(container => {
                output[container.item.id] = [];
            });
            return output;
        }

        items.forEach(container => {
            let comparisons = new Array(items.length - 1);
            for (let i = 0; i < items.length; i++) {
                const otherContainer = items[i];
                if (container.item.id === otherContainer.item.id) {
                    // skip because we don't want to compare against self
                    continue;
                }
                comparisons[i] = {
                    id: otherContainer.item.id,
                    result: comparer.compare(container, otherContainer)
                };
            }
            // filter out the one undefined comparison - this is the one we skipped earlier
            output[container.item.id] = comparisons.filter(c => c);
        });

        return output;
    }
}

export default new ComparisonService();