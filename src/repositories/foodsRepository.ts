/**
 * Foods Repository
 * Handles querying the FDC (FoodData Central) SQLite database
 * Platform-aware: Uses expo-sqlite on native platforms only
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
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
      console.log('🔄 Initializing foods database...');

      if (Platform.OS === 'web') {
        // Web platform: Database not supported
        console.warn('⚠️  Food database is not available on web. Please test on iOS/Android.');
        console.warn('💡 Run: npx expo run:ios or npx expo run:android');
        this.isInitialized = true;
        return;
      }

      // Native platform: Use expo-sqlite
      const SQLite = require('expo-sqlite');

      // Try to get the database asset
      let dbAsset;
      try {
        dbAsset = Asset.fromModule(require('../data/foods.db'));
      } catch (error) {
        console.warn('⚠️  Food database file not found. Food search will not be available.');
        console.warn('💡 To enable food search, add the foods.db file to src/data/');
        this.isInitialized = true;
        return;
      }

      // Download/cache the asset if needed
      if (!dbAsset.downloaded) {
        console.log('📥 Downloading database asset...');
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

      // Check if we need to copy the database
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (!fileInfo.exists) {
        console.log('📋 Copying database to app directory...');
        console.log(`Source: ${dbAsset.localUri || dbAsset.uri}`);
        console.log(`Destination: ${dbPath}`);
        await FileSystem.copyAsync({
          from: dbAsset.localUri || dbAsset.uri,
          to: dbPath
        });
        console.log('✅ Database copied successfully');

        // Verify the copied file exists and has content
        const copiedInfo = await FileSystem.getInfoAsync(dbPath);
        if (copiedInfo.exists && !copiedInfo.isDirectory) {
          console.log(`Copied file size: ${(copiedInfo as any).size} bytes`);
        }
      } else {
        console.log('Database file already exists, skipping copy');
        if (!fileInfo.isDirectory) {
          console.log(`Existing file size: ${(fileInfo as any).size} bytes`);
        }
      }

      // Open the database using the full path
      console.log(`Opening database at: ${dbPath}`);
      this.db = await SQLite.openDatabaseAsync(dbName);

      // Verify database is working by checking for tables
      try {
        console.log('🔍 Checking for foods_master table...');
        const tables = await this.db.getAllAsync(
          "SELECT name FROM sqlite_master WHERE type='table'"
        );
        console.log('All tables found:', tables.map((t: any) => t.name).join(', '));

        const hasFoodsMaster = tables.some((t: any) => t.name === 'foods_master');
        if (!hasFoodsMaster) {
          console.error('❌ foods_master table not found. Database might be empty or corrupted.');
          console.log('Attempting to delete and recopy database...');

          // Close current connection
          await this.db.closeAsync();

          // Delete the corrupted database
          await FileSystem.deleteAsync(dbPath, { idempotent: true });

          // Copy fresh database
          await FileSystem.copyAsync({
            from: dbAsset.localUri || dbAsset.uri,
            to: dbPath
          });
          console.log('✅ Database recopied');

          // Reopen database
          this.db = await SQLite.openDatabaseAsync(dbName);

          // Verify again
          const retryTables = await this.db.getAllAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='foods_master'"
          );
          if (retryTables.length === 0) {
            throw new Error('foods_master table still not found after recopy');
          }
        }
        console.log('✅ Database verified - foods_master table exists');
      } catch (verifyError) {
        console.error('❌ Database verification failed:', verifyError);
        throw new Error('Database is corrupted or missing required tables');
      }

      this.isInitialized = true;
      console.log('✅ Foods database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize foods database:', error);
      this.isInitialized = false;
      this.db = null;
      throw error;
    }
  }

  /**
   * Search for foods in the database
   * @param query - Search term
   * @param limit - Maximum number of results to return
   * @param offset - Number of results to skip (for pagination)
   * @returns Array of matching foods
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

    // Web platform: Return empty results with helpful message
    if (Platform.OS === 'web') {
      console.warn('🌐 Food search is not available on web. Please test on a mobile device or simulator.');
      return [];
    }

    // Double-check database is available
    if (!this.db) {
      console.error('Database not available after initialization');
      return [];
    }

    try {
      const searchTerm = `%${query}%`;

      // Query the foods_master table (all data in single table)
      const results = await this.db.getAllAsync(
        `SELECT
          fdc_id,
          clean_name as description,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          NULL as brand_name,
          category as food_category,
          100.0 as serving_size,
          'g' as serving_unit
         FROM foods_master
         WHERE clean_name LIKE ?
         ORDER BY
           CASE
             WHEN clean_name LIKE ? THEN 1
             WHEN clean_name LIKE ? THEN 2
             ELSE 3
           END,
           clean_name
         LIMIT ? OFFSET ?`,
        [searchTerm, `${query}%`, `% ${query}%`, limit, offset]
      ) as FoodSearchResult[];

      return results;
    } catch (error) {
      console.error('Food search error:', error);
      throw new Error('Failed to search foods');
    }
  }

  /**
   * Get food by FDC ID
   * @param fdcId - The FDC ID of the food
   */
  async getFoodById(fdcId: number): Promise<FoodSearchResult | null> {
    // Ensure database is initialized
    if (!this.isInitialized || !this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error('Failed to initialize database for getFoodById:', error);
        return null;
      }
    }

    // Web platform: Return null
    if (Platform.OS === 'web') {
      return null;
    }

    // Double-check database is available
    if (!this.db) {
      console.error('Database not available after initialization');
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
      console.error('Get food by ID error:', error);
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
