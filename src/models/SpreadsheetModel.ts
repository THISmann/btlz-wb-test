// src/models/SpreadsheetModel.ts

export interface Spreadsheet {
  spreadsheet_id: number;
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
  created_at: Date;
  updated_at: Date;
}