import { useState } from 'react';

export const useFoodLogModals = () => {
  const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
  const [isCopyConfirmVisible, setCopyConfirmVisible] = useState(false);
  const [isTemplateLoadConfirmVisible, setTemplateLoadConfirmVisible] = useState(false);
  const [isNutritionTargetsVisible, setNutritionTargetsVisible] = useState(false);

  const openTemplateManager = () => setTemplateManagerVisible(true);
  const closeTemplateManager = () => setTemplateManagerVisible(false);

  const openCopyConfirm = () => setCopyConfirmVisible(true);
  const closeCopyConfirm = () => setCopyConfirmVisible(false);

  const openTemplateLoadConfirm = () => setTemplateLoadConfirmVisible(true);
  const closeTemplateLoadConfirm = () => setTemplateLoadConfirmVisible(false);

  const openNutritionTargets = () => setNutritionTargetsVisible(true);
  const closeNutritionTargets = () => setNutritionTargetsVisible(false);

  return {
    templateManager: {
      isVisible: isTemplateManagerVisible,
      open: openTemplateManager,
      close: closeTemplateManager,
    },
    copyConfirm: {
      isVisible: isCopyConfirmVisible,
      open: openCopyConfirm,
      close: closeCopyConfirm,
    },
    templateLoadConfirm: {
      isVisible: isTemplateLoadConfirmVisible,
      open: openTemplateLoadConfirm,
      close: closeTemplateLoadConfirm,
    },
    nutritionTargets: {
      isVisible: isNutritionTargetsVisible,
      open: openNutritionTargets,
      close: closeNutritionTargets,
    },
  };
};
