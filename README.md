# Inventa Monorepo

Monorepo untuk aplikasi Inventa yang dibangun dengan **Turborepo**, **React Native**, **Expo**, dan **Node.js**.

## 📁 Struktur Proyek

```
inventa/
├── apps/
│   ├── api/          # Backend API (Express + TypeScript)
│   └── mobile/       # Mobile App (React Native + Expo)
├── packages/
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configuration
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Expo Go app (untuk testing mobile)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Setup environment variables:
```bash
# Copy .env.example to .env in each app
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

## 🎯 Quick Start

### Run Mobile App (Frontend):
```bash
cd apps/mobile
pnpm exec expo start --port 19000
```
Kemudian scan QR code dengan Expo Go app atau press:
- `w` untuk web browser
- `a` untuk Android emulator
- `i` untuk iOS simulator

### Run API Server (Backend):
```bash
cd apps/api
pnpm dev
```
API akan berjalan di `http://localhost:3000`

## 📦 Apps & Packages

### Apps

- `api`: Backend API server dengan Express dan TypeScript
- `mobile`: Mobile application dengan React Native dan Expo

### Packages

- `@inventa/ui`: Shared UI components untuk React Native
- `@inventa/config`: Shared configuration dan constants

## 🛠️ Development

### Run all apps in development mode:
```bash
pnpm dev
```

### Run specific app:
```bash
# API
cd apps/api
pnpm dev

# Mobile
cd apps/mobile
pnpm dev
```

### Build all apps:
```bash
pnpm build
```

### Lint all packages:
```bash
pnpm lint
```

### Clean all build artifacts:
```bash
pnpm clean
```

## 📱 Mobile App (Expo)

### Run on different platforms:
```bash
cd apps/mobile

# Start Expo
pnpm dev

# Run on Android
pnpm android

# Run on iOS
pnpm ios

# Run on Web
pnpm web
```

## 🔧 API Server

The API server runs on `http://localhost:3000` by default.

### Endpoints:
- `GET /` - Welcome message
- `GET /api/health` - Health check

## 📝 Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean all build artifacts and node_modules
- `pnpm format` - Format code with Prettier

## 🏗️ Built With

- [Turborepo](https://turbo.build/repo) - Monorepo build system
- [React Native](https://reactnative.dev/) - Mobile framework
- [Expo](https://expo.dev/) - React Native framework
- [Express](https://expressjs.com/) - Web framework for Node.js
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [pnpm](https://pnpm.io/) - Package manager

## 📄 License

Private - All rights reserved
