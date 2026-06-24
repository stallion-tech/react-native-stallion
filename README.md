[![stallionBanner](https://assets.stalliontech.io/stallion_logo.png)](https://stalliontech.io/)

# React Native Stallion – Best CodePush Alternative & Expo Updates Replacement

[![npm Version](https://img.shields.io/npm/v/react-native-stallion.svg)](https://www.npmjs.com/package/react-native-stallion) [![License](https://img.shields.io/npm/l/react-native-stallion.svg)](https://www.npmjs.com/package/react-native-stallion) [![GitHub Stars](https://img.shields.io/github/stars/stallion-tech/react-native-stallion)](https://github.com/stallion-tech/react-native-stallion) [![npm Downloads](https://img.shields.io/npm/dm/react-native-stallion.svg)](https://www.npmjs.com/package/react-native-stallion) [![SOC 2 Type 1](https://img.shields.io/badge/SOC%202-Type%201%20Compliant-blue)](https://stalliontech.io/trust)

⭐ If React Native Stallion helps you ship OTA updates, [consider starring the repo on GitHub](https://github.com/stallion-tech/react-native-stallion)!

**React Native Stallion** is a modern **CodePush alternative** and **App Center replacement** for React Native apps. Ship app updates instantly with **up to 98% smaller patches (depending on changes)**—no app store resubmission required for JavaScript updates. A full-featured **Expo EAS Update alternative** with advanced OTA controls, patch-based updates, and enterprise security.

Trusted by **2,500+ organizations** serving **500M+ users**. **10,000 MAU free tier** — no credit card required.

👉 **[Sign up with Stallion](https://console.stalliontech.io/)** to start shipping OTA updates today

---

## Why Choose React Native Stallion?

React Native Stallion is a leading **CodePush replacement** for teams that need modern OTA update capabilities:

- **Up to 98% Smaller Patch Updates (Depending on Changes)** – Binary-safe differential updates, not full bundles
- **Automatic Rollback & Crash Recovery** – Instant rollback on crashes or failures
- **Advanced Security Features** – Cryptographic bundle signing with customer keys
- **No App Store Resubmission for JavaScript Updates** – Ship JavaScript updates instantly
- **CodePush Compatible** – Easy migration from CodePush or App Center
- **Advanced Analytics** – Release-wise adoption and failure tracking
- **On-Premise Option** – Self-hosted deployment with a security-focused architecture
- **Free Tier Available** – Perfect for indie devs and small teams

---

## Quick Start

### Installation

```bash
npm install react-native-stallion@latest
```

### Basic Usage

```javascript
import { useStallionUpdate, restart } from 'react-native-stallion'

const UpdateModal = () => {
  const { isRestartRequired, newReleaseBundle } = useStallionUpdate()

  if (!isRestartRequired) return null

  return (
    <Modal visible>
      <Text>{newReleaseBundle?.releaseNote || 'Update ready!'}</Text>
      <Button onPress={restart} title="Restart App" />
    </Modal>
  )
}
```

---

## Migrating from CodePush?

Replace deprecated CodePush with React Native Stallion in minutes. **[Read the migration guide →](https://stalliontech.io/learn/docs/migrating-from-codepush)**

---

## Key Features

### Patch Updates (Up to 98% Smaller, Depending on Changes)

React Native Stallion uses **binary-safe differential updates** instead of full bundles. Ship only what changed—tiny patches that are cryptographically verified and applied atomically.

- **Differential/Patch Updates** – Binary-safe diffs, up to 98% smaller than full bundles (depending on changes)
- **Bandwidth Efficiency** – Minimal data transfer for faster installs
- **Instant Updates** – Users never notice the update process

### Automatic Rollback & Crash Recovery

Protect your users with automatic rollback capabilities:

- **Automatic Rollback** – Instant rollback on crashes or failures
- **Crash Loop Prevention** – Prevents bad updates from breaking your app
- **Manual Rollback** – Device-level revert for installed updates
- **Rollback Analytics** – Track rollback rates and reasons

### Security-Focused Architecture

Advanced security features for production apps:

- **Bundle Signing** – Cryptographic verification with customer-managed keys
- **Integrity Verification** – SHA-256 checksums for tamper-proof updates
- **On-Premise Hosting** – Deploy behind your firewall with full control
- **Privacy-Focused Architecture** – Supports regional data residency

### Advanced OTA Controls

Granular control over update deployment:

- **Mandatory & Optional Updates** – CodePush-style update flows
- **Phased Rollout** – Gradual deployment with percentage controls
- **Custom Update UI** – Build custom modals, banners, or prompts
- **Update Strategy Control** – Granular install strategies
- **Background Updates** – Automatic checks when app moves to foreground

---

## 🔧 Installation & Setup

### Step 1: Install the Package

```bash
npm install react-native-stallion@latest
# or
yarn add react-native-stallion@latest
```

### Step 2: Native Integration

For complete setup instructions, native integration steps, and environment configurations, visit:

**📚 [Full Installation Guide](https://stalliontech.io/learn/docs/sdk/installation)**

### Step 3: Configure Stallion

```javascript
import { withStallion } from 'react-native-stallion'

export default withStallion(RootComponent);
```

---

## Documentation & Resources

### Complete Documentation

- **[Full Documentation](https://stalliontech.io/learn)** – Complete API reference and guides
- **[SDK Installation](https://stalliontech.io/learn/docs/sdk/installation)** – Step-by-step setup
- **[Bundle Signing](https://stalliontech.io/learn/docs/bundle-signing)** – Security best practices
- **[Custom Update UI](https://stalliontech.io/learn/blogs/react-native-over-the-air-updates-with-custom-ui)** – Build custom flows
- **[CI/CD Integration](https://stalliontech.io/learn/docs/release-automation)** – Automate deployments

### Featured Guides

- **[New Architecture Support](https://stalliontech.io/react-native-new-architecture)** – Fabric, TurboModules, and React Native 0.76+
- **[Patch Updates Explained](https://stalliontech.io/react-native-patch-updates)** – How binary-safe diffs work
- **[OTA Security Guide](https://stalliontech.io/ota-update-security)** – Bundle signing, integrity, and rollbacks
- **[OTA Best Practices (2026)](https://stalliontech.io/learn/blogs/react-native-ota-best-practices-stallion)** – Safer release workflows
- **[React Native OTA Updates Guide](https://stalliontech.io/react-native-ota-updates-guide)** – Complete OTA overview
- **[API Reference](https://stalliontech.io/learn/docs/sdk/api-reference)** – SDK hooks and methods
- **[Getting Started](https://stalliontech.io/learn/docs/introduction)** – Platform overview
- **[Pricing](https://stalliontech.io/pricing)** – Plans and free tier details
- **[Trust Center](https://stalliontech.io/trust)** – Compliance and security resources

### Migration Guides

- **[CodePush Migration](https://stalliontech.io/learn/docs/migrating-from-codepush)** – Migrate from CodePush
- **[App Center Migration](https://stalliontech.io/app-center-alternative)** – Replace App Center
- **[Expo Updates Migration](https://stalliontech.io/expo-eas-update)** – Switch from Expo Updates

---

## Use Cases

### CodePush Alternative

React Native Stallion is a **modern CodePush replacement** for teams migrating from deprecated CodePush or App Center:

- ✅ CodePush-compatible API
- ✅ Patch updates (CodePush doesn't support)
- ✅ Active development and support
- ✅ Modern features and security

### Expo Updates Replacement

A strong **Expo Updates replacement** with more features:

- ✅ Patch updates (up to 98% smaller, depending on changes)
- ✅ Advanced OTA controls
- ✅ More affordable pricing
- ✅ Works with Expo SDK 52+ and bare React Native

### Enterprise OTA Updates

Enterprise-ready OTA update solution:

- ✅ On-premise hosting
- ✅ Bundle signing with customer keys
- ✅ Privacy-focused architecture
- ✅ Supports regional data residency

---

## Security

React Native Stallion is SOC 2 Type 1 compliant (Security, Availability, Confidentiality).

---

## Security Features

- **Cryptographic Bundle Signing** – Customer-managed keys for tamper-proof updates
- **SHA-256 Integrity Verification** – Automatic checksum validation
- **Automatic Crash Detection** – Instant rollback on crashes
- **On-Premise Deployment** – Full infrastructure control
- **Audit Logging** – Complete audit trails

---

## Enterprise & On-Premise

### On-Premise Hosting

Take full control with self-hosted deployment:

- **Security-Focused Architecture** – Behind your firewall
- **Complete Infrastructure Control** – Your data centers
- **Privacy-Focused Architecture** – Supports regional data residency
- **Seamless CI/CD** – REST APIs and webhooks
- **Zero Vendor Lock-in** – Full access to logs and metrics

**[Contact sales for on-premise hosting](https://stalliontech.io/)**

---

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file to get started.

---

## Issues & Support

- **[Open Issues](https://github.com/stallion-tech/react-native-stallion/issues)** – Report bugs or request features
- **[Documentation](https://stalliontech.io/learn)** – Complete guides and API reference
- **[Contact Support](https://stalliontech.io/)** – Get help from our team

---

## 🔗 Links

- **Website:** [https://stalliontech.io](https://stalliontech.io)
- **Documentation:** [https://stalliontech.io/learn](https://stalliontech.io/learn)
- **Console:** [https://console.stalliontech.io](https://console.stalliontech.io)
- **GitHub:** [https://github.com/stallion-tech/react-native-stallion](https://github.com/stallion-tech/react-native-stallion)
- **Pricing:** [https://stalliontech.io/pricing](https://stalliontech.io/pricing)
- **NPM Package:** [https://www.npmjs.com/package/react-native-stallion](https://www.npmjs.com/package/react-native-stallion)

---

> **React Native Stallion** – The fastest, safest way to manage React Native OTA updates. A **CodePush alternative** and **Expo EAS Update replacement** with patch-based updates, enterprise security, and up to 98% smaller deployments (depending on changes).
