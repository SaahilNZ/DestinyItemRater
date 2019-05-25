import { PerkTier } from "./DestinyPerkContainer";

export interface WeaponPerkRating {
    name: string;
    tierByMode: { [mode: string]: PerkTier };
}

export type WeaponPerkRatings = { [itemHash: string]: WeaponPerkRating[] };

export function getWeaponPerkRatings(): WeaponPerkRatings {
    let ratings: WeaponPerkRatings = {
    };
    return ratings;
}