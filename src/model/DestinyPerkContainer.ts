import PerkRating from "./PerkRating";
import WeaponPerkRating from "./WeaponPerkRating";

export enum PerkTier {
    NO_TIER = 0,
    C_TIER = 1,
    B_TIER = 2,
    A_TIER = 3,
    S_TIER = 4
}

export interface DestinyPerkContainer {
    name: string;
    isGoodByMode: { [mode: string]: boolean };
    tierByMode: { [mode: string]: PerkTier };
    upgrades: string[];
}

export function buildPerkContainer(perk: PerkRating, ratings: Map<string, PerkRating>): DestinyPerkContainer {
    let rating = ratings.get(perk.name.toLowerCase());

    let isGoodByMode: { [mode: string]: boolean } = {
        'PvE': false,
        'PvP': false
    };
    let tierByMode: { [mode: string]: PerkTier } = {
        'PvE': PerkTier.NO_TIER,
        'PvP': PerkTier.NO_TIER
    };
    if (rating && rating.isGoodByMode) {
        isGoodByMode = rating.isGoodByMode;
    }

    return {
        name: perk.name,
        isGoodByMode: isGoodByMode,
        tierByMode: tierByMode,
        upgrades: (rating && rating.upgrades) || []
    };
}

export function buildWeaponPerkContainer(perk: PerkRating, ratings: Map<string, WeaponPerkRating>): DestinyPerkContainer {
    let rating = ratings.get(perk.name.toLowerCase());
    return {
        name: perk.name,
        isGoodByMode: {
            'PvE': false,
            'PvP': false
        },
        tierByMode: (rating && rating.tierByMode) || {
            // all perks are S-tier by default
            'PvE': PerkTier.S_TIER,
            'PvP': PerkTier.S_TIER
        },
        upgrades: []
    };
}