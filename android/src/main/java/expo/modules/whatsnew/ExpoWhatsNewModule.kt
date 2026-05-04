package expo.modules.whatsnew

import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoWhatsNewModule : Module() {
  private val preferencesName = "expo-whats-new"

  override fun definition() = ModuleDefinition {
    Name("ExpoWhatsNew")

    AsyncFunction("getAppInfo") {
      val context = appContext.reactContext ?: appContext.applicationContext
      val packageName = context?.packageName
      val packageInfo = packageName?.let {
        context.packageManager.getPackageInfo(it, 0)
      }
      val buildNumber = packageInfo?.let {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          it.longVersionCode.toString()
        } else {
          @Suppress("DEPRECATION")
          it.versionCode.toString()
        }
      }

      mapOf(
        "platform" to "android",
        "version" to packageInfo?.versionName,
        "buildNumber" to buildNumber
      )
    }

    AsyncFunction("getItemAsync") { key: String ->
      preferences().getString(key, null)
    }

    AsyncFunction("setItemAsync") { key: String, value: String ->
      preferences().edit().putString(key, value).apply()
    }

    AsyncFunction("removeItemAsync") { key: String ->
      preferences().edit().remove(key).apply()
    }
  }

  private fun preferences() =
    requireNotNull(appContext.reactContext ?: appContext.applicationContext)
      .getSharedPreferences(preferencesName, 0)
}
