# encoding: utf-8
# fix_paths.rb - Fix the doubled file references in Xcode project
require 'xcodeproj'

Dir.chdir(File.expand_path('~/TestApp/ios'))

project = Xcodeproj::Project.open('TestApp.xcodeproj')
target = project.targets.first

# Remove existing bad references and re-add correctly
main_group = project.main_group.children.find { |g| g.display_name == 'TestApp' }
main_group ||= project.main_group

# Find NativeModules group
native_group = main_group.children.find { |g| g.respond_to?(:display_name) && g.display_name == 'NativeModules' }

if native_group
  # Remove all children and the group itself
  native_group.children.each do |child|
    # Remove from build phases
    target.source_build_phase.files.each do |bf|
      if bf.file_ref == child
        bf.remove_from_project
      end
    end
  end
  native_group.remove_from_project
end

# Re-create group with correct path
native_group = main_group.new_group('NativeModules', 'TestApp/NativeModules')

files_to_add = [
  'LiquidGlassViewManager.swift',
  'LiquidGlassViewManager.m',
  'LiquidGlassModule.swift',
  'LiquidGlassModule.m',
  'TestApp-Bridging-Header.h',
]

files_to_add.each do |f|
  # Use just the filename since the group path already points to the directory
  ref = native_group.new_reference(f)
  if f.end_with?('.swift') || f.end_with?('.m')
    target.source_build_phase.add_file_reference(ref)
  end
end

target.build_configurations.each do |config|
  config.build_settings['SWIFT_OBJC_BRIDGING_HEADER'] = 'TestApp/NativeModules/TestApp-Bridging-Header.h'
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
end

project.save
puts 'Fixed - file references now use correct paths'
