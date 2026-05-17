# iOS 26 Liquid Glass Implementation

> **Native UIGlassEffect in React Native** — A bare React Native 0.80.0 app with custom Swift native modules achieving real iOS 26 Liquid Glass effects.

---

## Overview

This project demonstrates a successful implementation of Apple's native **UIGlassEffect** (iOS 26) within a React Native application. Unlike third-party approximations using blur effects, this implementation directly calls Apple's new `UIGlassEffect` API through custom native modules.

### Achievement Summary

| Feature | Status |
|---------|--------|
| Native `UIGlassEffect` rendering | ✅ Working |
| Runtime availability detection | ✅ Working |
| Interactive glass mode | ✅ Working |
| Tint color customization | ✅ Working |
| Fallback for iOS < 26 | ✅ Working |
| **Child content alignment** | ⚠️ Known Issue |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React Native App                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    App.tsx                                   │   │
│  │        (NavigationContainer + BottomTabNavigator)           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  GlassCard.tsx                               │   │
│  │      (React component using NativeLiquidGlassView)          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              NativeLiquidGlass.ts                            │   │
│  │   requireNativeComponent('LiquidGlassView')                  │   │
│  │   NativeModules.LiquidGlassModule                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
          ─────────────────────┼───────────────────────
                    React Native Bridge
          ─────────────────────┼───────────────────────
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           LiquidGlassViewManager.m (Obj-C Bridge)            │   │
│  │   RCT_EXTERN_MODULE(LiquidGlassViewManager, RCTViewManager) │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           LiquidGlassViewManager.swift                       │   │
│  │                                                              │   │
│  │   @available(iOS 26.0, *)                                   │   │
│  │   class LiquidGlassNativeView: RCTView {                    │   │
│  │       private var effectView: UIVisualEffectView?           │   │
│  │                                                              │   │
│  │       func rebuildEffect() {                                │   │
│  │           let glassEffect = UIGlassEffect()  ◄── NATIVE!    │   │
│  │           effectView = UIVisualEffectView(effect: glassEffect)│  │
│  │       }                                                      │   │
│  │   }                                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     UIKit (iOS 26)                           │   │
│  │              UIGlassEffect / UIVisualEffectView              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                        Native iOS Layer                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### 1. Create Bare React Native 0.80.0 Project

```bash
npx @react-native-community/cli init TestApp --version 0.80.0
cd TestApp
```

**Important:** We used a **bare** React Native project, NOT Expo. Expo's managed workflow does not allow custom native modules with new iOS 26 APIs.

### 2. Create Swift Native View Manager

**File:** [`ios-native/LiquidGlassViewManager.swift`](ios-native/LiquidGlassViewManager.swift)

This is the core of the implementation. It creates a custom `RCTView` subclass that wraps `UIGlassEffect`.

### 3. Create Objective-C Bridge Files

**File:** [`ios-native/LiquidGlassViewManager.m`](ios-native/LiquidGlassViewManager.m)

React Native's architecture requires Objective-C macros to expose Swift classes to the JavaScript bridge.

### 4. Create Bridging Header

**File:** [`ios-native/TestApp-Bridging-Header.h`](ios-native/TestApp-Bridging-Header.h)

Required for Swift to access React Native's Objective-C headers.

### 5. Create TypeScript Wrapper

**File:** [`src/native/NativeLiquidGlass.ts`](src/native/NativeLiquidGlass.ts)

Type-safe wrapper for the native module with availability checking.

### 6. Create React Components

**File:** [`src/components/GlassCard.tsx`](src/components/GlassCard.tsx)

React component that uses the native view with automatic fallback.

---

## Native Module Code Explanation

### LiquidGlassNativeView Class

```swift
@available(iOS 26.0, *)
class LiquidGlassNativeView: RCTView {
    private var effectView: UIVisualEffectView?
```

- **`@available(iOS 26.0, *)`**: Ensures the class only compiles for iOS 26+
- **`RCTView`**: React Native's base view class that handles layout and props
- **`effectView`**: The `UIVisualEffectView` that renders the glass effect

### UIGlassEffect Usage

```swift
private func rebuildEffect() {
    let glassEffect = UIGlassEffect()
    glassEffect.isInteractive = interactive
    
    let newEffectView = UIVisualEffectView(effect: glassEffect)
    newEffectView.frame = self.bounds
    newEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    
    self.insertSubview(newEffectView, at: 0)
    self.effectView = newEffectView
}
```

- **`UIGlassEffect()`**: Apple's new iOS 26 glass effect class
- **`isInteractive`**: Enables the glass to respond to touch/hover
- **`UIVisualEffectView`**: Standard UIKit class that applies visual effects

### insertReactSubview Override Pattern

```swift
override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let effectView = effectView {
        effectView.contentView.insertSubview(subview, at: atIndex)
    } else {
        super.insertReactSubview(subview, at: atIndex)
    }
}
```

**Why this is necessary:**
- React Native adds children directly to the view via `insertReactSubview`
- For glass effects to show through, children must be in `effectView.contentView`
- Without this override, children would be siblings of the effect, not inside it

---

## Build Process

### Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| Xcode | 26.4+ | iOS 26 SDK with UIGlassEffect |
| iOS Deployment Target | 26.0 | Required for UIGlassEffect API |
| Ruby | 2.7+ | Xcodeproj manipulation |
| CocoaPods | 1.15+ | Dependency management |

### Step-by-Step Build

#### 1. Add Native Files to Xcode Project

The Ruby script [`add_native_module.rb`](add_native_module.rb) automates adding Swift/Obj-C files:

```ruby
# encoding: utf-8
require 'xcodeproj'

project = Xcodeproj::Project.open('TestApp.xcodeproj')
target = project.targets.first

# Create NativeModules group
native_group = main_group.new_group('NativeModules', 'TestApp/NativeModules')

# Add files to build phase
files_to_add = [
  'LiquidGlassViewManager.swift',
  'LiquidGlassViewManager.m',
  'LiquidGlassModule.swift',
  'LiquidGlassModule.m',
  'TestApp-Bridging-Header.h',
]

# Configure bridging header
config.build_settings['SWIFT_OBJC_BRIDGING_HEADER'] = 'TestApp/NativeModules/TestApp-Bridging-Header.h'
```

#### 2. Pod Install with UTF-8 Fix

```bash
cd ios
LANG=en_US.UTF-8 pod install
```

**Note:** The `LANG=en_US.UTF-8` fixes encoding issues with some pod specs.

#### 3. Build IPA

```bash
xcodebuild -workspace TestApp.xcworkspace \
  -scheme TestApp \
  -configuration Release \
  -sdk iphoneos \
  -archivePath build/TestApp.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/TestApp.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ExportOptions.plist
```

---

## ⚠️ Known Issues

### Text Out of Alignment / Overflow Issue

**Status:** UNRESOLVED

**Description:** Children inside `NativeLiquidGlassView` are not properly contained within the glass bounds. The text content overflows the card edges and appears misaligned.

**Visual Symptom:**
- Text bleeds outside the glass card boundaries
- Padding/margin from React Native styles not respected inside the native view
- Content may appear at wrong positions relative to the glass effect

**Root Cause Analysis:**
The issue lies in how React Native's layout system interacts with the `insertReactSubview` override:

1. React Native computes layout (Yoga) and sets frames on children
2. We move children from `self` to `effectView.contentView`
3. The computed frames are relative to `self`, not `contentView`
4. Frame origins may be incorrect after reparenting

**Potential Fixes to Investigate:**

1. **Reset child frames relative to contentView:**
```swift
override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let effectView = effectView {
        // Adjust frame origin to be relative to contentView
        var adjustedFrame = subview.frame
        adjustedFrame.origin = .zero  // or calculate offset
        subview.frame = adjustedFrame
        effectView.contentView.insertSubview(subview, at: atIndex)
    }
}
```

2. **Override layoutSubviews to reposition children:**
```swift
override func layoutSubviews() {
    super.layoutSubviews()
    effectView?.frame = bounds
    // Re-layout children within contentView
    for child in effectView?.contentView.subviews ?? [] {
        child.frame = bounds.insetBy(dx: padding, dy: padding)
    }
}
```

3. **Use a container view with autolayout constraints**

4. **Investigate React Native's shadow view system** for custom frame calculation

---

## Files Reference

### Native iOS Files (in `ios-native/`)

| File | Purpose |
|------|---------|
| [`LiquidGlassViewManager.swift`](ios-native/LiquidGlassViewManager.swift) | Main native view with UIGlassEffect |
| [`LiquidGlassViewManager.m`](ios-native/LiquidGlassViewManager.m) | Obj-C bridge for view manager |
| [`LiquidGlassModule.swift`](ios-native/LiquidGlassModule.swift) | Native module for availability checks |
| [`LiquidGlassModule.m`](ios-native/LiquidGlassModule.m) | Obj-C bridge for module |
| [`TestApp-Bridging-Header.h`](ios-native/TestApp-Bridging-Header.h) | Swift-ObjC bridging header |

### TypeScript/React Files (in `src/`)

| File | Purpose |
|------|---------|
| [`native/NativeLiquidGlass.ts`](src/native/NativeLiquidGlass.ts) | TypeScript wrapper for native module |
| [`components/GlassCard.tsx`](src/components/GlassCard.tsx) | React component for glass cards |
| [`components/GlassButton.tsx`](src/components/GlassButton.tsx) | React component for glass buttons |

### Build Scripts

| File | Purpose |
|------|---------|
| [`add_native_module.rb`](add_native_module.rb) | Adds native files to Xcode project |
| [`build_native_glass.sh`](build_native_glass.sh) | Build automation script |

### Generated IPAs

| File | Description |
|------|-------------|
| `TestApp-LiquidGlass.ipa` | First working native glass build |
| `TestApp-NativeGlass.ipa` | Refined native implementation |
| `TestApp-ChildFix.ipa` | Attempted child alignment fix |
| `TestApp-ChildFix2.ipa` | Second child alignment attempt |

---

## Screenshots & Diagnostics

### Native Glass Verification

The app includes runtime diagnostics that confirm native glass is working:

```
✅ hasUIGlassEffect: true
✅ isIOS26: true
✅ iOS Version: 26.0
```

### Visual Confirmation

- The glass effect renders with proper transparency and light refraction
- Background content shows through the glass
- Interactive mode responds to touch

**Note:** Despite the glass effect rendering correctly, child content (text, buttons) may appear outside the expected bounds due to the known alignment issue documented above.

---

## Dependencies

```json
{
  "react": "19.1.0",
  "react-native": "0.80.0",
  "@react-navigation/native": "^7.1.0",
  "@react-navigation/bottom-tabs": "^7.3.0",
  "react-native-screens": "^4.10.0",
  "react-native-safe-area-context": "^5.4.0"
}
```

**Note:** `@callstack/liquid-glass` is included in dependencies but NOT used for the native glass effect. Our implementation directly calls `UIGlassEffect` without any third-party library.

---

## Next Steps

1. **Fix child alignment issue** in `insertReactSubview` implementation
2. Add support for `UIGlassContainerEffect` for parent-child glass relationships
3. Implement glass effect variants (tinted, clear, etc.)
4. Add Android fallback with Material 3 style approximation

---

*Last updated: May 5, 2026*
