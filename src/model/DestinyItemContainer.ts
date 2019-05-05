import DestinyItem from "./DestinyItem";
import DestinyItemDefinition from "./DestinyItemDefinition";
import DestinyItemComparison from "./DestinyItemComparison";

export default interface DestinyItemContainer {
    item: DestinyItem;
    definition: DestinyItemDefinition;
    comparisons: DestinyItemComparison[];
    group: string;
}

export function buildItemContainer(item: DestinyItem,
    itemDefs: Map<string, DestinyItemDefinition>,
    comparisons: Map<string, DestinyItemComparison[]>): DestinyItemContainer {
    let itemDef = itemDefs.get(item.itemHash);
    return itemDef && {
        item: item,
        definition: itemDef,
        comparisons: comparisons.get(item.id),
        group: getItemGroup(itemDef)
    };
}

const ArmourTypes = [
    'Helmet', 'Gauntlets', 'Chest Armor', 'Leg Armor',
    'Warlock Bond', 'Hunter Cloak', 'Titan Mark'
];
const WeaponTypes = [
    'Auto Rifle', 'Pulse Rifle', 'Scout Rifle', 'Hand Cannon', 'Submachine Gun', 'Sidearm', 'Combat Bow',
    'Sniper Rifle', 'Shotgun', 'Fusion Rifle', 'Grenade Launcher',
    'Rocket Launcher', 'Sword', 'Linear Fusion Rifle', 'Machine Gun'
];

// todo: don't export this
export function getItemGroup(itemDef: DestinyItemDefinition): string {
    let isArmor = ArmourTypes.includes(itemDef.itemType);
    let isWeapon = WeaponTypes.includes(itemDef.itemType);

    return isArmor ? 'armor' : (isWeapon ? 'weapons' : null);
}