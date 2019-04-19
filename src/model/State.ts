import DestinyAccount from "./DestinyAccount";
import PerkRating from "./PerkRating";
import DestinyItem from "./DestinyItem";
import ItemDefinition from "./ItemDefinition";

export interface AccountState {
    selectedAccount: DestinyAccount;
    allAccounts: DestinyAccount[];
}

export interface ItemsState {
    items: DestinyItem[];
    itemDefs: Map<string, ItemDefinition>;
    perkRatings: Map<string, PerkRating>;
    errorMessage: string;
}

export interface MainAppState {
    signedIn: boolean;
    accounts: AccountState;
    items: ItemsState;
    showAllItems: boolean;
    showBadItems: boolean;
    showWeapons: boolean;
    showSearch: boolean;
    showPerkRater: boolean;
    junkSearchString: string;
    infuseSearchString: string;
    copyResult: string;
    perkRatings: Map<string, PerkRating>;
}