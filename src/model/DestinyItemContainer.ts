import DestinyItem from "./DestinyItem";
import DestinyItemDefinition from "./DestinyItemDefinition";
import DestinyItemComparison from "./DestinyItemComparison";
import PerkRating from "./PerkRating";
import { DestinyPerkContainer, buildPerkContainer, buildWeaponPerkContainer } from "./DestinyPerkContainer";
import { ItemTag } from "../services/TaggingService";
import { WeaponPerkRatings, WeaponPerkRating } from "./WeaponPerkRating";

export default interface DestinyItemContainer {
    item: DestinyItem;
    definition: DestinyItemDefinition;
    comparisons: DestinyItemComparison[];
    group: string;
    tag: ItemTag;
    perkColumns: DestinyPerkContainer[][];
}

export function buildItemContainer(item: DestinyItem,
    itemDefs: Map<string, DestinyItemDefinition>,
    comparisons: Map<string, DestinyItemComparison[]>,
    perkRatings: Map<string, PerkRating>,
    weaponPerkRatings: WeaponPerkRatings,
    itemTags: Map<string, ItemTag>): DestinyItemContainer {

    let itemDef = itemDefs && itemDefs.get(item.itemHash);
    if (!itemDef) return null;

    let group = getItemGroup(itemDef);

    let perkColumns: DestinyPerkContainer[][] = [];
    if (group === 'armor') {
        perkColumns = buildArmorPerkColumns(item.perkColumnHashes, itemDefs, perkRatings);
    } else if (group === 'weapons') {
        perkColumns = buildWeaponPerkColumns(item.perkColumnHashes, itemDefs,
            getWeaponPerkRatingsForItem(weaponPerkRatings, item.itemHash));
    }

    return {
        item: item,
        definition: itemDef,
        comparisons: comparisons && comparisons.get(item.id),
        group: group,
        tag: (itemTags && itemTags.get(item.id)) || ItemTag.KEEP,
        perkColumns: perkColumns
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

function buildArmorPerkColumns(perkColumnHashes: string[][],
    itemDefs: Map<string, DestinyItemDefinition>, ratings: Map<string, PerkRating>)
    : DestinyPerkContainer[][] {

    return buildPerkColumns(perkColumnHashes, [0, 1, 2, 5, 6, 7], itemDefs,
        perk => buildPerkContainer(perk, ratings));
}

function buildWeaponPerkColumns(perkColumnHashes: string[][],
    itemDefs: Map<string, DestinyItemDefinition>, ratings: Map<string, WeaponPerkRating>)
    : DestinyPerkContainer[][] {

    return buildPerkColumns(perkColumnHashes, [0, 1, 2, 3, 4, 9], itemDefs,
        perk => buildWeaponPerkContainer(perk, ratings));
}

function buildPerkColumns(perkColumnHashes: string[][], perkColumnIndices: number[],
    itemDefs: Map<string, DestinyItemDefinition>,
    buildPerkContainer: (perk: PerkRating) => DestinyPerkContainer)
    : DestinyPerkContainer[][] {

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
                return buildPerkContainer(perk);
            }));
        }
    }
    return perkColumns;
}

function getWeaponPerkRatingsForItem(allRatings: WeaponPerkRatings, itemHash: string)
    : Map<string, WeaponPerkRating> {

    let output = new Map<string, WeaponPerkRating>();

    let ratings = allRatings[itemHash];
    if (ratings) {
        ratings.forEach(rating => {
            output.set(rating.name, rating);
        });
    }

    return output;
}