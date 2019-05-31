interface PerkRating {
    name: string;
    isGoodByMode: { [mode: string]: boolean };
    upgrades: string[];
}

export default PerkRating;