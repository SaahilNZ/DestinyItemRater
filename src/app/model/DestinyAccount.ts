class DestinyAccount {
    membershipId: string;
    membershipType: number;
    displayName: string;

    constructor(membershipId: string, membershipType: number, displayName: string) {
        this.membershipId = membershipId;
        this.membershipType = membershipType;
        this.displayName = displayName;
    }

    getPlatformName(platformId: number) : string {
        let platform: string;
        if (platformId === 1) {
            platform = "Xbox";
        } else if (platformId === 2) {
            platform = "PS";
        } else if (platformId === 4) {
            platform = "PC";
        } else {
            platform = "?";
        }
        return platform;
    }
}

export default DestinyAccount;