import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  sheetWrapper: {
    paddingBottom: 25,
    paddingHorizontal: 20,
  },

  sheet: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
  },

  actionRow: {
    height: 46,               // reduced height
    paddingHorizontal: 20,    // reduced padding
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },

  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginLeft: 20,
  },

  cancelRow: {
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },
});
