// src/services/SpreadsheetService.ts

import { Knex } from 'knex';
import { Spreadsheet } from '../models/SpreadsheetModel.js';

/**
 * Data required to create a new spreadsheet.
 */
export type CreateSpreadsheetInput = Omit<Spreadsheet, 'spreadsheet_id' | 'created_at' | 'updated_at'>;

/**
 * Service to manage CRUD operations on WB tariffs (spreadsheets)
 */
export class SpreadsheetService {
  private readonly knex: Knex;

  constructor(knexInstance: Knex) {
    this.knex = knexInstance;
  }

  /**
   * Create a new tariff.
   * @param data - tariff Data .
   * @returns The created entry, with ID and timestamps
   */
  async create(data: CreateSpreadsheetInput): Promise<Spreadsheet> {
    const now = new Date();
    const [created] = await this.knex<Spreadsheet>('spreadsheets')
      .insert({
        ...data,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    if (!created) {
      throw new Error('Failed to create tariff');
    }

    return created;
  }

  /** Create multiple spreadsheet rows in batch */
  async createMany(data: CreateSpreadsheetInput[]): Promise<Spreadsheet[]> {
    if (!data.length) return [];

    const now = new Date();
    const rowsToInsert = data.map((item) => ({
      ...item,
      created_at: now,
      updated_at: now,
    }));

    const createdRows = await this.knex<Spreadsheet>("spreadsheets")
      .insert(rowsToInsert)
      .returning("*"); // PostgreSQL supports returning all inserted rows

    if (!createdRows || createdRows.length === 0) {
      throw new Error("Failed to create rates in batch");
    }

    return createdRows;
  }

  /**
   * Récupère un tarif par son ID.
   * @param spreadsheet_id - ID du tarif.
   * @returns Le tarif trouvé, ou `null` si introuvable.
   */
  // async findById(spreadsheet_id: number): Promise<Spreadsheet | null> {
  //   return this.knex<Spreadsheet>('spreadsheets')
  //     .where({ spreadsheet_id })
  //     .first();
  // }

  /**
   * Delete a fare by its ID.
   * @param spreadsheet_id - ID of the tariff to be deleted.
   * @returns `true` if deleted, `false` otherwise.
   */
  async delete(spreadsheet_id: number): Promise<boolean> {
    const count = await this.knex('spreadsheets')
      .where({ spreadsheet_id })
      .delete();

    return count > 0;
  }

  /**
   * Retrieves all fares.
   * @returns Array of all tariffs.
   */
  async findAll(): Promise<Spreadsheet[]> {
    return this.knex<Spreadsheet>('spreadsheets')
      .select('*')
      .orderBy('spreadsheet_id', 'asc');
  }

  /**
   * (Bonus) Updates an existing spreadsheet.
   * @param spreadsheet_id - ID of the spreadsheet to update.
   * @param data -  data to update.
   * @returns The updated spreadsheet, or `null` if not found.
   */
  async update(
    spreadsheet_id: number,
    data: Partial<CreateSpreadsheetInput>
  ): Promise<Spreadsheet | null> {
    const [updated] = await this.knex<Spreadsheet>('spreadsheets')
      .where({ spreadsheet_id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');

    return updated || null;
  }
}