import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

interface WorkoutDayActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const WorkoutDayActionSheet = ({
  visible,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: WorkoutDayActionSheetProps) => {
  const [render, setRender] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setRender(true);
    } else {
      setTimeout(() => setRender(false), 200); // match exit animation
    }
  }, [visible]);

  if (!render) return null;


  return (
    <Modal
  isVisible={visible}
  onBackdropPress={onClose}
  backdropOpacity={0.35}
  animationIn="slideInUp"
  animationOut="fadeOutDown" // important!
  animationOutTiming={180}
  useNativeDriver
  useNativeDriverForBackdrop
  style={styles.modal}
  propagateSwipe={false}
>

      <View style={styles.sheetWrapper}>
        <View style={styles.sheet}>
          
          {/* Edit */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.65} onPress={onEdit}>
            <Text style={styles.actionText}>Edit Day</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Duplicate */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.65} onPress={onDuplicate}>
            <Text style={styles.actionText}>Duplicate Day</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Delete */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.65} onPress={onDelete}>
            <Text style={styles.deleteText}>Delete Day</Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelRow} activeOpacity={0.65} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default React.memo(WorkoutDayActionSheet);

const styles = StyleSheet.create({
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
