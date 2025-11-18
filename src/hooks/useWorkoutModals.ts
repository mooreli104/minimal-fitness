import { useState } from 'react';

export const useWorkoutModals = () => {
  const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [isChangeDayModalVisible, setChangeDayModalVisible] = useState(false);
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [isTimerVisible, setTimerVisible] = useState(false);

  const openTemplateManager = () => setTemplateManagerVisible(true);
  const closeTemplateManager = () => setTemplateManagerVisible(false);

  const openActionSheet = () => setIsActionSheetVisible(true);
  const closeActionSheet = () => setIsActionSheetVisible(false);

  const openChangeDayModal = () => setChangeDayModalVisible(true);
  const closeChangeDayModal = () => setChangeDayModalVisible(false);

  const openRenameModal = () => setRenameModalVisible(true);
  const closeRenameModal = () => setRenameModalVisible(false);

  const openTimer = () => setTimerVisible(true);
  const closeTimer = () => setTimerVisible(false);

  return {
    templateManager: {
      isVisible: isTemplateManagerVisible,
      open: openTemplateManager,
      close: closeTemplateManager,
    },
    actionSheet: {
      isVisible: isActionSheetVisible,
      open: openActionSheet,
      close: closeActionSheet,
    },
    changeDayModal: {
      isVisible: isChangeDayModalVisible,
      open: openChangeDayModal,
      close: closeChangeDayModal,
    },
    renameModal: {
      isVisible: isRenameModalVisible,
      open: openRenameModal,
      close: closeRenameModal,
    },
    timer: {
      isVisible: isTimerVisible,
      open: openTimer,
      close: closeTimer,
    },
  };
};
