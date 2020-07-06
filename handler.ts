import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { nanoid } from "https://deno.land/x/nanoid/mod.ts";
import { IServerData, ServerData } from "./server_data.ts";

export class Handler
{
    gameServers : { [id: string] : ServerData; } = {}
    healthTimes : { [id: string] : number; } = {}

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
            const value : IServerData = body.value;
            // NOTE: Not sure there is a form validation library or not.
            const gameServer : ServerData = new ServerData().SetValue(value);
            gameServer.id = nanoid(16);
            this.gameServers[gameServer.id] = gameServer;
            this.healthTimes[gameServer.id] = Date.now();
            context.response.status = 200;
            context.response.body = {
              success: true,
              gameServer
            };
        }
    }

    async Health(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
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
            const value : IServerData = body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.healthTimes)
            {
                this.healthTimes[id] = Date.now();
                context.response.status = 200;
                context.response.body = {
                  success: true,
                };
            }
            else
            {
                context.response.status = 404;
                context.response.body = {
                  success: false,
                  error: "Cannot find the server",
                };
            }
        }
    }

    async Update(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
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
            const value : IServerData = body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.gameServers)
            {
                const gameServer : ServerData = this.gameServers[id].SetValue(value);
                this.gameServers[id] = gameServer;
                context.response.status = 200;
                context.response.body = {
                  success: true,
                  gameServer
                };
            }
            else
            {
                context.response.status = 404;
                context.response.body = {
                  success: false,
                  error: "Cannot find the server",
                };
            }
        }
    }

    async Shutdown(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
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
            const value : IServerData = body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.gameServers)
            {
                delete this.gameServers[id];
                delete this.healthTimes[id];
                context.response.status = 200;
                context.response.body = {
                  success: true,
                };
            }
            else
            {
                context.response.status = 404;
                context.response.body = {
                  success: false,
                  error: "Cannot find the server",
                };
            }
        }
    }
}