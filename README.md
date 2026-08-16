# GST Invoice Application

A React Native CLI mobile application for generating and managing GST invoices. This app allows users to create invoices, calculate CGST/SGST/IGST automatically based on state codes, and track their sales dashboard.

## Features

- **Dashboard**: Track Total Sales, Tax Collected, and view a visual Sales Trend chart.
- **Invoice Creation**: Form-based invoice creation with dynamic line-items.
- **Auto GST Calculation**:
  - Automatically identifies Inter-state vs Intra-state transactions using the first 2 digits of the GSTIN.
  - Automatically calculates CGST, SGST, and IGST for each item.
- **State Management**: Centralized store utilizing Redux Toolkit.
- **Form Validation**: Strict validation for GSTIN formats and invoice totals using React Hook Form & Yup.

## Tech Stack

- **Framework**: React Native CLI (v0.87)
- **Language**: TypeScript
- **Styling**: Standard React Native StyleSheet (Monochrome aesthetic with custom UI)
- **Forms & Validation**: `react-hook-form` + `@hookform/resolvers` + `yup`
- **State Management**: `@reduxjs/toolkit` + `react-redux`
- **Navigation**: `@react-navigation/native` (Bottom Tabs & Native Stack)
- **Charts**: `react-native-gifted-charts`

## Getting Started

### Prerequisites
- Node.js (v18+)
- Android Studio & SDK (for Android testing)
- React Native CLI environment setup

### Installation
1. Clone this repository.
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Start the Metro Bundler:
   ```sh
   npm start
   ```

### Running on Android
With Metro running, open a new terminal window and run:
```sh
npm run android
```

## Building for Release (APK)

If you want to build an installable APK for your Android device (without uploading to the Play Store), you can build a release APK using the generic debug keystore.

1. Open your terminal in the project root.
2. Navigate to the android directory and run the assemble release command:
   ```sh
   cd android
   .\gradlew assembleRelease
   ```
3. Once the build finishes, you can find your APK at:
   `android/app/build/outputs/apk/release/app-release.apk`
4. Transfer this file to your Android device to install.

---
*Developed as a technical assignment submission.*
