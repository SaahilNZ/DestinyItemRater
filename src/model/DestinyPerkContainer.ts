import PerkRating from "./PerkRating";

export default interface DestinyPerkContainer {
    name: string;
    isGood: boolean;
    upgrades: string[];
}

export function buildPerkContainer(perk: PerkRating, ratings: Map<string, PerkRating>): DestinyPerkContainer {
    let rating = ratings.get(perk.name.toLowerCase());
    return {
        name: perk.name,
        isGood: (rating && rating.isGood) || false,
        upgrades: (rating && rating.upgrades) || []
    };
}