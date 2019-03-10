interface DestinyItem {
    id: string;
    itemHash: string;
    name: string;
    class: string;
    type: string;
    tier: string;
    power: number;
    perkColumns: any[];
    comparisons: any[];
}

export default DestinyItem;