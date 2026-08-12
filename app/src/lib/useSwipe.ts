import { useRef } from 'react';
import { PanResponder } from 'react-native';

// Mirrors the prototype's touchstart/touchend threshold-swipe (50px) used to
// navigate days/weeks/months without arrow buttons.
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 50) {
  const startX = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: (evt) => { startX.current = evt.nativeEvent.pageX; },
      onPanResponderRelease: (evt, gesture) => {
        if (Math.abs(gesture.dx) > threshold) {
          if (gesture.dx < 0) onSwipeLeft();
          else onSwipeRight();
        }
      },
    })
  ).current;
  return panResponder.panHandlers;
}
