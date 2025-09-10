// src/app.ts
import knex, { migrate, seed } from "./postgres/knex.js";
import { SpreadsheetService } from "./services/PgService.js";
import { GoogleSheetsService, SheetData } from "./services/googlesheetService.js";
import { WbTariffService } from "./services/WbTariffService.js";
import cron from "node-cron";

const tariffService = new WbTariffService();
const spreadsheetService = new SpreadsheetService(knex);
const googleSheetsService = new GoogleSheetsService();
const SPREADSHEET_ID: string = process.env.SPREADSHEET_ID || "";


// Sync function
async function syncTariffs(): Promise<void> {
  console.log("🔄 Starting tariffs sync...");
  let tariffs: SheetData[] = [];

  try {
    tariffs = await tariffService.fetchTariffs();
    if (!tariffs.length) {
      console.warn("⚠️ No tariffs fetched from API");
      return;
    }
    console.log(`📦 Fetched ${tariffs.length} tariffs`);
  } catch (err) {
    console.error("❌ Failed to fetch tariffs:", err);
    return;
  }

  // Save to DB
  try {
    console.log("💾 Saving tariffs to database...");
    await spreadsheetService.createMany(tariffs);  
    console.log("✅ Tariffs saved to DB");
  } catch (err) {
    console.error("❌ Failed to save tariffs to DB:", err);
  }

  // Save to Google Sheets
  try {
    console.log("📊 Saving tariffs to Google Sheets...");
    await googleSheetsService.saveToGoogleSheet(tariffs, SPREADSHEET_ID);
    console.log("✅ Tariffs saved to Google Sheets");
  } catch (err) {
    console.error("❌ Failed to save tariffs to Google Sheets:", err);
  }
}

// Cron scheduler
function scheduleDailySync(cronExpression = "0 0 * * *") {
  cron.schedule(cronExpression, async () => {
    console.log("⏰ Running daily sync...");
    await syncTariffs();
  });
  console.log(`📅 Daily sync scheduled with cron expression: "${cronExpression}"`);
}

// Main initialization
async function main() {
  try {
    console.log("🔄 Applying database migrations...");
    await migrate.latest();

    console.log("🌱 Running seeds...");
    await seed.run();

    // Run first sync immediately
    await syncTariffs();

    // Schedule daily cron job
    scheduleDailySync();

    console.log("✅ App initialized successfully");
  } catch (err) {
    console.error("❌ Error during initialization:", err);
    process.exit(1);
  }
}

// Start app
await main();
