const { runIngestion } = require("../services/ingestionService");

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

// WHAT: runs runIngestion() once immediately, then again every 6 hours.
// WHY:  opportunities need to stay fresh without anyone manually running a
//       script - a real product can't depend on a human remembering to do that.
// HOW:  Node's built-in setInterval is enough here. We deliberately do NOT
//       reach for a job queue like Bull/Kafka - those exist to handle
//       thousands of jobs across multiple servers with retries and
//       persistence. We have ONE recurring job on ONE server; setInterval
//       is the simplest thing that actually solves that problem.
// TRADEOFF to be upfront about: if the server restarts, the "every 6 hours"
// timer resets from zero rather than resuming a saved schedule. For a
// single-server student MVP that's an acceptable tradeoff - a production
// system with multiple servers would need a proper scheduler (e.g. a cron
// job hitting POST /api/admin/ingest/run) to avoid running the job twice.
function startIngestionJob() {
  console.log("Ingestion job scheduled: runs now, then every 6 hours.");

  runIngestion().catch((error) => console.error("Initial ingestion run failed:", error.message));

  setInterval(() => {
    runIngestion().catch((error) => console.error("Scheduled ingestion run failed:", error.message));
  }, SIX_HOURS_IN_MS);
}

module.exports = { startIngestionJob };
