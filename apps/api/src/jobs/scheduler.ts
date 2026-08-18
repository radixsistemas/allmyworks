import cron from "node-cron";
import { env } from "../config/env";
import { closingReminderJob } from "./closingReminder.job";

export function startScheduledJobs(): void {
  cron.schedule(env.CLOSING_REMINDER_CRON, () => {
    closingReminderJob().catch((err) => console.error("[job:closingReminder] erro:", err));
  });

  console.log(`[jobs] agendados: closingReminder="${env.CLOSING_REMINDER_CRON}"`);
}
