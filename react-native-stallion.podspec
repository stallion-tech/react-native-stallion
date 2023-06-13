require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

# Stallion file read
stallionConfig = {}

# stallionConfigPath = "./example/stallion.config.json" # DEV MODE
stallionConfigPath = "../../../stallion.config.json" # PROD MODE

begin
  stallionConfig = JSON.parse(File.read(File.join(__dir__, stallionConfigPath)))
rescue
  File.open(File.join(__dir__, stallionConfigPath), "w") do |f|
    f.write(stallionConfig.to_json)
  end
  print "Error reading stallion.config.json file"
end

print "stallionConfig file parsed:"
print stallionConfig

Pod::Spec.new do |s|
  s.name         = "react-native-stallion"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/redhorse-tech/react-native-stallion.git", :tag => "#{s.version}" }

  if stallionConfig["isEnabled"] == true
    s.source_files = "ios/main/**/*.{h,m,mm,swift}"
  else
    s.source_files = "ios/noop/**/*.{h,m,mm,swift}"
  end

  s.dependency "React-Core"
  s.dependency 'ZIPFoundation'

  # Don't install the dependencies when we run `pod install` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
        "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  end
end
