import pogo from 'https://deno.land/x/pogo@v0.5.1/main.ts';
import { Handler } from "./handler.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

config({ export: true });
const handler = new Handler(Number(Deno.env.get('PERIOD_SECONDS')) * 1000);

const port = Number(Deno.env.get('PORT'));
const server = pogo.server({ port });
server.router.get("/", async(request, h) => await handler.List(request, h));
server.router.get("/totalPlayer", async(request, h) => await handler.TotalPlayer(request, h));
server.router.post("/connect", async(request, h) => await handler.Connect(request, h));
server.router.post("/health", async(request, h) => await handler.Health(request, h));
server.router.put("/update", async(request, h) => await handler.Update(request, h));
server.router.post("/shutdown", async(request, h) => await handler.Shutdown(request, h));
handler.HealthHandle();
server.start();
console.log('Server running at port: ' + port);
