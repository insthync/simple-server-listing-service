import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Handler } from "./handler.ts";

const handler = new Handler();
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

console.log('Server running at port: ' + 8000);

await Promise.all([
  handler.HealthHandle(),
  app.listen({ port: 8000 })
]);
