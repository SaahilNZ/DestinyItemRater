import { PerkTier } from "./DestinyPerkContainer";

export interface WeaponPerkRating {
    name: string;
    tierByMode: { [mode: string]: PerkTier };
}

export type WeaponPerkRatings = { [itemHash: number]: WeaponPerkRating[] };

export function getWeaponPerkRatings(): WeaponPerkRatings {
    let ratings: WeaponPerkRatings = {
        // Go Figure
        4138174248: [
            // trait column 1
            {
                name: 'outlaw',
                tierByMode: { 'PvE': PerkTier.S_TIER, 'PvP': PerkTier.S_TIER }
            },
            {
                name: 'moving target',
                tierByMode: { 'PvE': PerkTier.A_TIER, 'PvP': PerkTier.A_TIER }
            },
            {
                name: 'firmly planted',
                tierByMode: { 'PvE': PerkTier.A_TIER, 'PvP': PerkTier.A_TIER }
            },
            {
                name: 'zen moment',
                tierByMode: { 'PvE': PerkTier.B_TIER, 'PvP': PerkTier.A_TIER }
            },
            {
                name: 'under pressure',
                tierByMode: { 'PvE': PerkTier.C_TIER, 'PvP': PerkTier.C_TIER }
            },
            {
                name: 'hip-fire grip',
                tierByMode: { 'PvE': PerkTier.C_TIER, 'PvP': PerkTier.C_TIER }
            },

            // trait column 2
            {
                name: 'rampage',
                tierByMode: { 'PvE': PerkTier.S_TIER, 'PvP': PerkTier.A_TIER }
            },
            {
                name: 'kill clip',
                tierByMode: { 'PvE': PerkTier.A_TIER, 'PvP': PerkTier.S_TIER }
            },
            {
                name: 'high-impact reserves',
                tierByMode: { 'PvE': PerkTier.C_TIER, 'PvP': PerkTier.C_TIER }
            },
            {
                name: 'full auto trigger system',
                tierByMode: { 'PvE': PerkTier.C_TIER, 'PvP': PerkTier.C_TIER }
            },
            {
                name: 'rangefinder',
                tierByMode: { 'PvE': PerkTier.B_TIER, 'PvP': PerkTier.B_TIER }
            },
            {
                name: 'headseeker',
                tierByMode: { 'PvE': PerkTier.C_TIER, 'PvP': PerkTier.B_TIER }
            },
        ]
    };
    return ratings;
}