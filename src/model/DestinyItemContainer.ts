import DestinyItem from "./DestinyItem";
import DestinyItemDefinition from "./DestinyItemDefinition";
import DestinyItemComparison from "./DestinyItemComparison";

export default interface DestinyItemContainer {
    item: DestinyItem;
    definition: DestinyItemDefinition;
    comparisons: DestinyItemComparison[];
}

export function buildItemContainer(item: DestinyItem,
    itemDefs: Map<string, DestinyItemDefinition>,
    comparisons: Map<string, DestinyItemComparison[]>): DestinyItemContainer {
    let itemDef = itemDefs.get(item.itemHash);
    return itemDef && {
        item: item,
        definition: itemDefs.get(item.itemHash),
        comparisons: comparisons.get(item.id)
    };
}