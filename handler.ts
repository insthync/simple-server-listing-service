import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import { ServerData } from "./server_data.ts";

export class Handler
{
    gameServers : { [id: string] : ServerData; } = {}

    List(context : RouterContext<Record<string | number, string | undefined>, Record<string, any>>)
    {
        
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