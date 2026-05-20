# How to Build Android APK for Ghar Sansar

## Prerequisites Required

### 1. **Install Android Studio** (Required)
   - Download from: https://developer.android.com/studio
   - Install Android SDK Build-Tools
   - Install Android SDK Platform-Tools
   - Accept all licenses

### 2. **Install Java Development Kit (JDK)** (Required)
   - Download JDK 17 or later from: https://www.oracle.com/java/technologies/downloads/
   - Or install OpenJDK: https://adoptium.net/
   - Set JAVA_HOME environment variable

### 3. **Configure Environment Variables**
   
   **Windows:**
   ```powershell
   # Set JAVA_HOME (replace with your actual path)
   setx JAVA_HOME "C:\Program Files\Java\jdk-17"
   setx PATH "%PATH%;%JAVA_HOME%\bin"
   
   # Verify installation
   java -version
   javac -version
   ```

## Building the APK

### Option 1: Using Android Studio (Recommended)

1. **Open the Android Project**
   ```bash
   cd d:/out_projects/GHARSANSAR
   ```
   
2. **Open Android Studio**
   - Launch Android Studio
   - Click "Open an Existing Project"
   - Navigate to `d:/out_projects/GHARSANSAR/android`
   - Wait for Gradle sync to complete

3. **Build the APK**
   - Go to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Wait for the build to complete

4. **Find the APK**
   - Location: `android/app/build/outputs/apk/release/`
   - File: `app-release.apk`

### Option 2: Using Command Line (Requires Android Studio & JDK)

```bash
cd d:/out_projects/GHARSANSAR

# 1. Build the web app
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

### Option 3: Generate Signed APK for Play Store

```bash
cd d:/out_projects/GHARSANSAR/android

# Generate keystore (first time only)
keytool -genkeypair -v -storetype PKCS12 -keystore gharsansar-keystore.jks -alias gharsansar -keyalg RSA -keysize 2048 -validity 10000

# Build signed APK
./gradlew assembleRelease
```

## Quick Alternative: Online APK Builder

Since building APKs requires Android Studio setup, you can use online services:

### Services to Convert Web to APK:
1. **PWABuilder** - https://www.pwabuilder.com/
   - Upload your Vercel URL
   - Download Android APK
   
2. **Appsgeyser** - https://www.appsgeyser.com/
   - Simple web-to-APK converter

3. **WebAppShop** - https://webappshop.com/
   - Free APK generation

4. **CodenRock** - https://www.codenrock.com/
   - Professional web-to-APK service

## Recommended Approach

**For quick sharing with the owner:**

1. **Deploy to Vercel** (already done)
2. **Share the Vercel URL** 
3. **User can "Add to Home Screen"** on Android:
   - Open the website in Chrome
   - Click menu (3 dots)
   - Select "Add to Home Screen" or "Install App"
   - Works like a native app!

**For actual APK distribution:**

Use **PWABuilder**:
1. Visit: https://www.pwabuilder.com/
2. Enter your website URL: `https://www.gharsansar.store`
3. Click "Start"
4. Click "Android" platform
5. Download the APK

## Current Project Status

✅ **Web App**: Fully functional and deployed
✅ **Mobile Responsive**: Works perfectly on all devices
✅ **PWA Ready**: Can be installed on Android via Chrome
✅ **Capacitor Setup**: Android project structure created

The Android project is located at: `d:/out_projects/GHARSANSAR/android/`

## Important Notes

- **Admin Dashboard**: All admin features work perfectly in web version
- **Mobile UI**: Fully responsive with animations
- **Performance**: Optimized for mobile devices
- **Offline**: PWA features enable offline usage

## Contact

For any issues during APK build, the web version is fully functional and mobile-ready through PWA installation.

