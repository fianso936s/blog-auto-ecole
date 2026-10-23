# frozen_string_literal: true
# Link Meta DAT Swift Package to both CocoaPods local module and the app target.
# Required because Expo autolinking generates the RepereMeta pod target, while
# the official Meta SDK is distributed as SwiftPM only, not a CocoaPod.
# See https://github.com/facebook/meta-wearables-dat-ios/issues/155
require 'xcodeproj'

META_PACKAGE_URL = 'https://github.com/facebook/meta-wearables-dat-ios.git'
META_PACKAGE_VERSION = '1.0.1'

def repere_add_meta_products(project, name)
  target = project.targets.find { |t| t.name == name }
  raise "Missing Xcode target #{name}: #{project.path}" unless target
  package = project.root_object.package_references.find do |ref|
    ref.respond_to?(:repositoryURL) && ref.repositoryURL == META_PACKAGE_URL
  end
  unless package
    package = project.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
    package.repositoryURL = META_PACKAGE_URL
    package.requirement = { 'kind' => 'exactVersion', 'version' => META_PACKAGE_VERSION }
    project.root_object.package_references << package
  end
  %w[MWDATCore MWDATCamera].each do |product_name|
    dependency = target.package_product_dependencies.find { |p| p.product_name == product_name }
    unless dependency
      dependency = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
      dependency.product_name = product_name
      dependency.package = package
      target.package_product_dependencies << dependency
    end
    phase = target.frameworks_build_phase
    unless phase.files.any? { |file| file.product_ref == dependency }
      file = project.new(Xcodeproj::Project::Object::PBXBuildFile)
      file.product_ref = dependency
      phase.files << file
    end
  end
  project.save
end

def repere_link_meta_spm(installer, app_project_path)
  repere_add_meta_products(installer.pods_project, 'RepereMeta')
  app_project = Xcodeproj::Project.open(app_project_path)
  repere_add_meta_products(app_project, 'LeReperePermis')
  # EAS environment variables are set for the native build; they become native
  # Xcode build settings, NOT Expo public JavaScript environment variables.
  app_target = app_project.targets.find { |t| t.name == 'LeReperePermis' }
  app_target.build_configurations.each do |cfg|
    cfg.build_settings['META_APP_ID_VALUE'] = ENV.fetch('META_APP_ID', '0')
    cfg.build_settings['META_CLIENT_TOKEN_VALUE'] = ENV.fetch('META_CLIENT_TOKEN', '')
  end
  # Both targets must retain their SPM link (including app framework embedding).
  # Xcode's archive collector cannot merge duplicate binary provenance entries.
  phase_name = '[RepereMeta] Deduplicate archive provenance'
  phase = app_target.shell_script_build_phases.find { |p| p.name == phase_name }
  phase ||= app_target.new_shell_script_build_phase(phase_name)
  phase.shell_script = '/bin/sh "${PROJECT_DIR}/scripts/meta-archive-provenance.sh"'
  phase.always_out_of_date = '1'
  app_project.save
  Pod::UI.puts '[RepereMeta] DAT SwiftPM linked to app + RepereMeta pod targets.'
end
