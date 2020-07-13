import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { nanoid } from "https://deno.land/x/nanoid/mod.ts";
import { IServerData, ServerData } from "./server_data.ts";

export class Handler
{
    periodSeconds : number;
    gameServers : { [id: string] : ServerData; } = {}
    healthTimes : { [id: string] : number; } = {}

    constructor(periodSeconds : number = 5000)
    {
        this.periodSeconds = periodSeconds;
    }

    GetGameServers() : ServerData[]
    {
        const result : ServerData[] = [];
        for (const id in this.gameServers) {
            result.push(this.gameServers[id]);
        }
        return result;
    }

    GetTotalPlayer() : number
    {
        let count = 0;
        for (const id in this.gameServers) {
            count += this.gameServers[id].currentPlayer;
        }
        return count;
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

    TotalPlayer(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {
        const totalPlayer = this.GetTotalPlayer();
        context.response.status = 200;
        context.response.body = {
            success : true,
            totalPlayer
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
            const gameServer : ServerData = new ServerData().SetValue(value);
            gameServer.id = nanoid(16);
            this.gameServers[gameServer.id] = gameServer;
            const time = Date.now();
            this.healthTimes[gameServer.id] = time;
            this.Log('Server id ' + gameServer.id + ' connected at ' + time);
            context.response.status = 200;
            context.response.body = {
              success: true,
              gameServer
            };
        }
    }

    async HealthHandle()
    {
        while (true)
        {
            for (const id in this.gameServers) {
                if (Date.now() - this.healthTimes[id] >= this.periodSeconds)
                {
                    // Kick unhealthy (timed out) game servers
                    delete this.gameServers[id];
                    delete this.healthTimes[id];
                    this.Log('Server id ' + id + ' timed out.');
                }
            }
            // Delay 1 second
            await new Promise((resolve) => setTimeout(resolve, 1000));
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
            const value = body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.healthTimes)
            {
                const time = Date.now();
                this.healthTimes[id] = time;
                this.Log('Server id ' + id + ' health update at ' + time);
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
            const value = body.value;
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
            const value = body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.gameServers)
            {
                delete this.gameServers[id];
                delete this.healthTimes[id];
                this.Log('Server id ' + id + ' shutdown');
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

    private Log(text : string) {
        console.log(text);
    }
}