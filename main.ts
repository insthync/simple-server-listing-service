import { Application, Router } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { Handler } from "./handler.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

config({ export: true });
const handler = new Handler(Number(Deno.env.get('PERIOD_SECONDS')) * 1000);
const router = new Router();
router
  .get("/", (context) => handler.List(context))
  .get("/totalPlayer", (context) => handler.TotalPlayer(context))
  .post("/connect", async (context) => await handler.Connect(context))
  .post("/health", async (context) => await handler.Health(context))
  .put("/update", async (context) => await handler.Update(context))
  .post("/shutdown", async (context) => await handler.Shutdown(context));

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const port = Number(Deno.env.get('PORT'));
console.log('Server running at port: ' + port);

await Promise.all([
  handler.HealthHandle(),
  app.listen({ port })
]);
