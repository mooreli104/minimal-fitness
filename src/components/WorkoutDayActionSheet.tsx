import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { styles } from "../styles/WorkoutDayActionSheet.styles";

interface WorkoutDayActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleRestDay: () => void;
  isRestDay?: boolean;
}

const WorkoutDayActionSheet = ({
  visible,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleRestDay,
  isRestDay,
}: WorkoutDayActionSheetProps) => {

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

          {/* Toggle Rest Day */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.65} onPress={onToggleRestDay}>
            <Text style={styles.actionText}>{isRestDay ? 'Convert to Workout Day' : 'Convert to Rest Day'}</Text>
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
