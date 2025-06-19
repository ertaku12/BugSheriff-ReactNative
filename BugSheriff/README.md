# React-Native Bug Bounty Platform

## Common React Native (Expo) Commands

### Install dependencies
```bash
npm install
```
Installs the required packages listed in `package.json`.

### Update dependencies
```bash
npm upgrade
```
Upgrades all dependencies to the latest compatible versions.

### Start the Expo development server
```bash
npx expo start
```
Starts the Metro bundler and provides a QR code to open the app on a physical device or emulator.

### Build APK (Android) or IPA (iOS) files
```bash
npx expo prebuild
```
Generates the native Android and iOS project files.

### Clear cache and start fresh
```bash
npx expo start --clear
```
Clears the cache and restarts the Expo development server.

### Run the app on a specific platform
```bash
npx expo run:android
```
Runs the app on an Android emulator or connected device.

```bash
npx expo run:ios
```
Runs the app on an iOS simulator (macOS required).

### Check for outdated dependencies
```bash
npx expo-doctor
```
Scans the project for issues and checks if dependencies are compatible with the current Expo SDK.

