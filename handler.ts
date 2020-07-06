import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { ServerData } from "./server_data.ts";

export class Handler
{
    gameServers : { [id: string] : ServerData; } = {}

    GetGameServers() : ServerData[] {
        const result : ServerData[] = [];
        for (let id in this.gameServers) {
            result.push(this.gameServers[id]);
        }
        return result;
    }

    List(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {
        const gameServers = this.GetGameServers();
        context.response.body = {
            success : true,
            gameServers
        };
    }

    Connect(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {

    }

    Health(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {

    }

    Config(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {
        
    }

    Shutdown(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {

    }
}