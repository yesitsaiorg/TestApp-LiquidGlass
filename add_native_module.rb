# encoding: utf-8
require 'xcodeproj'

Dir.chdir(File.expand_path('~/TestApp/ios'))

project = Xcodeproj::Project.open('TestApp.xcodeproj')
target = project.targets.first

main_group = project.main_group.children.find { |g| g.display_name == 'TestApp' }
main_group ||= project.main_group

native_group = main_group.children.find { |g| g.respond_to?(:display_name) && g.display_name == 'NativeModules' }
unless native_group
  native_group = main_group.new_group('NativeModules', 'TestApp/NativeModules')
end

files_to_add = [
  'LiquidGlassViewManager.swift',
  'LiquidGlassViewManager.m',
  'LiquidGlassModule.swift',
  'LiquidGlassModule.m',
  'TestApp-Bridging-Header.h',
]

files_to_add.each do |f|
  existing = native_group.children.find { |c| c.respond_to?(:path) && c.path && c.path.end_with?(f) }
  next if existing

  ref = native_group.new_reference("TestApp/NativeModules/#{f}")
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
puts 'Done - native module files added to Xcode project'
