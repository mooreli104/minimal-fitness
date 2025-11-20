/**
 * Food Search Screen
 * Modern, minimalist food search interface inspired by MyFitnessPal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Search, X, Plus, Check } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useFoodSearch } from '../hooks/useFoodSearch';
import type { FoodSearchResult } from '../types/food';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  FoodLog: undefined;
  FoodSearch: {
    mealType: string;
    onSelectFood: (food: FoodSearchResult) => void;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'FoodSearch'>;

type TabType = 'all' | 'my-meals' | 'my-recipes' | 'my-foods';

export const FoodSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);
  const { onSelectFood } = route.params;

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const {
    results,
    isLoading,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadMore,
  } = useFoodSearch();

  const handleSelectFood = (food: FoodSearchResult) => {
    onSelectFood(food);
    navigation.goBack();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const renderFoodItem = ({ item, index }: { item: FoodSearchResult; index: number }) => {
    const isBestMatch = index < 3 && searchQuery.length > 0;

    return (
      <TouchableOpacity
        style={styles.foodItem}
        onPress={() => handleSelectFood(item)}
        activeOpacity={0.7}
      >
        <View style={styles.foodItemContent}>
          <View style={styles.foodItemText}>
            <Text style={styles.foodName} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.foodMeta} numberOfLines={1}>
              {item.calories || 0} cal
              {item.brand_name ? ` • ${item.brand_name}` : ''}
              {item.food_category ? ` • ${item.food_category}` : ''}
            </Text>
          </View>

          {isBestMatch && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.accent }]}>
              <Check size={12} color={colors.background} strokeWidth={3} />
            </View>
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => handleSelectFood(item)}
          >
            <Plus size={18} color={colors.background} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;

    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <Search size={48} color={colors.textSecondary} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Search for foods</Text>
          <Text style={styles.emptyDescription}>
            Search our database of 1.9M+ foods
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Search failed</Text>
          <Text style={styles.emptyDescription}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyDescription}>
          Try a different search term
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || results.length === 0) return null;

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadMore}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Text style={styles.loadMoreText}>Show more results...</Text>
        )}
      </TouchableOpacity>
    );
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'my-meals', label: 'My Meals' },
    { key: 'my-recipes', label: 'My Recipes' },
    { key: 'my-foods', label: 'My Foods' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
              {
                borderBottomColor: activeTab === tab.key ? colors.accent : 'transparent',
              }
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
                {
                  color: activeTab === tab.key ? colors.textPrimary : colors.textSecondary,
                }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderFoodItem}
        keyExtractor={(item) => String(item.fdc_id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState()}
        ListHeaderComponent={
          results.length > 0 && searchQuery.length > 0
            ? renderSectionHeader(results.length <= 3 ? 'Best Match' : 'Results')
            : null
        }
        ListFooterComponent={renderFooter()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: any, theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
      paddingVertical: 0,
    },
    clearButton: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    tab: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      // Border color set inline
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
    },
    tabTextActive: {
      fontWeight: '600',
    },
    listContent: {
      paddingBottom: 24,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    foodItem: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      ...(theme === 'light' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      } : {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      }),
    },
    foodItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    foodItemText: {
      flex: 1,
    },
    foodName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
      lineHeight: 20,
    },
    foodMeta: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    verifiedBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingVertical: 80,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    loadMoreButton: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    loadMoreText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
    },
  });
