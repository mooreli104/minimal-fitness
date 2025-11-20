/**
 * Food Database Types
 * Types for FDC (FoodData Central) food database
 */

export interface FoodSearchResult {
  fdc_id: number;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  brand_name: string | null;
  food_category: string | null;
  serving_size: number | null;
  serving_unit: string | null;
}
