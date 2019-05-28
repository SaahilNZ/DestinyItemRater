import { PerkTier } from "./DestinyPerkContainer";

export interface WeaponPerkRating {
    name: string;
    tierByMode: { [mode: string]: PerkTier };
}

export type WeaponPerkRatings = { [itemHash: number]: WeaponPerkRating[] };

export type PerkRatings = {
    [mode: string]: {
        s_tier: string[];
        a_tier: string[];
        b_tier: string[];
        c_tier: string[];
    }[]
};

export function getWeaponPerkRatings(): WeaponPerkRatings {
    let goFigurePerks: PerkRatings = {
        'PvE': [
            // magazine
            {
                s_tier: ['ricochet rounds', 'high-caliber rounds'],
                a_tier: ['flared magwell'],
                b_tier: ['armor-piercing rounds', 'light mag', 'appended mag'],
                c_tier: ['alloy magazine', 'extended mag'],
            },
            // trait column 1
            {
                s_tier: ['outlaw'],
                a_tier: ['moving target', 'firmly planted'],
                b_tier: ['zen moment'],
                c_tier: ['under pressure', 'hip-fire grip']
            },
            // trait column 2
            {
                s_tier: ['rampage'],
                a_tier: ['kill clip'],
                b_tier: ['rangefinder'],
                c_tier: ['high-impact reserves', 'full auto trigger system', 'headseeker']
            },
            // kill tracker
            {
                s_tier: [],
                a_tier: [],
                b_tier: [],
                c_tier: ['tracker disabled', 'kill tracker', 'crucible tracker']
            }
        ],
        'PvP': [
            // magazine
            {
                s_tier: ['ricochet rounds'],
                a_tier: ['high-caliber rounds', 'flared magwell'],
                b_tier: ['light mag', 'alloy magazine', 'appended mag'],
                c_tier: ['armor-piercing rounds', 'extended mag'],
            },
            // trait column 1
            {
                s_tier: ['outlaw'],
                a_tier: ['moving target', 'firmly planted', 'zen moment'],
                b_tier: [],
                c_tier: ['under pressure', 'hip-fire grip']
            },
            // trait column 2
            {
                s_tier: ['kill clip'],
                a_tier: ['rampage'],
                b_tier: ['rangefinder', 'headseeker'],
                c_tier: ['high-impact reserves', 'full auto trigger system']
            },
            // kill tracker
            {
                s_tier: [],
                a_tier: [],
                b_tier: [],
                c_tier: ['tracker disabled', 'kill tracker', 'crucible tracker']
            }
        ]
    };

    return buildRatings({
        4138174248: goFigurePerks
    });
}

function buildRatings(perkRatingsByWeapon: { [itemHash: number]: PerkRatings }): WeaponPerkRatings {
    let ratings: WeaponPerkRatings = {};
    for (const itemHash in perkRatingsByWeapon) {
        const perkRatingsByMode = perkRatingsByWeapon[itemHash];
        const perks: { [name: string]: WeaponPerkRating } = {};

        const buildTieredPerk = (perkName: string, mode: string, tier: PerkTier) => {
            let perk: WeaponPerkRating = perks[perkName];
            if (!perk) {
                perk = {
                    name: perkName,
                    tierByMode: {}
                };
                perks[perkName] = perk;
            }
            perk.tierByMode[mode] = tier;
        }

        for (const mode in perkRatingsByMode) {
            const perkRatings = perkRatingsByMode[mode];
            perkRatings.forEach(column => {
                column.s_tier.forEach(perkName => buildTieredPerk(perkName, mode, PerkTier.S_TIER));
                column.a_tier.forEach(perkName => buildTieredPerk(perkName, mode, PerkTier.A_TIER));
                column.b_tier.forEach(perkName => buildTieredPerk(perkName, mode, PerkTier.B_TIER));
                column.c_tier.forEach(perkName => buildTieredPerk(perkName, mode, PerkTier.C_TIER));
            });
        }

        ratings[itemHash] = Object.keys(perks).map(name => perks[name]);
    }
    return ratings;
}