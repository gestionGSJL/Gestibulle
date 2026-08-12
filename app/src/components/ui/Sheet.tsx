import React from 'react';
import { Modal, Pressable, View, ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IconButton } from './IconButton';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightPct?: number;
  scroll?: boolean;
}

export function Sheet({ visible, onClose, title, children, maxHeightPct = 80, scroll = true }: Props) {
  const t = useTheme();
  const header = title ? (
    <View style={styles.header}>
      <Text style={{ fontFamily: t.font.heading, fontSize: 19, color: t.text }}>{title}</Text>
      <IconButton icon={X} onPress={onClose} size={30} iconSize={16} />
    </View>
  ) : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxHeight: `${maxHeightPct}%`,
            backgroundColor: t.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            ...t.shadow.lg,
          }}
        >
          {scroll ? (
            <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 18, paddingBottom: 28 }}>
              {header}
              {children}
            </ScrollView>
          ) : (
            <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 }}>
              {header}
              {children}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(32,30,29,0.4)',
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
});
