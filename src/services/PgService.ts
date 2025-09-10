// src/services/pgService.ts
import { google, sheets_v4 } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SheetData {
  warehouse_name: string;
  geo_name: string;
  box_delivery_base: number;
  box_delivery_coef_expr: number;
  box_delivery_liter: number;
  box_delivery_marketplace_base: number;
  box_delivery_marketplace_coef_expr: number;
  box_delivery_marketplace_liter: number;
  box_storage_base: number;
  box_storage_coef_expr: number;
  box_storage_liter: number;
}

export class GoogleSheetsService {
  private auth!: any;
  private sheets!: sheets_v4.Sheets;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    try {
      const credentialsPath = path.join(__dirname, "../config/api-key.json");

      if (!fs.existsSync(credentialsPath)) {
        throw new Error("❌  api-key.json file not found");
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      this.sheets = google.sheets({ version: "v4", auth: this.auth });
    } catch (error: any) {
      console.error("❌ Initialization error:", error.message);
      process.exit(1);
    }
  }

async saveToGoogleSheet(
  data: SheetData[],
  spreadsheetId: string
): Promise<sheets_v4.Schema$AppendValuesResponse | undefined> {
  try {
    // Prepare the values
    const values = data.map((item) => [
      item.warehouse_name || "",
      item.geo_name || "",
      item.box_delivery_base || "",
      item.box_delivery_coef_expr || "",
      item.box_delivery_liter || "",
      item.box_delivery_marketplace_base || "",
      item.box_delivery_marketplace_coef_expr || "",
      item.box_delivery_marketplace_liter || "",
      item.box_storage_base || "",
      item.box_storage_coef_expr || "",
      item.box_storage_liter || "",
    ]);

    // 1️⃣ Get the first sheet's name dynamically
    const spreadsheetMeta = await this.sheets.spreadsheets.get({ spreadsheetId });
    const firstSheetTitle = spreadsheetMeta.data.sheets?.[0]?.properties?.title;

    if (!firstSheetTitle) {
      throw new Error("❌ Unable to find a sheet in this spreadsheet");
    }

    // 2️⃣ Define the range automatically
    const range = `${firstSheetTitle}!A:K`; // A → K = 11 columns

    console.log(`🔄 Writing data to sheet: ${firstSheetTitle} (range: ${range})`);

    // 3️⃣ Append values
    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });

    console.log("✅ Data register!");
    console.log("📊 Updated cells:", response.data.updates?.updatedCells);
    console.log("📈 Updated Range:", response.data.updates?.updatedRange);

    return response.data;
  } catch (error: any) {
    console.error("❌ Error while saving:", error.message);

    if (error.code === 404) {
      console.error("📋 Permission issue - Check service account permissions");
    } else if (error.code === 403) {
      console.error("🔐 e");
    }

    throw error;
  }
}

}
