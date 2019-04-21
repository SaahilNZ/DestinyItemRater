import DestinyAccount from "./DestinyAccount";
import PerkRating from "./PerkRating";
import DestinyItem from "./DestinyItem";
import DestinyItemDefinition from "./DestinyItemDefinition";

export interface AccountState {
    selectedAccount: DestinyAccount;
    allAccounts: DestinyAccount[];
}

export interface ItemsState {
    items: DestinyItem[];
    itemDefinitions: Map<string, DestinyItemDefinition>;
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