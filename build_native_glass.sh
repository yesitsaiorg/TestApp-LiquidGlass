#!/bin/bash
# ============================================================
# build_native_glass.sh
# Integrates custom Swift native module for UIGlassEffect
# and builds the IPA with iOS 26 deployment target
# ============================================================
set -e

echo "============================================================"
echo "  Liquid Glass Native Module Build Script"
echo "  Target: iOS 26.0 | Xcode 26.4 | React Native 0.80"
echo "============================================================"

PROJECT_DIR=~/TestApp
IOS_DIR=$PROJECT_DIR/ios
NATIVE_SRC=$PROJECT_DIR/ios-native

# Step 1: Verify project exists
echo ""
echo "[1/8] Verifying project structure..."
if [ ! -d "$IOS_DIR" ]; then
    echo "ERROR: ios/ directory not found. Run 'npx react-native init' first."
    exit 1
fi

if [ ! -d "$NATIVE_SRC" ]; then
    echo "ERROR: ios-native/ directory not found."
    exit 1
fi

echo "  ✅ Project structure OK"

# Step 2: Copy native Swift/ObjC files into the iOS project
echo ""
echo "[2/8] Copying native module files into ios/TestApp/..."
mkdir -p $IOS_DIR/TestApp/NativeModules

cp $NATIVE_SRC/LiquidGlassViewManager.swift $IOS_DIR/TestApp/NativeModules/
cp $NATIVE_SRC/LiquidGlassViewManager.m $IOS_DIR/TestApp/NativeModules/
cp $NATIVE_SRC/LiquidGlassModule.swift $IOS_DIR/TestApp/NativeModules/
cp $NATIVE_SRC/LiquidGlassModule.m $IOS_DIR/TestApp/NativeModules/
cp $NATIVE_SRC/TestApp-Bridging-Header.h $IOS_DIR/TestApp/NativeModules/

echo "  ✅ Native files copied"

# Step 3: Update deployment target to iOS 26.0
echo ""
echo "[3/8] Setting iOS Deployment Target to 26.0..."
cd $IOS_DIR

# Update project.pbxproj
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*;/IPHONEOS_DEPLOYMENT_TARGET = 26.0;/g' TestApp.xcodeproj/project.pbxproj

# Update Podfile
if grep -q "platform :ios" Podfile; then
    sed -i '' "s/platform :ios, '[0-9.]*'/platform :ios, '26.0'/g" Podfile
else
    sed -i '' "1i\\
platform :ios, '26.0'
" Podfile
fi

echo "  ✅ Deployment target set to iOS 26.0"

# Step 4: Add Swift files to Xcode project using ruby script
echo ""
echo "[4/8] Adding native module files to Xcode project..."

# Use Ruby to modify the Xcode project (xcodeproj gem should be available)
ruby << 'RUBY'
require 'xcodeproj'

project_path = Dir.glob("*.xcodeproj").first
project = Xcodeproj::Project.open(project_path)

# Find the TestApp target
target = project.targets.find { |t| t.name == "TestApp" }
unless target
  puts "  ⚠️  Target 'TestApp' not found, trying first target..."
  target = project.targets.first
end

# Find or create the NativeModules group
main_group = project.main_group.children.find { |g| g.display_name == "TestApp" }
unless main_group
  main_group = project.main_group
end

native_group = main_group.children.find { |g| g.respond_to?(:display_name) && g.display_name == "NativeModules" }
unless native_group
  native_group = main_group.new_group("NativeModules", "TestApp/NativeModules")
end

# Add Swift and .m files
native_files = [
  "TestApp/NativeModules/LiquidGlassViewManager.swift",
  "TestApp/NativeModules/LiquidGlassViewManager.m",
  "TestApp/NativeModules/LiquidGlassModule.swift",
  "TestApp/NativeModules/LiquidGlassModule.m",
  "TestApp/NativeModules/TestApp-Bridging-Header.h",
]

native_files.each do |file_path|
  # Skip if already added
  existing = native_group.children.find { |f| f.respond_to?(:path) && f.path&.end_with?(File.basename(file_path)) }
  next if existing

  file_ref = native_group.new_reference(file_path)
  
  # Add .swift and .m files to compile sources
  if file_path.end_with?(".swift") || file_path.end_with?(".m")
    target.source_build_phase.add_file_reference(file_ref)
  end
end

# Set bridging header
target.build_configurations.each do |config|
  config.build_settings["SWIFT_OBJC_BRIDGING_HEADER"] = "TestApp/NativeModules/TestApp-Bridging-Header.h"
  config.build_settings["SWIFT_VERSION"] = "5.0"
  config.build_settings["CLANG_ENABLE_MODULES"] = "YES"
end

project.save
puts "  ✅ Xcode project updated with native module files"
RUBY

# Step 5: Remove @callstack/liquid-glass from package.json (optional - keep as fallback)
echo ""
echo "[5/8] Keeping @callstack/liquid-glass as optional fallback..."
echo "  ℹ️  Both native module and callstack package will coexist"

# Step 6: Pod install
echo ""
echo "[6/8] Running pod install..."
cd $IOS_DIR
pod install 2>&1 | tail -5
echo "  ✅ CocoaPods installed"

# Step 7: Apply fmt patch if needed
echo ""
echo "[7/8] Checking for fmt consteval issue..."
FMT_FILES=$(find $IOS_DIR/Pods -name "base.h" -path "*fmt*" 2>/dev/null)
if [ -n "$FMT_FILES" ]; then
    echo "$FMT_FILES" | while read -r f; do
        if grep -q "consteval" "$f" 2>/dev/null; then
            sed -i '' 's/consteval/constexpr/g' "$f"
            echo "  ✅ Patched: $f"
        fi
    done
else
    echo "  ℹ️  No fmt patch needed"
fi

# Step 8: Build
echo ""
echo "[8/8] Building archive..."
cd $IOS_DIR

xcodebuild -workspace TestApp.xcworkspace -scheme TestApp \
  -configuration Release \
  -archivePath ./build/TestApp.xcarchive archive \
  CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO \
  IPHONEOS_DEPLOYMENT_TARGET=26.0 \
  2>&1 | grep -E "(BUILD|ARCHIVE|error:|warning:.*LiquidGlass)" | head -20

# Check if archive succeeded
if [ -d "./build/TestApp.xcarchive" ]; then
    echo ""
    echo "  ✅ ARCHIVE SUCCEEDED"
    
    # Create IPA
    echo ""
    echo "Creating IPA..."
    rm -rf ./build/ipa
    mkdir -p ./build/ipa/Payload
    cp -r ./build/TestApp.xcarchive/Products/Applications/TestApp.app ./build/ipa/Payload/
    cd ./build/ipa
    zip -r $PROJECT_DIR/TestApp-NativeGlass.ipa Payload
    
    echo ""
    echo "============================================================"
    echo "  ✅ BUILD COMPLETE"
    echo "  IPA: ~/TestApp/TestApp-NativeGlass.ipa"
    echo "  Size: $(du -sh $PROJECT_DIR/TestApp-NativeGlass.ipa | cut -f1)"
    echo "============================================================"
else
    echo ""
    echo "  ❌ ARCHIVE FAILED"
    echo "  Check build logs above for errors."
    exit 1
fi
