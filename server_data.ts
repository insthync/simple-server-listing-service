export interface IServerData
{
    id? : string;
    address? : string;
    port? : number;
    title? : string;
    description? : string;
    map? : string;
    currentPlayer? : number;
    maxPlayer? : number;
}

export class ServerData implements IServerData
{
    public id : string = "";
    public address : string = "";
    public port : number = 0;
    public title : string = "";
    public description : string = "";
    public map : string = "";
    public currentPlayer : number = 0;
    public maxPlayer : number = 0;

    SetValue(serverData : IServerData) : ServerData
    {
        if (serverData.id !== undefined) this.id = serverData.id;
        if (serverData.address !== undefined) this.address = serverData.address;
        if (serverData.port !== undefined) this.port = serverData.port;
        if (serverData.title !== undefined) this.title = serverData.title;
        if (serverData.description !== undefined) this.description = serverData.description;
        if (serverData.map !== undefined) this.map = serverData.map;
        if (serverData.currentPlayer !== undefined) this.currentPlayer = serverData.currentPlayer;
        if (serverData.maxPlayer !== undefined) this.maxPlayer = serverData.maxPlayer;
        return this;
    }
}