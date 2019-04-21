interface BungieDestinyItemComponents {
    instances: DataWrapper<{ [key: string]: BungieDestinyItemInstance }>;
    sockets: DataWrapper<{ [key: string]: BungieDestinyItemSocketSet }>;
}

interface BungieDestinyItemInstance {
    primaryStat: BungieDestinyStat<number>;
}

interface BungieDestinyItemSocketSet {
    sockets: BungieDestinyItemSocket[];
}

interface BungieDestinyItemSocket {
    reusablePlugHashes: string[];
    plugHash: string;
}