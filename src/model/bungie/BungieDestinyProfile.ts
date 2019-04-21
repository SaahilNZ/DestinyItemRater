interface BungieDestinyProfile {
    profileInventory: DataWrapper<BungieDestinyItemInventory>;
    characterInventories: DataWrapper<BungieDestinyItemInventory[]>;
    characterEquipment: DataWrapper<BungieDestinyItemInventory[]>;
    itemComponents: BungieDestinyItemComponents;
}

interface BungieDestinyItemInventory {
    items: BungieDestinyItem[];
}