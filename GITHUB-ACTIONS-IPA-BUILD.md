# Building iOS IPA via GitHub Actions — What Worked (And What Didn't)

> **Final Result**: ✅ Unsigned IPA built successfully in **11 minutes 22 seconds** on GitHub's free macOS runner.  
> **Repo**: [github.com/yesitsaiorg/TestApp-LiquidGlass](https://github.com/yesitsaiorg/TestApp-LiquidGlass)  
> **IPA Size**: 3.83 MB  
> **Date**: May 17, 2026

---

## The Goal

Build an unsigned `.ipa` file for **TestApp** (React Native 0.80 + iOS 26 UIGlassEffect native module) using **GitHub Actions with a macOS runner** — no Mac hardware, no Apple Developer account, completely free for public repos.

---

## The Final Working Setup

### Prerequisites

| Component | Version | Why |
|-----------|---------|-----|
| React Native | 0.80.0 | Bare project (NOT Expo) |
| React | 19.1.0 | Required by RN 0.80 |
| Node.js | 18 | LTS, required by RN |
| Xcode | 26.0.1 (on runner) | iOS 26 SDK for `UIGlassEffect` |
| CocoaPods | 1.16.2 (on runner) | iOS dependency management |
| Ruby | Pre-installed on runner | For `xcodeproj` gem |

### Files That Make It Work

```
TestApp/                          ← This is the GitHub repo root
├── .github/
│   └── workflows/
│       └── ios-build.yml         ← The CI workflow (16 steps)
├── ci_add_native_modules.rb      ← Ruby script to add Swift files to Xcode
├── ios-native/                   ← Swift/ObjC native module source
│   ├── LiquidGlassViewManager.swift
│   ├── LiquidGlassViewManager.m
│   ├── LiquidGlassModule.swift
│   ├── LiquidGlassModule.m
│   └── TestApp-Bridging-Header.h
├── src/                          ← React components & TypeScript
├── package.json                  ← Dependencies (pinned versions!)
├── index.js
├── app.json
└── ... (other RN files)
```

**Note**: The `ios/` directory is NOT committed. It's auto-generated in CI from the React Native template. This keeps the repo clean and avoids Xcode project conflicts.

---

## The 16-Step Workflow (What Finally Worked)

```yaml
name: iOS Build
on:
  push:
    branches: [main]
  workflow_dispatch:    # manual trigger
```

| Step | What It Does | Time |
|------|-------------|------|
| 1 | `actions/checkout@v4` | ~5s |
| 2 | Select Xcode 26.0.1 via `xcode-select` | ~2s |
| 3 | `actions/setup-node@v4` (Node 18) | ~10s |
| 4 | `npm install --legacy-peer-deps` | ~45s |
| 5 | Generate `ios/` from RN template if missing | ~3s |
| 6 | `gem install xcodeproj` | ~10s |
| 7 | Copy `ios-native/` → `ios/TestApp/NativeModules/` | ~1s |
| 8 | Run `ci_add_native_modules.rb` (Xcode project integration) | ~2s |
| 9 | Set deployment target to iOS 26.0 in pbxproj + Podfile | ~1s |
| 10 | `pod install` (no `use_modular_headers!`) | ~30s |
| 11 | Patch `fmt` `consteval` → `constexpr` | ~1s |
| 12 | `npx react-native bundle` (JS bundle) | ~15s |
| 13 | `xcodebuild archive` (unsigned, no code signing) | ~8min |
| 14 | Package `.app` → `.ipa` via zip | ~2s |
| 15 | `actions/upload-artifact@v4` | ~5s |
| 16 | Upload build logs on failure | (conditional) |

**Key xcodebuild flags:**
```bash
xcodebuild -workspace TestApp.xcworkspace \
  -scheme TestApp \
  -sdk iphoneos \
  -configuration Release \
  -archivePath ./build/TestApp.xcarchive \
  archive \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  IPHONEOS_DEPLOYMENT_TARGET=26.0
```

---

## The 6 Failures Before Success

### ❌ Attempt 1: `npm install` failed (29 seconds)

**Error:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react-native@">=0.82.0" from react-native-screens@4.25.0
```

**Root Cause**: `react-native-screens@^4.10.0` resolved to `4.25.0` which requires RN ≥ 0.82, but we have RN 0.80.

**Fix**: Added `--legacy-peer-deps` to `npm install`.

---

### ❌ Attempt 2: `npx react-native bundle` failed (1m 5s)

**Error:**
```
⚠️ react-native depends on @react-native-community/cli for cli commands.
```

**Root Cause**: React Native 0.80 decoupled the CLI. It's no longer bundled — you must install it explicitly.

**Fix**: Added to `package.json` devDependencies:
```json
"@react-native-community/cli": "^18.0.0",
"@react-native-community/cli-platform-ios": "^18.0.0"
```

---

### ❌ Attempt 3: `pod install` passed but `xcodebuild` failed (1m 34s)

**Error:**
```
xcodebuild: error: 'TestApp.xcworkspace' does not exist.
```

**Root Cause**: `pod install` actually FAILED (Swift module dependency error) but the failure was masked by piping through `tail -20` which swallowed the non-zero exit code.

The actual pod install error was:
```
The Swift pod `RNScreens` depends upon `React-RCTImage`, which does not define modules.
To opt into those targets generating module maps, you may set `use_modular_headers!`
globally in your Podfile.
```

No `.xcworkspace` was generated → xcodebuild couldn't find it.

**Fix**: 
1. Removed `| tail -20` from `pod install` (stop masking errors)
2. Added `use_modular_headers!` to Podfile

---

### ❌ Attempt 4: YAML parse error (0 seconds)

**Error:**
```
This run likely failed because of a workflow file issue.
```

**Root Cause**: The `sed` command to insert `use_modular_headers!` used a `\` + literal newline in the YAML:
```yaml
# THIS BROKE YAML:
sed -i '' '/^platform :ios/a\
use_modular_headers!' Podfile
```

Even inside a `|` block scalar, some YAML parsers choke on this pattern.

**Fix**: Replaced with `perl` one-liner:
```yaml
perl -i -pe 'print "use_modular_headers!\n" if /^platform :ios/' Podfile
```

---

### ❌ Attempt 5: `xcodebuild` compilation failed (6m 28s)

**Error:**
```
error: Redefinition of module 'react_runtime'
  at Pods/Headers/Public/react_runtime/React-jsitooling.modulemap

error: Could not build module '_Builtin_stdbool'
error: Could not build module 'Foundation'
error: Could not build module 'UIKit'
```

**Root Cause**: Global `use_modular_headers!` in the Podfile generated modulemaps for ALL pods, which **conflicted with React Native's own modulemaps**. React Native manages its own module definitions — the global flag creates duplicates.

**Fix**: 
1. **Removed** `use_modular_headers!` entirely
2. **Pinned** `react-native-screens` to exact version `4.10.0` (instead of `^4.10.0`)
   - Version `4.10.0` doesn't have the Swift dependency that triggers the modular_headers requirement
   - The `^` caret was resolving to `4.25.0` which introduced Swift code needing modular headers

---

### ✅ Attempt 6: SUCCESS (11m 22s)

```
completed  success  iOS Build  main  push  25983616240  11m22s
```

**What worked**: Pinning `react-native-screens` to `4.10.0`, removing global `use_modular_headers!`, and letting React Native manage its own modulemaps.

---

## Key Lessons Learned

### 1. Pin Your Dependencies
```json
// ❌ BAD: Resolves to incompatible 4.25.0
"react-native-screens": "^4.10.0"

// ✅ GOOD: Stays at exact known-working version
"react-native-screens": "4.10.0"
```

### 2. Never Mask Exit Codes
```bash
# ❌ BAD: `tail` swallows the exit code — failure looks like success
pod install --verbose 2>&1 | tail -20

# ✅ GOOD: Direct execution, failure stops the pipeline
pod install
```

### 3. Don't Use Global `use_modular_headers!` with React Native
React Native manages its own Clang module definitions. Adding `use_modular_headers!` creates duplicate modulemaps that cause `Redefinition of module` errors. If a specific pod needs modular headers, use per-pod targeting:
```ruby
pod 'SpecificPod', :modular_headers => true
```

### 4. RN 0.80 Decoupled the CLI
React Native 0.80+ requires explicitly installing:
```json
"@react-native-community/cli": "^18.0.0",
"@react-native-community/cli-platform-ios": "^18.0.0"
```

### 5. Xcode 26 IS Available on GitHub Runners
As of May 2026, `macos-15` runners have Xcode 26.0.1 with `iphoneos26.0` SDK. The `UIGlassEffect` API compiles fine.

### 6. The `ios/` Directory Can Be Generated in CI
You don't need to commit the `ios/` directory. The workflow generates it from the RN template:
```bash
npx @react-native-community/cli init TestApp \
  --version 0.80.0 --directory /tmp/rn-ios-gen \
  --skip-install --skip-git-init
cp -r /tmp/rn-ios-gen/ios ./ios
```

---

## How to Reproduce

### Step 1: Clone and Push to Your Own GitHub Repo
```bash
git clone https://github.com/yesitsaiorg/TestApp-LiquidGlass.git
cd TestApp-LiquidGlass
# Fork or create your own repo and push
```

### Step 2: GitHub Actions Runs Automatically
Every push to `main` triggers the build. Or trigger manually:
- Go to **Actions** tab → **iOS Build** → **Run workflow**

### Step 3: Download the IPA
- Go to **Actions** tab → click the successful run → **Artifacts** section → download **TestApp-iOS-IPA**

### Via GitHub CLI
```bash
gh run list --limit 1
gh run download <RUN_ID> --dir ./output
# IPA will be at ./output/TestApp-iOS-IPA/TestApp.ipa
```

---

## Cost

| Repo Type | macOS Minutes/Month | Builds/Month (~11 min each) |
|-----------|--------------------|-----------------------------|
| **Public** | **Unlimited** | **Unlimited** |
| Private | ~200 effective (10x multiplier) | ~18 |

**For open-source projects: completely free with zero limits.**

---

## What the IPA Contains

- React Native 0.80.0 app with iOS 26 native `UIGlassEffect`
- Custom Swift native modules (`LiquidGlassViewManager`, `LiquidGlassModule`)
- Objective-C bridge files for RN ↔ Swift interop
- Bundled JavaScript (Release mode, no dev tools)
- **Unsigned** — suitable for simulator testing, not App Store submission

To sign the IPA for device installation or App Store, you'd need:
1. Apple Developer account ($99/year)
2. Provisioning profile + signing certificate stored as GitHub Secrets
3. `exportOptionsPlist` added to the workflow

---

*Document created: May 17, 2026*  
*GitHub Actions Run: [#25983616240](https://github.com/yesitsaiorg/TestApp-LiquidGlass/actions/runs/25983616240)*
