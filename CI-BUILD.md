# CI/CD: GitHub Actions iOS Build

## Overview

This project uses **GitHub Actions with a macOS runner** to build an unsigned IPA file automatically on every push to `main`.

---

## How It Works

### Pipeline Steps

| Step | Action | Time |
|------|--------|------|
| 1 | Checkout code | ~5s |
| 2 | Select Xcode 26+ (iOS 26 SDK) | ~2s |
| 3 | Setup Node.js 18 | ~10s |
| 4 | `npm install` | ~60s |
| 5 | Generate `ios/` directory (if not committed) | ~30s |
| 6 | Install `xcodeproj` Ruby gem | ~10s |
| 7 | Copy native Swift/ObjC files → `ios/TestApp/NativeModules/` | ~2s |
| 8 | Run `ci_add_native_modules.rb` to integrate with Xcode project | ~3s |
| 9 | Set iOS deployment target → 26.0 | ~2s |
| 10 | `pod install` | ~120s |
| 11 | Patch `fmt` consteval → constexpr (if needed) | ~5s |
| 12 | Bundle React Native JS | ~15s |
| 13 | `xcodebuild archive` (unsigned) | ~300s |
| 14 | Package `.ipa` from archive | ~5s |
| 15 | Upload IPA as GitHub artifact | ~10s |

**Total estimated time: ~10 minutes**

---

## Setup Instructions

### 1. Create GitHub Repository

Push the `Test App/` directory as the **repository root**:

```bash
cd "Marketplace App/Test App"
git init
git add .
git commit -m "Initial commit: TestApp with Liquid Glass native module"
git remote add origin https://github.com/YOUR_USERNAME/TestApp.git
git branch -M main
git push -u origin main
```

### 2. Verify Workflow Trigger

The workflow runs automatically on:
- **Push** to `main` branch
- **Pull requests** targeting `main`
- **Manual dispatch** from GitHub UI (Actions tab → "Run workflow")

### 3. Download the IPA

1. Go to **Actions** tab in your GitHub repo
2. Click on the latest workflow run
3. Scroll to **Artifacts** section
4. Download **TestApp-iOS-IPA**

---

## ⚠️ Important: Xcode Version Requirement

This app uses `UIGlassEffect` (iOS 26), which requires **Xcode 26+**.

As of May 2026, GitHub-hosted macOS runners may or may not have Xcode 26 installed. The workflow auto-selects the best available Xcode. If Xcode 26 is NOT available:

### Option A: Wait for GitHub to update runners
GitHub typically updates macOS runners within weeks of new Xcode releases.

### Option B: Use a self-hosted macOS runner
```yaml
# In ios-build.yml, change:
runs-on: macos-15
# To:
runs-on: self-hosted
```

Then set up a Mac with Xcode 26 as a self-hosted runner:
- Repo Settings → Actions → Runners → New self-hosted runner

### Option C: Build without iOS 26 APIs
If you temporarily remove the `@available(iOS 26.0, *)` requirement and the `UIGlassEffect` usage, the app will build with the fallback view on any Xcode version.

---

## Free Tier Limits

| Repo Type | macOS Minutes/Month | Notes |
|-----------|---------------------|-------|
| **Public** | **Unlimited** | Best option for open-source |
| **Private** | ~200 effective | 2,000 min total, macOS counts 10x |

Each build takes ~10 minutes → **~20 builds/month** on private free tier.

---

## Files Created for CI

| File | Purpose |
|------|---------|
| [`.github/workflows/ios-build.yml`](.github/workflows/ios-build.yml) | GitHub Actions workflow definition |
| [`ci_add_native_modules.rb`](ci_add_native_modules.rb) | CI-friendly Xcode project integration script |
| [`CI-BUILD.md`](CI-BUILD.md) | This documentation file |

---

## Unsigned Build Notes

The IPA produced is **unsigned** (`CODE_SIGNING_REQUIRED=NO`). This means:

- ✅ Can be used for **simulator testing** (after extracting the .app)
- ✅ Proves the build **compiles and links** successfully
- ❌ Cannot be installed on physical devices directly
- ❌ Cannot be submitted to App Store

To produce a signed IPA, you need:
1. An Apple Developer account ($99/year)
2. Provisioning profile and signing certificate
3. Store them as GitHub Secrets
4. Add `exportOptionsPlist` to the workflow

---

## Troubleshooting

### Build fails at "Generate iOS project"
The `ios/` directory must either be committed to the repo OR generated from the RN 0.80 template. If generation fails, run locally first:
```bash
npx @react-native-community/cli init TestApp --version 0.80.0
```
Then commit the `ios/` directory.

### Build fails at "Pod install"
Check that the Podfile deployment target matches. The workflow sets it to `26.0`.

### Build fails at xcodebuild
- Download the `xcodebuild-logs` artifact from the failed run
- Check for missing SDKs, signing issues, or compilation errors
- The `fmt consteval` patch handles a known React Native build issue

### Workflow not triggering
- Ensure `.github/workflows/ios-build.yml` is at the **repository root**
- The `Test App/` directory must be the repo root when pushed to GitHub
