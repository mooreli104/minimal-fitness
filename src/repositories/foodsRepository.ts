/**
 * Foods Repository
 * Handles querying the FDC (FoodData Central) SQLite database
 * Platform-aware: Uses expo-sqlite on native platforms only
 * Features fuzzy search using Fuse.js for better matching
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import Fuse from 'fuse.js';
import type { FoodSearchResult } from '../types/food';

class FoodsRepository {
  private db: any = null;
  private initPromise: Promise<void> | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize the database connection
   */
  async init(): Promise<void> {
    // Return existing initialization promise if already in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized && this.db) {
      return Promise.resolve();
    }

    this.initPromise = this._initInternal();
    await this.initPromise;
    this.initPromise = null;
  }

  private async _initInternal(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        this.isInitialized = true;
        return;
      }

      const SQLite = require('expo-sqlite');

      let dbAsset;
      try {
        dbAsset = Asset.fromModule(require('../data/foods.db'));
      } catch (error) {
        this.isInitialized = true;
        return;
      }

      if (!dbAsset.downloaded) {
        await dbAsset.downloadAsync();
      }

      const dbName = 'foods.db';
      const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

      // Ensure SQLite directory exists
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}SQLite`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, {
          intermediates: true
        });
      }

      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (!fileInfo.exists) {
        await FileSystem.copyAsync({
          from: dbAsset.localUri || dbAsset.uri,
          to: dbPath
        });
      }

      this.db = await SQLite.openDatabaseAsync(dbName);

      const tables = await this.db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='foods_master'"
      );

      if (tables.length === 0) {
        await this.db.closeAsync();
        await FileSystem.deleteAsync(dbPath, { idempotent: true });
        await FileSystem.copyAsync({
          from: dbAsset.localUri || dbAsset.uri,
          to: dbPath
        });
        this.db = await SQLite.openDatabaseAsync(dbName);

        const retryTables = await this.db.getAllAsync(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='foods_master'"
        );
        if (retryTables.length === 0) {
          throw new Error('Database is corrupted or missing required tables');
        }
      }

      this.isInitialized = true;
    } catch (error) {
      this.isInitialized = false;
      this.db = null;
      throw error;
    }
  }

  /**
   * Search for foods in the database using fuzzy matching
   * @param query - Search term (supports partial matches, typos, and approximate variations)
   * @param limit - Maximum number of results to return
   * @param offset - Number of results to skip (for pagination)
   * @returns Array of matching foods ranked by relevance
   */
  async searchFoods(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FoodSearchResult[]> {
    // Ensure database is initialized
    if (!this.isInitialized || !this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error('Failed to initialize database for search:', error);
        return [];
      }
    }

    if (Platform.OS === 'web' || !this.db) {
      return [];
    }

    try {
      const firstChars = query.trim().toLowerCase().substring(0, 2);
      const broadSearchTerm = `${firstChars}%`;
      const candidateLimit = Math.min(limit * 10, 200);

      const candidates = await this.db.getAllAsync(
        `SELECT
          fdc_id,
          description,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          NULL as brand_name,
          category as food_category,
          100.0 as serving_size,
          'g' as serving_unit
         FROM foods_master
         WHERE LOWER(description) LIKE ?
         ORDER BY description ASC
         LIMIT ?`,
        [broadSearchTerm, candidateLimit]
      ) as FoodSearchResult[];

      if (candidates.length === 0) {
        const fallbackCandidates = await this.db.getAllAsync(
          `SELECT
            fdc_id,
            description,
            calories,
            protein_g,
            carbs_g,
            fat_g,
            NULL as brand_name,
            category as food_category,
            100.0 as serving_size,
            'g' as serving_unit
           FROM foods_master
           LIMIT 500`
        ) as FoodSearchResult[];

        if (fallbackCandidates.length === 0) {
          return [];
        }

        return this.fuzzyMatch(fallbackCandidates, query, limit, offset);
      }

      // Apply fuzzy matching on candidates
      return this.fuzzyMatch(candidates, query, limit, offset);
    } catch (error) {
      throw new Error('Failed to search foods');
    }
  }

  /**
   * Apply fuzzy matching to filter and rank results
   */
  private fuzzyMatch(
    candidates: FoodSearchResult[],
    query: string,
    limit: number,
    offset: number
  ): FoodSearchResult[] {
    const fuse = new Fuse(candidates, {
      keys: ['description'],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
      shouldSort: true,
      includeScore: true,
      ignoreLocation: true,
      isCaseSensitive: false,
      useExtendedSearch: false,
      findAllMatches: false,
    });

    const fuzzyResults = fuse.search(query);

    return fuzzyResults
      .map(result => result.item)
      .slice(offset, offset + limit);
  }

  /**
   * Get food by FDC ID
   * @param fdcId - The FDC ID of the food
   */
  async getFoodById(fdcId: number): Promise<FoodSearchResult | null> {
    if (!this.isInitialized || !this.db) {
      try {
        await this.init();
      } catch (error) {
        return null;
      }
    }

    if (Platform.OS === 'web' || !this.db) {
      return null;
    }

    try {
      const result = await this.db.getFirstAsync(
        `SELECT
          fdc_id,
          description,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          NULL as brand_name,
          category as food_category,
          100.0 as serving_size,
          'g' as serving_unit
         FROM foods_master
         WHERE fdc_id = ?`,
        [fdcId]
      ) as FoodSearchResult | null;

      return result || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db && Platform.OS !== 'web') {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Export a singleton instance
export const foodsRepository = new FoodsRepository();
