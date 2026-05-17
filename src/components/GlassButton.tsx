import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import {
  NativeLiquidGlassView,
  isNativeGlassAvailable,
} from '../native/NativeLiquidGlass';

interface GlassButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  tintColor?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  title,
  style,
  tintColor = '#007AFF',
}) => {
  const [glassAvailable, setGlassAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    isNativeGlassAvailable().then(setGlassAvailable);
  }, []);

  if (glassAvailable) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <NativeLiquidGlassView
          interactive={true}
          effectVariant="regular"
          glassTintColor={tintColor}
          style={[styles.button, style]}>
          <Text style={[styles.buttonText, {color: tintColor}]}>{title}</Text>
        </NativeLiquidGlassView>
      </TouchableOpacity>
    );
  }

  // Fallback
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.button, styles.fallback, style]}>
      <Text style={[styles.buttonText, {color: tintColor}]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GlassButton;
