import DestinyAccount from "./DestinyAccount";
import PerkRating from "./PerkRating";

export interface AccountState {
    selectedAccount: DestinyAccount;
    allAccounts: DestinyAccount[];
}

export interface MainAppState {
    signedIn: boolean;
    accounts: AccountState;
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