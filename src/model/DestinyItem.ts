import PerkRating from "./PerkRating";
import DestinyItemComparison from "./DestinyItemComparison";

interface DestinyItem {
    id: string;
    itemHash: string;
    name: string;
    class: string;
    type: string;
    tier: string;
    power: number;
    perkColumns: PerkRating[][];
    comparisons: DestinyItemComparison[];
}

export default DestinyItem;