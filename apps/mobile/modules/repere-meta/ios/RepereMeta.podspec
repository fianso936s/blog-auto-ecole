require 'json'
Pod::Spec.new do |s|
  s.name = 'RepereMeta'
  s.version = '1.0.0'
  s.summary = 'Le Repère Permis / Meta Wearables iOS'
  s.description = 'Pont natif Expo pour caméra Meta, enregistrement HEVC intégral sur iPhone et transport live privé facultatif.'
  s.license = { :type => 'MIT' }
  s.author = 'Le Repère Permis'
  s.homepage = 'https://github.com/facebook/meta-wearables-dat-ios'
  # CocoaPods requires source metadata even for an Expo local (:path) pod.
  # Local bridge files below are used; no remote pod is published from this spec.
  s.source = { :git => 'https://github.com/facebook/meta-wearables-dat-ios.git', :tag => '1.0.1' }
  s.platform = :ios, '17.2'
  s.swift_version = '5.9'
  # This pod is consumed from Expo's local modules directory (:path).
  s.source_files = '**/*.{h,m,mm,swift}'
  s.dependency 'ExpoModulesCore'
  # Official prebuilt SDK shares WebRTC 150.7871.03 with RN WebRTC 150.1.0.
  s.dependency 'LiveKitClient-XCFramework', '= 2.18.0'
  s.static_framework = true
end
