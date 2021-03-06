import { ServerRequest } from "https://servestjs.org/@v1.1.6/mod.ts";
import { v4 } from "https://deno.land/std@0.76.0/uuid/mod.ts";
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


    async Response(req : ServerRequest, status : number, body : any)
    {
        await req.respond({
            status,
            body: JSON.stringify(body),
        });
    }

    async List(req : ServerRequest)
    {
        const gameServers = this.GetGameServers();
        await this.Response(req, 200, {
            success: true,
            gameServers,
        });
    }

    async TotalPlayer(req : ServerRequest)
    {
        const totalPlayer = this.GetTotalPlayer();
        await this.Response(req, 200, {
            success: true,
            totalPlayer,
        });
    }

    async Connect(req : ServerRequest)
    {
        const value : IServerData = await req.json();
        if (!value)
        {
            await this.Response(req, 400, {
                success: false,
                error: "No Data",
            });
        }
        else
        {
            // NOTE: Not sure there is a form validation library or not.
            const gameServer : ServerData = new ServerData().SetValue(value);
            gameServer.id = v4.generate();
            this.gameServers[gameServer.id] = gameServer;
            const time = Date.now();
            this.healthTimes[gameServer.id] = time;
            this.Log('Server id ' + gameServer.id + ' connected at ' + time);
            await this.Response(req, 200, {
                success: true,
                gameServer,
            });
        }
    }

    async HealthHandle()
    {
        while (true)
        {   
            try
            {
                let keys = Object.keys(this.gameServers);
                for (let i = 0; i < keys.length; ++i) {
                    let id = keys[i];
                    if (Date.now() - this.healthTimes[id] >= this.periodSeconds)
                    {
                        // Kick unhealthy (timed out) game servers
                        delete this.gameServers[id];
                        delete this.healthTimes[id];
                        this.Log('Server id ' + id + ' timed out.');
                    }
                }
            }
            catch (error)
            {
                this.Log('Error occurring while handling health checking: ' + error);
            }
            // Delay 1 second
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    async Health(req : ServerRequest)
    {
        const value : IServerData = await req.json();
        if (!value)
        {
            await this.Response(req, 400, {
                success: false,
                error: "No Data",
            });
        }
        else
        {
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.healthTimes)
            {
                const time = Date.now();
                this.healthTimes[id] = time;
                this.Log('Server id ' + id + ' health update at ' + time);
                await this.Response(req, 200, {
                    success: true,
                });
            }
            else
            {
                await this.Response(req, 404, {
                    success: false,
                    error: "Cannot find the server",
                });
            }
        }
    }

    async Update(req : ServerRequest)
    {
        const value : IServerData = await req.json();
        if (!value)
        {
            await this.Response(req, 400, {
                success: false,
                error: "No Data",
            });
        }
        else
        {
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.gameServers)
            {
                const gameServer : ServerData = this.gameServers[id].SetValue(value);
                this.gameServers[id] = gameServer;
                await this.Response(req, 200, {
                    success: true,
                    gameServer,
                });
            }
            else
            {
                await this.Response(req, 404, {
                    success: false,
                    error: "Cannot find the server",
                });
            }
        }
    }

    async Shutdown(req : ServerRequest)
    {
        const value : IServerData = await req.json();
        if (!value)
        {
            await this.Response(req, 400, {
                success: false,
                error: "No Data",
            });
        }
        else
        {
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.gameServers)
            {
                delete this.gameServers[id];
                delete this.healthTimes[id];
                this.Log('Server id ' + id + ' shutdown');
                await this.Response(req, 200, {
                    success: true,
                });
            }
            else
            {
                await this.Response(req, 404, {
                    success: false,
                    error: "Cannot find the server",
                });
            }
        }
    }

    private Log(text : string) {
        console.log(text);
    }
}