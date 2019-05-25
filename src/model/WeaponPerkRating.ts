import { PerkTier } from "./DestinyPerkContainer";

export default interface WeaponPerkRating {
    name: string;
    tierByMode: { [mode: string]: PerkTier };
}