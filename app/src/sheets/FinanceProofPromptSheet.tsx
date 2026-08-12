import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Text } from 'react-native';
import { Sheet, Button } from '../components/ui';
import { useTheme } from '../theme/ThemeContext';
import { useFamilyData } from '../state/FamilyDataContext';

export function FinanceProofPromptSheet({
  visible,
  taskId,
  onClose,
}: {
  visible: boolean;
  taskId: string | null;
  onClose: () => void;
}) {
  const t = useTheme();
  const { uploadReceipt } = useFamilyData();

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { onClose(); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled && taskId) {
      await uploadReceipt(taskId, result.assets[0].uri);
    }
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Ajouter une preuve ?">
      <Text style={{ fontSize: 13, color: t.neutral[700], marginBottom: 18 }}>
        Voulez-vous prendre une photo de la preuve de paiement pour cette tâche ?
      </Text>
      <Button label="Prendre une photo" onPress={takePhoto} block />
      <Button label="Plus tard" variant="ghost" onPress={onClose} style={{ marginTop: 10 }} />
    </Sheet>
  );
}
