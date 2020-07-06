import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { nanoid } from "https://deno.land/x/nanoid/mod.ts";
import { ServerData } from "./server_data.ts";

export class Handler
{
    gameServers : { [id: string] : ServerData; } = {}

    GetGameServers() : ServerData[] {
        const result : ServerData[] = [];
        for (const id in this.gameServers) {
            result.push(this.gameServers[id]);
        }
        return result;
    }

    List(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {
        const gameServers = this.GetGameServers();
        context.response.status = 200;
        context.response.body = {
            success : true,
            gameServers
        };
    }

    async Connect(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {
        if (!context.request.hasBody)
        {
            context.response.status = 400;
            context.response.body = {
              success: false,
              error: "No Data",
            };
        }
        else
        {
            const body = await context.request.body();
            const value = body.value;
            // NOTE: Not sure there is a form validation library or not.
            const gameServer : ServerData = value;
            gameServer.id = nanoid(16);
            this.gameServers[gameServer.id] = gameServer;
            context.response.status = 200;
            context.response.body = {
              success: true,
              gameServer
            };
        }
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