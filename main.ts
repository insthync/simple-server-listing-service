import { createApp } from "https://deno.land/x/servest@v1.3.4/mod.ts";
import { Handler } from "./handler.ts";
import { config } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";

config({ export: true });
const handler = new Handler(Number(Deno.env.get('PERIOD_SECONDS')) * 1000);

const app = createApp();
app.get("/", async (req) => await handler.List(req));
app.get("/totalPlayer", async (req) => await handler.TotalPlayer(req));
app.post("/connect", async (req) => await handler.Connect(req));
app.post("/health", async (req) => await handler.Health(req));
app.put("/update", async (req) => await handler.Update(req));
app.post("/shutdown", async (req) => await handler.Shutdown(req));

const port = Number(Deno.env.get('PORT'));
handler.HealthHandle();
app.listen({ port });
