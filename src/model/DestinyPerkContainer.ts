import PerkRating from "./PerkRating";

export default interface DestinyPerkContainer {
    name: string;
    isGoodByMode: { [mode: string]: boolean };
    upgrades: string[];
}

export function buildPerkContainer(perk: PerkRating, ratings: Map<string, PerkRating>): DestinyPerkContainer {
    let rating = ratings.get(perk.name.toLowerCase());

    let isGoodByMode: { [mode: string]: boolean } = {
        'PvE': false,
        'PvP': false
    };
    if (rating && rating.isGoodByMode) {
        isGoodByMode = rating.isGoodByMode;
    }

    return {
        name: perk.name,
        isGoodByMode: isGoodByMode,
        upgrades: (rating && rating.upgrades) || []
    };
}