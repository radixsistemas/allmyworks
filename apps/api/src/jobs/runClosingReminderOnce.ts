import { closingReminderJob } from "./closingReminder.job";

closingReminderJob()
  .then((result) => {
    console.log("[job:closingReminder] concluído:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[job:closingReminder] erro:", err);
    process.exit(1);
  });
