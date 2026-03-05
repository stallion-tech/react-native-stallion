[![stallionBanner](https://assets.stalliontech.io/stallion_logo.png)](https://stalliontech.io/)

# React Native Stallion – Best CodePush Alternative & Expo Updates Replacement

[![npm Version](https://img.shields.io/npm/v/react-native-stallion.svg)](https://www.npmjs.com/package/react-native-stallion)  
[![License](https://img.shields.io/npm/l/react-native-stallion.svg)](https://www.npmjs.com/package/react-native-stallion)

**React Native Stallion** is the modern **CodePush alternative** and **App Center replacement** for React Native apps. Ship app updates instantly with **98% smaller patches**—no App Store delays. The best **Expo Updates alternative** with advanced OTA controls, patch-based updates, and enterprise-grade security.

👉 **[Sign up with Stallion](https://console.stalliontech.io/)** to start shipping OTA updates today

---

## Why Choose React Native Stallion?

React Native Stallion is the **best CodePush alternative** for teams that need modern OTA update capabilities:

- **98% Smaller Patch Updates** – Binary-safe differential updates, not full bundles
- **Automatic Rollback & Crash Recovery** – Instant rollback on crashes or failures
- **Enterprise-Grade Security** – Cryptographic bundle signing with customer keys
- **Zero App Store Delays** – Ship JavaScript updates instantly, no review needed
- **CodePush Compatible** – Easy migration from CodePush or App Center
- **Advanced Analytics** – Release-wise adoption and failure tracking
- **On-Premise Option** – Self-hosted deployment for enterprise security
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

## Key Features

### Patch Updates (98% Smaller)

React Native Stallion uses **binary-safe differential updates** instead of full bundles. Ship only what changed—tiny patches that are cryptographically verified and applied atomically.

- **Differential/Patch Updates** – Binary-safe diffs, 98% smaller than full bundles
- **Bandwidth Efficiency** – Minimal data transfer for faster installs
- **Instant Updates** – Users never notice the update process

### Automatic Rollback & Crash Recovery

Protect your users with automatic rollback capabilities:

- **Automatic Rollback** – Instant rollback on crashes or failures
- **Crash Loop Prevention** – Prevents bad updates from breaking your app
- **Manual Rollback** – Device-level revert for installed updates
- **Rollback Analytics** – Track rollback rates and reasons

### Enterprise Security

Enterprise-grade security features for production apps:

- **Bundle Signing** – Cryptographic verification with customer-managed keys
- **Integrity Verification** – SHA-256 checksums for tamper-proof updates
- **On-Premise Hosting** – Deploy behind your firewall with full control
- **GDPR & Regional Compliance** – Data residency options

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

**📚 [Full Installation Guide](https://learn.stalliontech.io/docs/sdk/installation)**

### Step 3: Configure Stallion

```javascript
import { withStallion } from 'react-native-stallion'

export default withStallion(RootComponent);
```

---

## Documentation & Resources

### Complete Documentation

- **[Full Documentation](https://learn.stalliontech.io)** – Complete API reference and guides
- **[SDK Installation](https://learn.stalliontech.io/docs/sdk/installation)** – Step-by-step setup
- **[Bundle Signing](https://learn.stalliontech.io/docs/bundle-signing)** – Security best practices
- **[Custom Update UI](https://learn.stalliontech.io/blogs/react-native-over-the-air-updates-with-custom-ui)** – Build custom flows
- **[CI/CD Integration](https://learn.stalliontech.io/docs/release-automation)** – Automate deployments

### Migration Guides

- **[CodePush Migration](https://learn.stalliontech.io/docs/migrating-from-codepush)** – Migrate from CodePush
- **[App Center Migration](https://stalliontech.io/app-center-alternative)** – Replace App Center
- **[Expo Updates Migration](https://stalliontech.io/expo-eas-update)** – Switch from Expo Updates

---

## Use Cases

### CodePush Alternative

React Native Stallion is the **best CodePush alternative** for teams migrating from deprecated CodePush or App Center:

- ✅ CodePush-compatible API
- ✅ Patch updates (CodePush doesn't support)
- ✅ Active development and support
- ✅ Modern features and security

### Expo Updates Replacement

The best **Expo Updates alternative** with more features:

- ✅ Patch updates (98% smaller)
- ✅ Advanced OTA controls
- ✅ More affordable pricing
- ✅ Works with Expo SDK 52+ and bare React Native

### Enterprise OTA Updates

Enterprise-grade OTA update solution:

- ✅ On-premise hosting
- ✅ SOC 2 compliant
- ✅ Bundle signing with customer keys
- ✅ Regional compliance options

---

## Security Features

- **Cryptographic Bundle Signing** – Customer-managed keys for tamper-proof updates
- **SHA-256 Integrity Verification** – Automatic checksum validation
- **Automatic Crash Detection** – Instant rollback on crashes
- **On-Premise Deployment** – Full infrastructure control
- **Audit Logging** – Complete audit trails for compliance

---

## Enterprise & On-Premise

### On-Premise Hosting

Take full control with self-hosted deployment:

- **Enterprise-Grade Security** – Behind your firewall
- **Complete Infrastructure Control** – Your data centers
- **Regional Compliance** – GDPR & data residency
- **Seamless CI/CD** – REST APIs and webhooks
- **Zero Vendor Lock-in** – Full access to logs and metrics

**[Contact sales for on-premise hosting](https://stalliontech.io/)**

---

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file to get started.

---

## Issues & Support

- **[Open Issues](https://github.com/stallion-tech/react-native-stallion/issues)** – Report bugs or request features
- **[Documentation](https://learn.stalliontech.io)** – Complete guides and API reference
- **[Contact Support](https://stalliontech.io/)** – Get help from our team

---

## 🔗 Links

- **Website:** [https://stalliontech.io](https://stalliontech.io)
- **Documentation:** [https://learn.stalliontech.io](https://learn.stalliontech.io)
- **Console:** [https://console.stalliontech.io](https://console.stalliontech.io)
- **NPM Package:** [https://www.npmjs.com/package/react-native-stallion](https://www.npmjs.com/package/react-native-stallion)

---

> **React Native Stallion** – The fastest, safest way to manage React Native OTA updates. The best **CodePush alternative** and **Expo Updates replacement** with patch-based updates, enterprise security, and 98% smaller deployments.
