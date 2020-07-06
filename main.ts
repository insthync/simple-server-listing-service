import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Handler } from "./handler.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

config({ export: true });
const handler = new Handler(Number(Deno.env.get('PERIOD_SECONDS')) * 1000);
const router = new Router();
router
  .get("/", handler.List)
  .post("/connect", handler.Connect)
  .post("/health", handler.Health)
  .put("/config", handler.Update)
  .post("/shutdown", handler.Shutdown);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const port = Number(Deno.env.get('PORT'));
console.log('Server running at port: ' + port);

await Promise.all([
  handler.HealthHandle(),
  app.listen({ port })
]);
