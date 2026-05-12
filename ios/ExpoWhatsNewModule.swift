import ExpoModulesCore

public class ExpoWhatsNewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoWhatsNew")

    AsyncFunction("getAppInfo") {
      let infoDictionary = Bundle.main.infoDictionary
      let version = infoDictionary?["CFBundleShortVersionString"] as? String
      let buildNumber = infoDictionary?["CFBundleVersion"] as? String

      let appInfo: [String: Any] = [
        "platform": "ios",
        "version": nullableString(version),
        "buildNumber": nullableString(buildNumber)
      ]

      return appInfo
    }

    AsyncFunction("getItemAsync") { (key: String) in
      return UserDefaults.standard.string(forKey: key)
    }

    AsyncFunction("setItemAsync") { (key: String, value: String) in
      UserDefaults.standard.set(value, forKey: key)
    }

    AsyncFunction("removeItemAsync") { (key: String) in
      UserDefaults.standard.removeObject(forKey: key)
    }
  }

  private func nullableString(_ value: String?) -> Any {
    guard let value else {
      return NSNull()
    }

    return value
  }
}
