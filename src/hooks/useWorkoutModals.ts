import { useState } from 'react';

export const useWorkoutModals = () => {
  const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [isProgramEditorVisible, setProgramEditorVisible] = useState(false);

  return {
    templateManager: {
      isVisible: isTemplateManagerVisible,
      open: () => setTemplateManagerVisible(true),
      close: () => setTemplateManagerVisible(false),
    },
    renameModal: {
      isVisible: isRenameModalVisible,
      open: () => setRenameModalVisible(true),
      close: () => setRenameModalVisible(false),
    },
    programEditor: {
      isVisible: isProgramEditorVisible,
      open: () => setProgramEditorVisible(true),
      close: () => setProgramEditorVisible(false),
    },
  };
};
