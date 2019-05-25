import assert from 'assert';
import TaggingService, { ItemTag } from '../src/services/TaggingService';
import DestinyItemContainer from '../src/model/DestinyItemContainer';
import { newItem } from './MockItemBuilder';
import ItemComparisonResult from '../src/services/ItemComparisonResult';


describe("TaggingService", () => {
    describe("tagItems()", () => {
        it("should return an empty map if the items array is empty", () => {
            let items: DestinyItemContainer[] = [];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.size, 0);
        });

        it("should return an empty map if the items array is null", () => {
            let itemTags = TaggingService.tagItems(null);
            assert.strictEqual(itemTags.size, 0);
        });

        it("should tag an item with no comparisons as keep", () => {
            let items: DestinyItemContainer[] = [
                newItem().armor().hunter().chest().build()
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.KEEP);
        });

        it("should tag good items as keep", () => {
            let items: DestinyItemContainer[] = [
                buildComparedItem(700, 'hunter', 'chest', true)
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.KEEP);
        });

        it("should tag the only bad item as infuse", () => {
            let items: DestinyItemContainer[] = [
                buildComparedItem(700, 'hunter', 'chest', false)
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.INFUSE);
        });

        it("should only tag the 4 highest power bad items in a given slot as infuse", () => {
            let items: DestinyItemContainer[] = [
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(600, 'hunter', 'chest', false),
                buildComparedItem(500, 'hunter', 'chest', false),
                buildComparedItem(400, 'hunter', 'chest', false),
                buildComparedItem(300, 'hunter', 'chest', false)
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[1].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[2].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[3].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[4].item.id), ItemTag.JUNK);
        });

        it("should not count good items towards infuse counts", () => {
            let items: DestinyItemContainer[] = [
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(600, 'hunter', 'chest', true),
                buildComparedItem(500, 'hunter', 'chest', false),
                buildComparedItem(400, 'hunter', 'chest', false),
                buildComparedItem(300, 'hunter', 'chest', false)
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[1].item.id), ItemTag.KEEP);
            assert.strictEqual(itemTags.get(items[2].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[3].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[4].item.id), ItemTag.INFUSE);
        });

        it("should not count items in a given slot towards another slot's infuse count", () => {
            let items: DestinyItemContainer[] = [
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(600, 'hunter', 'helmet', false),
                buildComparedItem(500, 'hunter', 'chest', false),
                buildComparedItem(400, 'hunter', 'chest', false),
                buildComparedItem(300, 'hunter', 'chest', false)
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[1].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[2].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[3].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[4].item.id), ItemTag.INFUSE);
        });

        it("should not count items for a given class towards another class' infuse counts", () => {
            let items: DestinyItemContainer[] = [
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(600, 'warlock', 'chest', false),
                buildComparedItem(500, 'hunter', 'chest', false),
                buildComparedItem(400, 'hunter', 'chest', false),
                buildComparedItem(300, 'hunter', 'chest', false)
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[1].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[2].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[3].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[4].item.id), ItemTag.INFUSE);
        });

        it("should tag bad items at the highest power as infuse regardless of the slot's infuse count", () => {
            let items: DestinyItemContainer[] = [
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(700, 'hunter', 'chest', false),
                buildComparedItem(300, 'hunter', 'chest', false)
            ];
            let itemTags = TaggingService.tagItems(items);
            assert.strictEqual(itemTags.get(items[0].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[1].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[2].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[3].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[4].item.id), ItemTag.INFUSE);
            assert.strictEqual(itemTags.get(items[5].item.id), ItemTag.JUNK);
        });
    });
});

function buildComparedItem(power: number,
    itemClass: 'hunter' | 'warlock' | 'titan',
    slot: 'helmet' | 'gauntlets' | 'chest' | 'boots' | 'classItem',
    isGood: boolean): DestinyItemContainer {

    return newItem().armor()[itemClass]()[slot]().power(power)
        .addComparison('1', isGood
            ? ItemComparisonResult.ITEM_IS_WORSE
            : ItemComparisonResult.ITEM_IS_BETTER)
        .build();
}