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

  /**
   * Initialize the database connection
   */
  async init(): Promise<void> {
    try {
      console.log('🔄 Initializing foods database...');

      if (Platform.OS === 'web') {
        // Web platform: Database not supported
        console.warn('⚠️  Food database is not available on web. Please test on iOS/Android.');
        console.warn('💡 Run: npx expo run:ios or npx expo run:android');
        return;
      }

      // Native platform: Use expo-sqlite
      const SQLite = require('expo-sqlite');

      // Get the database asset
      const dbAsset = Asset.fromModule(require('../data/foods.db'));

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
        await FileSystem.copyAsync({
          from: dbAsset.localUri || dbAsset.uri,
          to: dbPath
        });
        console.log('✅ Database copied successfully');
      }

      // Open the database
      this.db = await SQLite.openDatabaseAsync(dbName);

      console.log('✅ Foods database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize foods database:', error);
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
    if (!this.db) {
      await this.init();
    }

    // Web platform: Return empty results with helpful message
    if (Platform.OS === 'web') {
      console.warn('🌐 Food search is not available on web. Please test on a mobile device or simulator.');
      return [];
    }

    try {
      const searchTerm = `%${query}%`;

      // Join foods, nutrients, and servings tables
      const results = await this.db!.getAllAsync(
        `SELECT
          f.fdc_id,
          f.description,
          n.calories,
          n.protein_g,
          n.carbs_g,
          n.fat_g,
          NULL as brand_name,
          f.category as food_category,
          s.serving_g as serving_size,
          s.serving_description as serving_unit
         FROM foods f
         LEFT JOIN nutrients n ON f.fdc_id = n.fdc_id
         LEFT JOIN servings s ON f.fdc_id = s.fdc_id
         WHERE f.description LIKE ?
         ORDER BY
           CASE
             WHEN f.description LIKE ? THEN 1
             WHEN f.description LIKE ? THEN 2
             ELSE 3
           END,
           f.description
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
    if (!this.db) {
      await this.init();
    }

    // Web platform: Return null
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const result = await this.db!.getFirstAsync(
        `SELECT
          f.fdc_id,
          f.description,
          n.calories,
          n.protein_g,
          n.carbs_g,
          n.fat_g,
          NULL as brand_name,
          f.category as food_category,
          s.serving_g as serving_size,
          s.serving_description as serving_unit
         FROM foods f
         LEFT JOIN nutrients n ON f.fdc_id = n.fdc_id
         LEFT JOIN servings s ON f.fdc_id = s.fdc_id
         WHERE f.fdc_id = ?`,
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
