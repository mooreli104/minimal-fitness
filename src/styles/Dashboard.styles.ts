import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: { paddingHorizontal: 24, paddingTop: 59, paddingBottom: 120, gap: 24 },
  topSection: {
    paddingTop: 24,
  },
  totalWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  totalCalories: {
    fontSize: 48,
    fontWeight: "700",
  },
  kcalText: {
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },
  entriesWrapper: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e5e5",
    marginLeft: 12,
  },
  entryRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  entryText: {
    fontSize: 16,
  },
  placeholderText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 16,
  },
  yesterdayIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    marginBottom: -16,
  },
  yesterdayText: {
    fontSize: 13,
    color: '#aaa',
    fontStyle: 'italic',
  },
});
