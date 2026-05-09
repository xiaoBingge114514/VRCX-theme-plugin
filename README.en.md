<div align="center">

# 🎨 VRCX Unofficial Theme & Script Repository

*A collection of custom themes and utility scripts for <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="20" height="20"> [VRCX](https://github.com/vrcx-team/VRCX)*

| [简体中文](./README.md) | **English** |
</div>

---

## 📋 Table of Contents

- [Themes](#-themes)
  - [Darkblue-theme.css](#darkblue-themecss)
  - [Pink-themes.css](#pink-themescss)

- [About WebSocketError](#-about-websocketerror)
  - [How to hide it?](#how-to-hide-it)

- [JS Scripts](#-js-scripts)
  - [Auto Social Status](#auto-social-status)
  - [Auto Social Status + Avatar Auto Switch](#auto-social-status--avatar-auto-switch)
  - [Avatar Auto Switch](#avatar-auto-switch)

---

## 🎨 Themes

### Darkblue-theme.css

Restores the deep blue theme style from early 2026 VRCX

<div align="center">
<img width="1558" height="923" alt="Dark Blue Preview" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" />
</div>

#### 🖼️ Preview
| Original Style | Dark Blue Theme |
|:--------:|:--------:|
| <img width="512" height="288" alt="Original" src="https://github.com/user-attachments/assets/2a3c95fe-173b-4461-8d69-b3a9e022f204" /> | <img width="512" height="288" alt="New Style" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" /> |

<br>

---

<br>

### Pink-themes.css

Based on the [Pink Theme](https://github.com/vrcx-team/VRCX/wiki/Themes#legacy-broken-themes) recreated by [Kamiya4047](https://github.com/kamiya4047)

<div align="center">
<img width="1024" height="512" alt="Dark Mode" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" />
</div>

#### 🖼️ Preview
| Light Mode | Dark Mode |
|:--------:|:--------:|
| <img width="512" height="288" alt="Light Mode" src="https://github.com/user-attachments/assets/49ae3d23-da13-46bd-9b96-f6569ac8249a" /> | <img width="512" height="288" alt="Dark Mode" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" /> |

<br>

### 📥 Installation
1. Download the `themes/<color-theme>.css` file
2. Rename it to `custom.css`
3. Place it in `%APPDATA%/VRCX`
4. Press `CTRL + Shift + R` or restart VRCX to apply

<br>

---

## ❓ About WebSocketError

Since `VRCX 2026.05.03`, error notifications have been moved to the top center of the screen, which can be particularly annoying for users with unstable network connections.

<img width="476" height="121" alt="WebSocketError" src="https://github.com/user-attachments/assets/ec20672b-9f33-438e-a1b3-c2409b3e2544" />


### How to hide it?

Add the following CSS code to your `.css` file to hide the notification popup (this only hides the visual popup — your network issues will still exist):

<pre>
section[aria-label="Notifications alt+T"]
ol.toaster
li[data-type="error"][style*="--initial-height"] {
    height: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden;
    opacity: 0 !important;
    position: absolute !important;
    visibility: hidden !important;
}
</pre>

<br>

---

## ⚡ JS Scripts

> 🚨 **Risk Warning:** JS scripts interact with VRChat game data. Using scripts carries certain risks. Please understand the potential consequences before use — **use at your own risk!** It is recommended to use them only if you understand what the code does.

> 📦 **About the [JSE] Tag:** Scripts marked with [JSE] (JavaScript Extension) integrate **ExtensionJSManager**, supporting automatic card management and multi-script coexistence.

---

### 💡 Updated for version 2026.5.3 💡

### Auto Social Status

[JSE] Automatically switch social status based on time / room type

<div align="center">
<img width="1024" height="812" alt="Auto Social Status" src="https://github.com/user-attachments/assets/a9497d95-9729-46d8-9249-3f88ea5ff765" />
</div>

#### 📋 Features
- ⏰ **Time Rules**: Automatically switch status by time period (e.g., set to Busy during work hours)
- 🏠 **Room Rules**: Automatically switch status based on room type (e.g., set to Busy when joining Public)
- ⚖️ **Priority Settings**: Supports time-priority or room-priority mode
- 📝 **Custom Status Text**: Supports custom status descriptions
- 🔄 **Multiple Rules**: Supports adding multiple time periods and room type rules

#### 📥 Installation
1. Download the `scripts/[JSE]Auto Social Status - 2026.05.03.js` file
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Press `CTRL + Shift + R` or restart VRCX
5. Find the card under the **ExtensionJS** category on the Tools page
6. Click the card to configure rules

---

### Avatar Auto Switch

[JSE] Automatically switch Avatars based on room type

<div align="center">
<img width="1024" height="812" alt="Avatar Auto Switch" src="https://github.com/user-attachments/assets/9235e188-6b31-4c93-b085-47b92fb5406b" />
</div>

#### 📋 Features
- 👤 **Auto Avatar Switch**: Automatically change to the corresponding Avatar when entering different room types
- 🗺️ **Dual Rule Config**: Supports configuring Rule A / Rule B for flexible scenarios
- 🎯 **Room Type Selection**: Supports Public, Friends, Friends+, Invite, Invite+, Group, and more
- 📝 **Manual Input**: Directly enter an Avatar ID or select from the list
- 🛡️ **Smart Deduplication**: Prevents redundant switches and excessive requests

#### 📥 Installation
1. Download the `scripts/[JSE]Avatar Auto Switch - 2026.05.03.js` file
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Press `CTRL + Shift + R` or restart VRCX
5. Find the card under the **ExtensionJS** category on the Tools page
6. Click the card to load the Avatar list and configure switch rules

#### ⚙️ Configuration
| Setting | Description |
|:------:|:-----|
| **Rule A / B** | Two independent switch rules |
| **Avatar Selection** | Choose from loaded list or enter ID manually |
| **Trigger Rooms** | Check the room types that trigger the switch |
| **Enable Toggle** | Master switch to enable/disable the feature |

> 💡 **Tip**: Avoid overlapping room types between Rule A and Rule B; otherwise, only Rule A will take effect.

> ❗ **Tip**: VRCX caches the player's uploaded model list (including deleted models). It is recommended to click your Avatar → Created Models → Refresh before use.

---

### Auto Social Status + Avatar Auto Switch

[JSE] Two-in-one: Auto Social Status + Auto Avatar Switch

<div align="center">
<img width="1024" height="812" alt="Auto Social Status + Avatar Auto Switch" src="https://github.com/user-attachments/assets/fc30fc99-aecf-46a0-9b07-a056e9fb89cc" />
</div>

#### 📋 Features
Includes all features of both **Auto Social Status** and **Avatar Auto Switch** listed above.

#### 📥 Installation
1. Download the `scripts/[JSE]Avatar Auto Switch + Auto Social Status - 2026.05.03.js` file
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Press `CTRL + Shift + R` or restart VRCX
5. Find the two feature cards under the **ExtensionJS** category on the Tools page
6. Click each card to configure status and Avatar rules separately

---

## 🔧 Technical Notes

### ExtensionJSManager Features
Scripts marked with [JSE] integrate **ExtensionJSManager**, providing the following enhancements:

| Feature | Description |
|:----:|:-----|
| **Auto Categorization** | All extension scripts are automatically grouped under the "ExtensionJS" category |
| **One-Click Collapse** | Supports collapsing/expanding categories to keep the UI tidy |
| **Multi-Script Coexistence** | Multiple JS extensions can run simultaneously without conflicts |
| **Auto Restore** | Card positions are automatically restored after page switches |
| **Unified Cleanup** | Global `destroy()` method cleans up all extensions at once |

### File Naming Convention

* [JSE]FeatureName.js — Extension script with manager
* FeatureName.js — Standalone script
