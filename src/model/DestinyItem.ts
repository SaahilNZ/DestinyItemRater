import PerkRating from "./PerkRating";
import DestinyItemComparison from "./DestinyItemComparison";

interface DestinyItem {
    id: string;
    itemHash: string;
    power: number;
    perkColumnHashes: string[][];
    perkColumns: PerkRating[][];
    comparisons: DestinyItemComparison[];
    group: string;
}

export default DestinyItem;