/**
 * NativeLiquidGlass.ts
 * TypeScript wrapper for the custom Swift native module.
 * Directly calls UIGlassEffect on iOS 26+.
 */
import {
  NativeModules,
  requireNativeComponent,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import React from 'react';

const {LiquidGlassModule} = NativeModules;

// Native View Component
export const NativeLiquidGlassView = requireNativeComponent<{
  interactive?: boolean;
  effectVariant?: string;
  glassTintColor?: string;
  style?: StyleProp<ViewStyle>;
}>('LiquidGlassView');

/**
 * Check if native UIGlassEffect is available at runtime.
 * This directly queries the native module — no third-party library involved.
 */
export async function isNativeGlassAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    const result = await LiquidGlassModule.isGlassAvailable();
    return result === true;
  } catch {
    return false;
  }
}

/**
 * Get detailed glass support info from native side.
 */
export async function getGlassInfo(): Promise<{
  iosVersion: string;
  systemName: string;
  isIOS26: boolean;
  hasUIGlassEffect: boolean;
  hasUIGlassContainerEffect: boolean;
}> {
  if (Platform.OS !== 'ios') {
    return {
      iosVersion: 'N/A',
      systemName: 'Android',
      isIOS26: false,
      hasUIGlassEffect: false,
      hasUIGlassContainerEffect: false,
    };
  }
  try {
    return await LiquidGlassModule.getGlassInfo();
  } catch {
    return {
      iosVersion: 'unknown',
      systemName: 'unknown',
      isIOS26: false,
      hasUIGlassEffect: false,
      hasUIGlassContainerEffect: false,
    };
  }
}
