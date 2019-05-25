import DataWrapper from "./DataWrapper";
import BungieDestinyStat from "./BungieDestinyStat";

export default interface BungieDestinyItemComponents {
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
    reusablePlugHashes?: number[];
    plugHash?: number;
}