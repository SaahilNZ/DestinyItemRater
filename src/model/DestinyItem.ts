import PerkRating from "./PerkRating";

interface DestinyItem {
    id: string;
    itemHash: string;
    power: number;
    perkColumnHashes: string[][];
    perkColumns: PerkRating[][];
    group: string;
}

export default DestinyItem;