# encoding: utf-8
# =============================================================================
# ci_add_native_modules.rb
# CI-friendly version of add_native_module.rb
# Runs from the project root (Marketplace App/Test App/) in GitHub Actions
# =============================================================================
require 'xcodeproj'

ios_dir = File.join(Dir.pwd, 'ios')
project_path = File.join(ios_dir, 'TestApp.xcodeproj')

unless File.exist?(project_path)
  abort "ERROR: #{project_path} not found. Ensure ios/ directory exists."
end

puts "Opening Xcode project: #{project_path}"
project = Xcodeproj::Project.open(project_path)

# Find the TestApp target
target = project.targets.find { |t| t.name == 'TestApp' }
unless target
  puts "  ⚠️  Target 'TestApp' not found, using first target: #{project.targets.first&.name}"
  target = project.targets.first
end

abort 'ERROR: No targets found in Xcode project' unless target
puts "  Target: #{target.name}"

# Find the main source group
main_group = project.main_group.children.find { |g| g.display_name == 'TestApp' }
main_group ||= project.main_group

# Remove existing NativeModules group if present (clean slate)
existing_native = main_group.children.find { |g| g.respond_to?(:display_name) && g.display_name == 'NativeModules' }
if existing_native
  puts '  Removing existing NativeModules group...'
  existing_native.children.each do |child|
    target.source_build_phase.files.each do |bf|
      bf.remove_from_project if bf.file_ref == child
    end
  end
  existing_native.remove_from_project
end

# Create NativeModules group with correct path
native_group = main_group.new_group('NativeModules', 'TestApp/NativeModules')
puts '  Created NativeModules group'

# Add each native file
files_to_add = [
  'LiquidGlassViewManager.swift',
  'LiquidGlassViewManager.m',
  'LiquidGlassModule.swift',
  'LiquidGlassModule.m',
  'TestApp-Bridging-Header.h',
]

files_to_add.each do |f|
  # Use just the filename since the group path points to the directory
  ref = native_group.new_reference(f)
  if f.end_with?('.swift') || f.end_with?('.m')
    target.source_build_phase.add_file_reference(ref)
    puts "  ✅ Added to compile sources: #{f}"
  else
    puts "  ✅ Added as header: #{f}"
  end
end

# Configure build settings for Swift interop
target.build_configurations.each do |config|
  config.build_settings['SWIFT_OBJC_BRIDGING_HEADER'] = 'TestApp/NativeModules/TestApp-Bridging-Header.h'
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
  # Disable code signing for CI
  config.build_settings['CODE_SIGN_IDENTITY'] = ''
  config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
  config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
end

project.save
puts ''
puts '✅ Xcode project saved with native module integration'
puts "   Bridging header: TestApp/NativeModules/TestApp-Bridging-Header.h"
puts "   Swift version: 5.0"
puts "   Code signing: DISABLED (unsigned CI build)"
