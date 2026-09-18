const Opportunity = require("../models/Opportunity");
const { findDuplicate } = require("./duplicateDetectionService");
const { fetchGreenhouseOpportunities } = require("./opportunitySources/greenhouse");

// Each entry is one source: a name (for logging) + a function that returns
// an array of already-normalized opportunity objects (see greenhouse.js).
// TO ADD A NEW SOURCE: write one file in opportunitySources/ that exports
// a fetch function shaped like this, then add one line here. Nothing else
// in the app needs to change - that's the whole point of normalizing at
// the source level instead of inside this pipeline.
const SOURCES = [
  { name: "Greenhouse", fetch: fetchGreenhouseOpportunities },
];

// runIngestion()
//
// WHAT: runs every configured source, normalizes nothing further (the
//       sources already did that), checks each result for duplicates,
//       and either inserts a new Opportunity or updates the existing one.
//
// WHY:  this is the ONE place that knows how to go from "a source gave us
//       some data" to "MongoDB has an up-to-date, non-duplicated record" -
//       sources themselves never touch the database directly.
//
// HOW:  Source -> fetch -> (already normalized) -> duplicate check -> insert or update.
async function runIngestion() {
  const results = { created: 0, updated: 0, errors: [] };

  for (const source of SOURCES) {
    try {
      const opportunities = await source.fetch();

      for (const candidate of opportunities) {
        try {
          const duplicate = await findDuplicate(candidate);

          if (duplicate) {
            // Update the existing record in case details (deadline, title, etc.)
            // changed since we last fetched it, but keep its _id and any
            // saves/applications that reference it intact.
            await Opportunity.updateOne(
              { _id: duplicate._id },
              { ...candidate, lastUpdated: new Date() }
            );
            results.updated += 1;
          } else {
            await Opportunity.create(candidate);
            results.created += 1;
          }
        } catch (itemError) {
          // One bad item (e.g. missing a required field) should not stop
          // the rest of the source's results from being processed.
          results.errors.push(`${source.name}: ${itemError.message}`);
        }
      }
    } catch (sourceError) {
      // One source failing entirely (network down, API changed) must never
      // crash the whole ingestion run or take down the server.
      results.errors.push(`${source.name} failed entirely: ${sourceError.message}`);
    }
  }

  console.log("Ingestion run finished:", results);
  return results;
}

module.exports = { runIngestion };
