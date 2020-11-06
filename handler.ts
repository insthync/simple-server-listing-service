import { v4 } from "https://deno.land/std@0.76.0/uuid/mod.ts";
import { Status as status } from 'https://deno.land/std@0.76.0/http/http_status.ts';
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

    List(request : any, h : any)
    {
        const gameServers = this.GetGameServers();
        h.response({
            success : true,
            gameServers
        }).code(status.OK);
    }

    TotalPlayer(request : any, h : any)
    {
        const totalPlayer = this.GetTotalPlayer();
        h.response({
            success : true,
            totalPlayer
        }).code(status.OK);
    }

    async Connect(request : any, h : any)
    {
        const bodyText = new TextDecoder().decode(await Deno.readAll(request.body));
        const body = JSON.parse(bodyText);
        if (!body.value)
        {
            h.response({
              success: false,
              error: "No Data",
            }).code(status.BadRequest);
        }
        else
        {
            const value : IServerData = await body.value;
            // NOTE: Not sure there is a form validation library or not.
            const gameServer : ServerData = new ServerData().SetValue(value);
            gameServer.id = v4.generate();
            this.gameServers[gameServer.id] = gameServer;
            const time = Date.now();
            this.healthTimes[gameServer.id] = time;
            this.Log('Server id ' + gameServer.id + ' connected at ' + time);
            h.response({
              success: true,
              gameServer
            }).code(status.OK);
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

    async Health(request : any, h : any)
    {
        const bodyText = new TextDecoder().decode(await Deno.readAll(request.body));
        const body = JSON.parse(bodyText);
        if (!body.value)
        {
            h.response({
              success: false,
              error: "No Data",
            }).code(status.BadRequest);
        }
        else
        {
            const value : IServerData = await body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.healthTimes)
            {
                const time = Date.now();
                this.healthTimes[id] = time;
                this.Log('Server id ' + id + ' health update at ' + time);
                return h.response({
                  success: true,
                }).code(status.OK);
            }
            else
            {
                h.response({
                  success: false,
                  error: "Cannot find the server",
                }).code(status.NotFound);
            }
        }
    }

    async Update(request : any, h : any)
    {
        const bodyText = new TextDecoder().decode(await Deno.readAll(request.body));
        const body = JSON.parse(bodyText);
        if (!body.value)
        {
            h.response({
              success: false,
              error: "No Data",
            }).code(status.BadRequest);
        }
        else
        {
            const value : IServerData = await body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.gameServers)
            {
                const gameServer : ServerData = this.gameServers[id].SetValue(value);
                this.gameServers[id] = gameServer;
                return h.response({
                  success: true,
                  gameServer
                }).code(status.OK);
            }
            else
            {
                h.response({
                  success: false,
                  error: "Cannot find the server",
                }).code(status.NotFound);
            }
        }
    }

    async Shutdown(request : any, h : any)
    {
        const bodyText = new TextDecoder().decode(await Deno.readAll(request.body));
        const body = JSON.parse(bodyText);
        if (!body.value)
        {
            h.response({
              success: false,
              error: "No Data",
            }).code(status.BadRequest);
        }
        else
        {
            const value : IServerData = await body.value;
            const id : string | undefined = value.id;
            if (id !== undefined && id in this.gameServers)
            {
                delete this.gameServers[id];
                delete this.healthTimes[id];
                this.Log('Server id ' + id + ' shutdown');
                return h.response({
                  success: true,
                }).code(status.OK);
            }
            else
            {
                h.response({
                  success: false,
                  error: "Cannot find the server",
                }).code(status.NotFound);
            }
        }
    }

    private Log(text : string) {
        console.log(text);
    }
}