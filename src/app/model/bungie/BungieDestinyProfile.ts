import BungieDestinyItem from "./BungieDestinyItem";
import DataWrapper from "./DataWrapper";
import BungieDestinyItemComponents from "./BungieDestinyItemComponents";

export default interface BungieDestinyProfile {
    profileInventory: DataWrapper<BungieDestinyItemInventory>;
    characterInventories: DataWrapper<BungieDestinyItemInventory[]>;
    characterEquipment: DataWrapper<BungieDestinyItemInventory[]>;
    itemComponents: BungieDestinyItemComponents;
}

export interface BungieDestinyItemInventory {
    items: BungieDestinyItem[];
}