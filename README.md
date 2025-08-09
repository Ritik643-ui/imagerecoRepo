# Receipt Scanner & Organizer

A modern mobile app built with React Native and Expo that helps you scan, organize, and manage your receipts using OCR technology.

![Receipt Organizer](./assets/screenshots/app-preview.png)

## 🚀 Features

- **📸 Smart Scanning**: Capture receipts using camera or select from gallery
- **🤖 OCR Processing**: Extract text using Google Cloud Vision API
- **📊 Auto-Parsing**: Automatically detect merchant, date, amounts, and tax
- **🗂️ Organization**: Group receipts by merchant with dynamic tabs
- **🔍 Search & Filter**: Find receipts quickly with search and filters
- **✏️ Edit & Manage**: Edit receipt details and delete unwanted receipts
- **🔐 Secure Storage**: Firebase authentication and cloud storage
- **📱 Cross-Platform**: Works on both iOS and Android
- **🎨 Modern UI**: Clean Material Design 3 interface

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **OCR**: Google Cloud Vision API
- **Navigation**: React Navigation 6
- **UI Components**: React Native Paper
- **State Management**: React Context
- **Language**: TypeScript
- **Styling**: StyleSheet with theme system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/receipt-organizer.git
cd receipt-organizer
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env\` file in the root directory and add your API keys:

\`\`\`env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Cloud Vision API
EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key
\`\`\`

### 4. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Set up Firebase Storage
5. Add your app configuration to the \`.env\` file

### 5. Google Cloud Vision Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Vision API
3. Create an API key
4. Add the API key to your \`.env\` file

### 6. Run the App

\`\`\`bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (for testing)
npm run web
\`\`\`

## 📱 App Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (LoadingSpinner, ErrorMessage)
│   ├── ReceiptCard.tsx # Receipt display component
│   ├── MerchantTabs.tsx# Merchant filtering tabs
│   └── ScanButton.tsx  # Floating scan button
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── ReceiptContext.tsx # Receipt data management
├── navigation/         # Navigation configuration
│   ├── AuthStack.tsx   # Authentication screens
│   ├── AppStack.tsx    # Main app screens
│   └── types.ts        # Navigation type definitions
├── screens/            # Screen components
│   ├── HomeScreen.tsx  # Main receipt list
│   ├── ScanScreen.tsx  # Camera/gallery scanning
│   ├── ReceiptDetailScreen.tsx # Receipt details/editing
│   ├── SettingsScreen.tsx # App settings
│   └── auth/           # Authentication screens
├── services/           # External service integrations
│   ├── firebase.ts     # Firebase configuration
│   ├── firestore.ts    # Database operations
│   ├── storage.ts      # File storage operations
│   ├── ocr.ts          # OCR processing
│   ├── parser.ts       # Text parsing logic
│   └── analytics.ts    # Analytics tracking
├── types/              # TypeScript type definitions
├── constants/          # App constants and configuration
├── utils/              # Utility functions
└── App.tsx             # Root component
\`\`\`

## 🔧 Configuration

### Firebase Security Rules

**Firestore Rules** (\`firestore.rules\`):
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own receipts
    match /receipts/{receiptId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
\`\`\`

**Storage Rules** (\`storage.rules\`):
\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own receipt images
    match /receipts/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

### App Configuration

Key configuration files:
- \`app.json\`: Expo app configuration
- \`tsconfig.json\`: TypeScript configuration
- \`.eslintrc.js\`: ESLint rules
- \`src/constants/index.ts\`: App constants

## 🧪 Testing

\`\`\`bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests (when implemented)
npm test
\`\`\`

## 📦 Building for Production

### Development Build
\`\`\`bash
# Create development build
expo build:android
expo build:ios
\`\`\`

### Production Build with EAS
\`\`\`bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
\`\`\`

## 🔒 Security Considerations

- API keys are stored in environment variables
- Firebase security rules restrict data access
- User authentication required for all operations
- Image uploads are scoped to user directories
- OCR processing happens server-side

## 🚧 Known Limitations

- OCR accuracy depends on image quality
- Limited to English text recognition
- Requires internet connection for OCR processing
- Firebase free tier has usage limits
- No offline mode (coming soon)

## 🛣️ Roadmap

### Phase 1 (Current)
- [x] Basic receipt scanning and OCR
- [x] Firebase authentication and storage
- [x] Receipt organization and management
- [x] Search and filtering

### Phase 2 (Coming Soon)
- [ ] CSV export functionality
- [ ] Cloud backup and sync
- [ ] Offline mode support
- [ ] Receipt categories and tags
- [ ] Spending analytics and reports

### Phase 3 (Future)
- [ ] Multi-language OCR support
- [ ] Receipt sharing and collaboration
- [ ] Integration with accounting software
- [ ] Advanced search with AI
- [ ] Expense tracking and budgeting

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Make your changes
4. Run tests and linting: \`npm run lint && npm run type-check\`
5. Commit your changes: \`git commit -m 'Add amazing feature'\`
6. Push to the branch: \`git push origin feature/amazing-feature\`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@receiptorganizer.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/receipt-organizer/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/receipt-organizer/wiki)

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Firebase](https://firebase.google.com/) for backend services
- [Google Cloud Vision](https://cloud.google.com/vision) for OCR capabilities
- [React Native Paper](https://reactnativepaper.com/) for UI components
- [React Navigation](https://reactnavigation.org/) for navigation

## 📊 Analytics & Privacy

This app collects anonymous usage analytics to improve user experience. No personal data or receipt content is shared. You can disable analytics in the app settings.

---

**Made with ❤️ by the Receipt Organizer Team**

