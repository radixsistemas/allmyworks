import { app } from "./app";
import { env } from "./config/env";
import { startScheduledJobs } from "./jobs/scheduler";

app.listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`);
  startScheduledJobs();
});
