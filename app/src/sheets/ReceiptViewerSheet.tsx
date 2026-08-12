import React, { useEffect, useState } from 'react';
import { Modal, Pressable, View, Image, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useFamilyData } from '../state/FamilyDataContext';

export function ReceiptViewerSheet({
  visible,
  imagePath,
  onClose,
}: {
  visible: boolean;
  imagePath: string | null;
  onClose: () => void;
}) {
  const { getReceiptSignedUrl } = useFamilyData();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible && imagePath) {
      setUrl(null);
      getReceiptSignedUrl(imagePath).then(setUrl);
    }
  }, [visible, imagePath]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
          <Pressable
            onPress={onClose}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} color="#fff" />
          </Pressable>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center', justifyContent: 'center' }}>
          {url ? (
            <Image source={{ uri: url }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="contain" />
          ) : (
            <ActivityIndicator color="#fff" />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}
