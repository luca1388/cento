# Building Cento for Android on a fresh Mac or Windows 10 PC

How to go from a computer with nothing installed to Cento running on your own Android phone, without Expo Go. The app is installed as a normal app, runs on its own with no development server, and has every native feature: notifications, share sheet, widget, contacts import, background refresh.

Written 2026-10-14 for Expo SDK 57 / React Native 0.86. Each setup step has a **macOS** and a **Windows 10** variant; follow the one for your machine and skip the other. Sections with no platform label are the same on both.

**What you need:** a Mac (Apple Silicon or Intel) or a Windows 10 PC, an Android phone, a USB cable, about 15 GB of free disk space, and about an hour the first time (most of it downloads). Later builds take a few minutes. No emulator is used, so Windows does not need virtualization or Hyper-V.

**What you get:** a release build signed with a debug key. That is fine for your own phone and for sharing an APK with friends. It is not suitable for the Play Store, which needs your own upload key.

**Windows shell:** every Windows command below is for **PowerShell**, not Command Prompt. Windows 10 ships Windows PowerShell 5.1, where `&&` does not work, so each command is given on its own line. Open it from the Start menu. Where a step says **as Administrator**, right-click PowerShell and choose "Run as administrator".

## 0. Check what is already installed

Anything that prints `missing` or an old version needs the matching step below.

**macOS** (Terminal):

```bash
echo "brew:  $(command -v brew || echo missing)"
echo "git:   $(git --version 2>/dev/null || echo missing)"
echo "node:  $(node -v 2>/dev/null || echo missing)   (need 20.19+ or 22.13+, 22 recommended)"
echo "java:  $(java -version 2>&1 | head -1)   (need 17 or 21)"
echo "sdk:   ${ANDROID_HOME:-unset}"
echo "adb:   $(command -v adb || echo missing)"
```

**Windows 10** (PowerShell):

```powershell
"winget: $((Get-Command winget -ErrorAction SilentlyContinue).Source)"
"git:    $(git --version 2>$null)"
"node:   $(node -v 2>$null)   (need 20.19+ or 22.13+, 22 recommended)"
"java:   $(java -version 2>&1 | Select-Object -First 1)   (need 17 or 21)"
"sdk:    $env:ANDROID_HOME"
"adb:    $((Get-Command adb -ErrorAction SilentlyContinue).Source)"
```

An empty value means missing.

## 1. Base tools

### macOS: command line tools and Homebrew

Git comes with Apple's command line tools. This opens a dialog; accept it and wait.

```bash
xcode-select --install
```

Install Homebrew (skip if `brew` already works). Follow the "Next steps" it prints at the end to add Homebrew to your shell.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Windows 10: winget, long paths and Git

**winget** installs the other tools. Check that it exists:

```powershell
winget --version
```

If it is missing, install or update **App Installer** from the Microsoft Store, then reopen PowerShell.

**Long paths.** Android native builds create very deep folders, and Windows stops at 260 characters by default. This is the most common cause of mysterious Windows build failures. Run this **as Administrator**:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Install Git, then reopen PowerShell as Administrator and tell Git about long paths:

```powershell
winget install --id Git.Git -e
```

```powershell
git config --system core.longpaths true
```

Restart the PC once so the long path setting takes effect everywhere.

## 2. Node 22

The repository pins Node 22 in `.nvmrc`.

### macOS

```bash
brew install nvm
```

```bash
mkdir -p ~/.nvm
```

Add these lines to `~/.zshrc`, then open a new Terminal window:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"
```

```bash
nvm install 22
```

### Windows 10

Install **nvm-windows**, then close PowerShell and reopen it **as Administrator**. `nvm use` needs administrator rights on Windows because it creates a link.

```powershell
winget install --id CoreyButler.NVMforWindows -e
```

```powershell
nvm install 22
```

```powershell
nvm use 22
```

nvm-windows does not read `.nvmrc`, so run `nvm use 22` by hand in each new window where you build.

If PowerShell later says `npm.ps1 cannot be loaded because running scripts is disabled`, allow local scripts once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 3. Java 17

Gradle needs a JDK. Use 17 (21 also works). Very old versions such as 8 fail, and the newest releases can be too new for the Android Gradle plugin.

### macOS

```bash
brew install --cask zulu@17
```

Add to `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Windows 10

```powershell
winget install --id Microsoft.OpenJDK.17 -e
```

Point `JAVA_HOME` at it. This finds the install folder and saves the variable for your user. Reopen PowerShell afterwards.

```powershell
$jdk = (Get-ChildItem "C:\Program Files\Microsoft" -Filter "jdk-17*" | Select-Object -First 1).FullName
```

```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", $jdk, "User")
```

## 4. Android Studio and the SDK

Android Studio is the easiest way to get the Android SDK, even though you will not open it to build.

### macOS

```bash
brew install --cask android-studio
```

The SDK goes to `~/Library/Android/sdk`.

### Windows 10

```powershell
winget install --id Google.AndroidStudio -e
```

The SDK goes to `C:\Users\<you>\AppData\Local\Android\Sdk`.

### Both: setup wizard and SDK components

Open Android Studio once and go through the setup wizard with the **Standard** install. Then open **Settings → Languages & Frameworks → Android SDK** (on macOS the Settings window is in the Android Studio menu):

- **SDK Platforms** tab: tick **Android 16 (API 36)**.
- **SDK Tools** tab: tick **Android SDK Build-Tools 36.0.0**, **Android SDK Platform-Tools**, **Android SDK Command-line Tools (latest)**, **NDK (Side by side)** version **27.1.12297006**, and **CMake**. Use "Show Package Details" to pick the exact versions.
- Windows only: also tick **Google USB Driver** if your phone is a Pixel.
- Apply, accept the licences and wait for the download.

Gradle can also download the NDK and CMake by itself during the first build if the licences were accepted. Installing them here just makes the first build less surprising.

### macOS: licences and environment

Accept all licences from the command line, which avoids a failure in the middle of the build:

```bash
yes | ~/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager --licenses
```

Add to `~/.zshrc`, then open a new Terminal window:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

### Windows 10: licences and environment

Set `ANDROID_HOME` and add the tools to your user `Path`, then **close and reopen PowerShell** (as Administrator if you use nvm):

```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

```powershell
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin", "User")
```

In the new window, accept the licences. It asks a series of questions; type `y` and press Enter for each:

```powershell
sdkmanager --licenses
```

### Check again

Run the section 0 block again. Every line should now show a value, with Node 22, Java 17 and a path for adb.

## 5. Get the code and install dependencies

**Windows: clone into a short path.** Keep the project close to the drive root, for example `C:\dev\cento`, because native build folders add many characters to the path. Do not put it under `Documents` or `OneDrive`.

### macOS

```bash
git clone <repository-url> birthday-app-docs
```

```bash
cd birthday-app-docs/demo && nvm use 22
```

### Windows 10

```powershell
mkdir C:\dev
```

```powershell
git clone <repository-url> C:\dev\cento
```

```powershell
cd C:\dev\cento\demo
```

```powershell
nvm use 22
```

### Both: install dependencies

```bash
npm install
```

#### If `npm install` fails with 401, 403 or "not found"

The `package-lock.json` in this repository was generated on a machine that used a company registry, so its download URLs point at `europe-npm.pkg.dev`. On a computer without access to that registry, install from the public registry while keeping the exact locked versions:

```bash
npm install --registry=https://registry.npmjs.org/ --replace-registry-host=always
```

If you do have access to the company registry but get a 401, your token has expired. Refresh it with your usual login (for Google Artifact Registry that is `gcloud auth login` followed by `npx google-artifactregistry-auth`) and retry.

## 6. Prepare the phone

1. **Settings → About phone**, tap **Build number** seven times to unlock Developer options.
2. **Settings → System → Developer options**, turn on **USB debugging**.
3. Plug the phone into the computer and accept the "Allow USB debugging?" prompt on the phone. Tick "Always allow" to avoid it next time.
4. Check that the computer sees it. The phone should be listed as `device`, not `unauthorized`:

```bash
adb devices
```

**Windows only:** if the phone does not appear, Windows needs the maker's USB driver. For a Pixel, install **Google USB Driver** from the Android Studio SDK Tools tab and update the device in Device Manager. For Samsung, Xiaomi, OnePlus and others, download the driver from the manufacturer's site. Also set the phone's USB mode to File transfer.

## 7. Build and install

Open a terminal in `demo/apps/app`, with Node 22 active.

- macOS: `cd apps/app` from `demo/`.
- Windows: `cd C:\dev\cento\demo\apps\app`, and use a PowerShell that ran `nvm use 22`.

Generate the native Android project from `app.json` and the config plugins. This creates `apps/app/android/`, which is git-ignored and safe to delete and regenerate.

```bash
npx expo prebuild --platform android
```

The plugin for the iOS widget prints a warning about a missing Apple team ID. Ignore it for Android.

Build the release version and install it on the connected phone:

```bash
npx expo run:android --variant release --device
```

The first run downloads Gradle and the Android libraries and compiles the native modules. Expect 10 to 20 minutes on a Mac and often longer on Windows. When it finishes, Cento opens on the phone and stays installed.

### Alternative: build an APK file

Useful to send the app to someone else or to install without a cable. Run it inside `apps/app/android`.

macOS:

```bash
cd android && ./gradlew assembleRelease
```

Windows:

```powershell
cd android
```

```powershell
.\gradlew.bat assembleRelease
```

The file is at `android/app/build/outputs/apk/release/app-release.apk` (backslashes on Windows).

Install it on a connected phone, from inside the `android` folder:

```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

On Windows use `app\build\outputs\apk\release\app-release.apk`. Or copy the file to the phone and open it there. Android asks you to allow installs from that app, for example from Files or Chrome.

## 8. What to try on the phone

These are the parts that cannot run in a browser or Expo Go, so this is their first real test.

| Feature | How to check |
|---------|--------------|
| Notifications | Settings → Notifications shows a scheduled count after you allow the permission prompt. Add a person whose birthday is tomorrow and check the count goes up. |
| Share sheet | In Chrome, share a page and pick **Cento**. The Save gift idea screen opens with the link. |
| Widget | Long-press the home screen, Widgets, **Cento**. Resize it to see the small, medium and large layouts. |
| Contacts import | Settings → Privacy → Import from contacts. Android asks for the contacts permission only now. |
| Offline | Turn on airplane mode and use the app. All in-app features work offline. |
| Export / import | Settings → Privacy → Full backup (JSON), save it, then import it back. |

## 9. After changing the code

JavaScript and TypeScript changes need a new release build, because the release version embeds the code:

```bash
npx expo run:android --variant release --device
```

Changes to `app.json`, plugins or native dependencies need a clean regeneration first:

```bash
npx expo prebuild --platform android --clean
```

For a faster loop with live reload, install the debug build once and keep the development server running:

```bash
npx expo run:android --device
```

After that, `npm run app` from `demo/` starts Metro and the debug app on the phone connects to it. The phone and the computer must be on the same Wi-Fi network. On Windows, allow Node.js through the firewall when prompted.

## Troubleshooting

### Both platforms

| Symptom | Cause and fix |
|---------|---------------|
| `adb devices` shows `unauthorized` | Unplug, replug, and accept the prompt on the phone. If it never appears, revoke USB debugging authorisations in Developer options and try again. |
| `adb devices` shows nothing | Try another cable or port. Some cables only charge. Set the USB mode on the phone to File transfer. On Windows also see the driver note in section 6. |
| `SDK location not found` | `ANDROID_HOME` is not set in this terminal. Check section 4, or create `android/local.properties` with the SDK path (see the platform rows below). |
| `Unsupported class file major version` or Gradle cannot start | Wrong Java version. Both `java -version` and `JAVA_HOME` must say 17 or 21. |
| `Failed to install the following Android SDK packages as some licences have not been accepted` | Run the `sdkmanager --licenses` command from section 4. |
| `Could not resolve ...` during Gradle | Network or proxy blocking `dl.google.com` or `repo.maven.apache.org`. Try another network or configure the proxy in the user-level `gradle.properties` (see below). |
| `OutOfMemoryError` during the build | Raise `org.gradle.jvmargs` in `android/gradle.properties`, for example `-Xmx4096m`. |
| First build seems stuck on "Configuring" | Normal. Gradle is downloading. Check that the Gradle cache folder keeps growing. |
| App opens and closes immediately | Run `adb logcat *:E` while opening it and read the first red lines. Send them to whoever maintains the project. |
| Install fails with `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | A copy signed with a different key is on the phone. Uninstall Cento from the phone first. |
| Expo Go error about `expo-notifications` | You are in Expo Go, which does not support it on Android since SDK 53. Use the installed build instead. |

### macOS only

| Symptom | Cause and fix |
|---------|---------------|
| `adb: command not found` | The PATH line from section 4 is missing from `~/.zshrc`, or the Terminal window is old. Open a new one. |
| `SDK location not found` persists | Create `android/local.properties` containing `sdk.dir=/Users/<you>/Library/Android/sdk`. |
| Need to set a proxy or Gradle option for your user | Edit `~/.gradle/gradle.properties`. |

### Windows 10 only

| Symptom | Cause and fix |
|---------|---------------|
| `npm.ps1 cannot be loaded because running scripts is disabled` | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. |
| `adb` or `node` is not recognized | The terminal was opened before the environment variables or installs. Close it and open a new one. |
| `nvm use 22` fails with `exit status 1` or access denied | PowerShell is not running as Administrator. Reopen it as Administrator. |
| `ninja: error: ... Filename longer than 260 characters`, `CMake Error ... path too long`, or `The system cannot find the path specified` deep inside `android\app\.cxx` | The path is too long. Enable long paths (section 1), restart, and move the project to a short folder such as `C:\dev\cento`. Then run `npx expo prebuild --platform android --clean`. |
| `SDK location not found` persists | Create `android\local.properties` with `sdk.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk`. Colons and backslashes must be escaped exactly like that. |
| Need to set a proxy or Gradle option for your user | Edit `%USERPROFILE%\.gradle\gradle.properties`. |
| Build is very slow | Windows Defender scans every file Gradle writes. Add exclusions for `%USERPROFILE%\.gradle` and the project folder in Windows Security → Virus & threat protection → Manage settings → Exclusions. Only do this if your organisation allows it. |
| Phone not listed by `adb devices` | Missing OEM USB driver. See the Windows note in section 6. |
| Line ending warnings from Git | Harmless here. The `android` folder is generated, not cloned. |

## Good to know

- **Package name** is `app.cento`, set in `app.json`. Change it before publishing anywhere.
- **Do not commit** `apps/app/android/`. It is generated and already git-ignored.
- **Signing for the Play Store** needs your own upload key and an Android App Bundle (`gradlew bundleRelease`). That is a separate procedure and is not covered here.
- **Building in the cloud** with `eas build` avoids installing Android Studio, but needs an Expo account and a lockfile that points at the public npm registry, so it is not set up in this project.
- **Your data stays on the phone.** The app has no account and no server. Uninstalling it deletes the data, so export a backup first if you want to keep it.
- **iOS** cannot be built on Windows. This guide covers Android only.
- **Windows 10 reached the end of Microsoft support in October 2025.** The toolchain still works, but keep the machine's security updates in mind if it is online.
