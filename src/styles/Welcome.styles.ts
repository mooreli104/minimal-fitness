import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  illustrationWrapper: {
    width: 220,
    height: 220,
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 20,
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  button: {
    marginTop: 40,
    backgroundColor: "black",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});