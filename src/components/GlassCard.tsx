import React, {useEffect, useState} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {
  NativeLiquidGlassView,
  isNativeGlassAvailable,
} from '../native/NativeLiquidGlass';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  interactive?: boolean;
  tintColor?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  interactive = false,
  tintColor,
}) => {
  const [glassAvailable, setGlassAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    isNativeGlassAvailable().then(setGlassAvailable);
  }, []);

  // While checking, render fallback
  if (glassAvailable === null || glassAvailable === false) {
    return (
      <View style={[styles.card, styles.fallback, style]}>{children}</View>
    );
  }

  // Native UIGlassEffect is available — use the custom native view
  return (
    <NativeLiquidGlassView
      interactive={interactive}
      effectVariant="regular"
      glassTintColor={tintColor}
      style={[styles.card, style]}>
      {children}
    </NativeLiquidGlassView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    margin: 10,
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default GlassCard;
