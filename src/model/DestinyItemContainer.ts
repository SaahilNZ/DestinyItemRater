import DestinyItem from "./DestinyItem";
import DestinyItemDefinition from "./DestinyItemDefinition";
import DestinyItemComparison from "./DestinyItemComparison";
import PerkRating from "./PerkRating";
import DestinyPerkContainer, { buildPerkContainer } from "./DestinyPerkContainer";

export default interface DestinyItemContainer {
    item: DestinyItem;
    definition: DestinyItemDefinition;
    comparisons: DestinyItemComparison[];
    group: string;
    perkColumns: DestinyPerkContainer[][];
}

export function buildItemContainer(item: DestinyItem,
    itemDefs: Map<string, DestinyItemDefinition>,
    comparisons: Map<string, DestinyItemComparison[]>,
    perkRatings: Map<string, PerkRating>): DestinyItemContainer {

    let itemDef = itemDefs.get(item.itemHash);
    if (!itemDef) return null;

    let group = getItemGroup(itemDef);
    return {
        item: item,
        definition: itemDef,
        comparisons: comparisons.get(item.id),
        group: group,
        perkColumns: buildPerkColumns(item.perkColumnHashes, group, itemDefs, perkRatings)
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

function getItemGroup(itemDef: DestinyItemDefinition): string {
    let isArmor = ArmourTypes.includes(itemDef.itemType);
    let isWeapon = WeaponTypes.includes(itemDef.itemType);

    return isArmor ? 'armor' : (isWeapon ? 'weapons' : null);
}

function buildPerkColumns(perkColumnHashes: string[][], group: string,
    itemDefs: Map<string, DestinyItemDefinition>, ratings: Map<string, PerkRating>)
    : DestinyPerkContainer[][] {

    let perkColumnIndices =
        group === 'armor' ? [0, 1, 2, 5, 6, 7] :
            group === 'weapons' ? [0, 1, 2, 3, 4, 9] :
                [];

    let perkColumns: DestinyPerkContainer[][] = [];
    for (let i = 0; i < perkColumnHashes.length; i++) {
        if (perkColumnIndices.includes(i)) {
            const column = perkColumnHashes[i];
            perkColumns.push(column.map(hash => {
                let plugDefinition = itemDefs.get(hash);
                let perk: PerkRating = {
                    name: (plugDefinition && plugDefinition.name) || "",
                    isGoodByMode: {
                        'PvE': false,
                        'PvP': false
                    },
                    upgrades: []
                };
                return buildPerkContainer(perk, ratings);
            }));
        }
    }
    return perkColumns;
}