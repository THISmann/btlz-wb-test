import axios, { AxiosInstance, AxiosError } from "axios";

export interface WbTariff {
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

const URL_MOCK = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
const URL_WB = "https://common-api.wildberries.ru/api/v1";

export class WbTariffService {
  private client: AxiosInstance;
  private clientMock: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: URL_WB,
      timeout: 10000,
      headers: {
        Authorization: process.env.WB_API_KEY || "MOCK_KEY",
      },
    });

    this.clientMock = axios.create({
      baseURL: URL_MOCK,
      timeout: 5000,
    });
  }

  /** Utility to convert a string to a number (handles ',' and '.') */
  private parseNumber(value: string | number | undefined): number {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    return parseFloat(value.replace(",", "."));
  }

  /** Transforms a raw object into Wb Tariff */
  private mapToWbTariff(item: any): WbTariff {
    return {
      warehouse_name: item.warehouseName,
      geo_name: item.geoName,
      box_delivery_base: this.parseNumber(item.boxDeliveryBase),
      box_delivery_coef_expr: this.parseNumber(item.boxDeliveryCoefExpr),
      box_delivery_liter: this.parseNumber(item.boxDeliveryLiter),
      box_delivery_marketplace_base: this.parseNumber(item.boxDeliveryMarketplaceBase),
      box_delivery_marketplace_coef_expr: this.parseNumber(item.boxDeliveryMarketplaceCoefExpr),
      box_delivery_marketplace_liter: this.parseNumber(item.boxDeliveryMarketplaceLiter),
      box_storage_base: this.parseNumber(item.boxStorageBase),
      box_storage_coef_expr: this.parseNumber(item.boxStorageCoefExpr),
      box_storage_liter: this.parseNumber(item.boxStorageLiter),
    };
  }

  /** Retry helper */
  private async fetchWithRetry<T>(client: AxiosInstance, url: string, retries = 2, delayMs = 1000): Promise<T> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await client.get(url);
        return response.data;
      } catch (err) {
        attempt++;
        if (attempt > retries) throw err;
        console.warn(`⚠️ Retry attempt ${attempt} for ${url} after error: ${(err as AxiosError).message}`);
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
    throw new Error("Unreachable code in fetchWithRetry");
  }

  /** Fetch tariffs from WB API or fallback to mock */
  async fetchTariffs(): Promise<WbTariff[]> {
    try {
      // 1️⃣ Essayer API WB
      const data = await this.fetchWithRetry<any>(this.client, "/tariffs/box");

      const warehouseList = data?.response?.data?.warehouseList ?? [];
      if (!Array.isArray(warehouseList) || warehouseList.length === 0) {
        console.warn("⚠️ No warehouseList from WB API, fallback to mock.");
        throw new Error("Empty warehouseList");
      }

      console.log("✅ Fetched tariffs from WB API");
      return warehouseList.map(this.mapToWbTariff.bind(this));
    } catch (err) {
      console.warn("⚠️ WB API failed, using mock server...", (err as Error).message);

      // 2️⃣ Fallback on mock
      const dataMock = await this.fetchWithRetry<any>(this.clientMock, "/tariffs/box");
      const warehouseListMock = dataMock?.response?.data?.warehouseList ?? [];
      console.log("📦 Fetched tariffs from mock server:", JSON.stringify(warehouseListMock, null, 2));
      return warehouseListMock.map(this.mapToWbTariff.bind(this));
    }
  }
}
