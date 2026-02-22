<div align="center">
  
# 🎨 VRCX Unofficial Theme & Plugin Library
  
*Custom themes and utility scripts for <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="20" height="20"> [VRCX](https://github.com/vrcx-team/VRCX)*

| [简体中文](./README.md) | **English** |
</div>

---

## 📋 Table of Contents

- [Themes](#-themes)
  - [Darkblue-theme.css](#darkblue-themecss)
  - [Pink-themes.css](#pink-themescss)
- [JS Scripts](#-js-scripts)
  - [Auto Social Status](#auto-social-status)
  - [Avatar Auto Switch](#avatar-auto-switch)
  - [Auto Social Status + Avatar Auto Switch](#auto-social-status--avatar-auto-switch)

---

## 🎨 Themes

### Darkblue-theme.css

Restores the deep blue theme style from early 2026 VRCX.

<div align="center">
<img width="1558" height="923" alt="Darkblue Preview" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" />
</div>

#### 🖼️ Preview
| Original | Darkblue Theme |
|:--------:|:--------------:|
| <img width="512" height="288" alt="Original" src="https://github.com/user-attachments/assets/2a3c95fe-173b-4461-8d69-b3a9e022f204" /> | <img width="512" height="288" alt="New Style" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" /> |

<br>

---

<br>

### Pink-themes.css

A recreation of the [pink theme](https://github.com/vrcx-team/VRCX/wiki/Themes#legacy-broken-themes) originally by [Kamiya4047](https://github.com/kamiya4047).

<div align="center">
<img width="1024" height="512" alt="Dark Mode" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" />
</div>

#### 🖼️ Preview
| Light Mode | Dark Mode |
|:----------:|:---------:|
| <img width="512" height="288" alt="Light Mode" src="https://github.com/user-attachments/assets/49ae3d23-da13-46bd-9b96-f6569ac8249a" /> | <img width="512" height="288" alt="Dark Mode" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" /> |

<br>

### 📥 Installation
1. Download the `themes/"theme-name".css` file
2. Rename it to `custom.css`
3. Place it in `%APPDATA%/VRCX`
4. Press `Shift + ALT + R` or restart VRCX to apply

<br>

---

## ⚡ JS Scripts

> 🚨 **Risk Warning:** JS scripts involve interaction with VRChat game data, which carries certain risks. Please understand the potential consequences before use. **Use at your own risk!** It is recommended to only use scripts when you understand their functionality.

> 📦 **About the [JSE] Tag:** Scripts marked with [JSE] (JavaScript Extension) integrate **ExtensionJSManager**, supporting automatic card management and coexistence of multiple scripts.

---

### Auto Social Status

[JSE] Automatically switch social status based on time/room type

<div align="center">
<img width="1192" height="962" alt="JSE Auto Social Status" src="https://github.com/user-attachments/assets/d22df9c6-54a5-4223-bfe7-8a74a5e55c29" />
</div>

#### 📋 Features
- ⏰ **Time Rules**: Auto-switch status by time period (e.g., set to Busy during work hours)
- 🏠 **Room Rules**: Auto-switch status based on room type (e.g., set to Busy when entering Public)
- ⚖️ **Priority Setting**: Support time-priority or room-priority
- 📝 **Custom Status Text**: Support custom status descriptions
- 🔄 **Multi-Rule Support**: Add multiple time periods and room type rules

#### 📥 Installation
1. Download `scripts/[JSE]Auto-Social-Status.js`
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Restart VRCX
5. Find the card in the **Extension JS** category on the Tools page
6. Click the card to configure rules

---

### Avatar Auto Switch

[JSE] Automatically switch Avatar based on room type

<img width="1140" height="922" alt="JSE Avatar Auto Switch" src="https://github.com/user-attachments/assets/7554f9d2-eb9d-4cb6-a8d3-feb6889ee93e" />

<div align="center">
</div>

#### 📋 Features
- 👤 **Auto Avatar Switch**: Automatically change Avatar when entering different room types
- 🗺️ **Dual Rule Config**: Support configuring A/B two sets of rules for flexible scenarios
- 🎯 **Room Type Selection**: Support Public, Friends, Friends+, Invite, Invite+, Group, and more
- 📝 **Manual Input Support**: Directly enter Avatar ID or select from list
- 🛡️ **Smart Deduplication**: Avoid duplicate switches and frequent requests

#### 📥 Installation
1. Download `scripts/[JSE]Avatar-Auto-Switch.js`
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Restart VRCX
5. Find the card in the **Extension JS** category on the Tools page
6. Click the card to load Avatar list and configure switch rules

#### ⚙️ Configuration
| Setting | Description |
|:-------:|:-----------:|
| **Rule A/B** | Two independent switch rules |
| **Avatar Select** | Select from loaded list or manually enter ID |
| **Trigger Rooms** | Check room types to trigger switch |
| **Enable Toggle** | Master switch to control function on/off |

> 💡 **Tip:** Do not overlap room types between Rule A and Rule B, otherwise only Rule A will take effect.

---

### Auto Social Status + Avatar Auto Switch

[JSE] All-in-one: Auto Social Status + Avatar Auto Switch

<div align="center">
<img width="1126" height="449" alt="JSE Auto Social Status+Avatar Auto Switch" src="https://github.com/user-attachments/assets/5c5c9cc5-3a3d-4a9f-921d-aaba6a89f6ca" />
</div>

#### 📋 Features
Includes all features from **Auto Social Status and Avatar Auto Switch**

#### 📥 Installation
1. Download `scripts/[JSE]Auto-Social-Status+Avatar-Auto-Switch.js`
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Restart VRCX
5. Find both function cards in the **Extension JS** category on the Tools page
6. Click each card to configure status and Avatar rules respectively

---

### change-avatar.js (Legacy)

Automatically update model when changing rooms (single script version, no JSE support)

<div align="center">
<img width="355" height="755" alt="QQ20260129-010806" src="https://github.com/user-attachments/assets/982bdc9f-84fe-4261-903f-5bf8e1565958" />
</div>

#### 📋 Features
- 🔍 Auto-detect room switching events
- 🔄 Auto-replace specified model when entering new world
- 📝 Support custom trigger conditions and target models
- 🛡️ Smart anti-repeat trigger mechanism

#### 📥 Installation
1. Download `scripts/change-avatar.js`
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Restart VRCX
5. Modify configuration parameters (model ID, etc.) according to comments
6. Click **Save**

---

## 🔧 Technical Notes

### ExtensionJSManager Features
Scripts marked with [JSE] integrate **ExtensionJSManager**, providing the following enhancements:

| Feature | Description |
|:-------:|:-----------:|
| **Auto Categorization** | All extension scripts are automatically categorized under "Extension JS" |
| **One-Click Collapse** | Support category collapse/expand to keep interface tidy |
| **Multi-Script Coexistence** | Multiple JS extensions can run simultaneously without conflict |
| **Auto Recovery** | Automatically restore card position after page switching |
| **Unified Destroy** | Global `destroy()` method to clean up all extensions at once |

### File Naming Convention
* [JSE]Feature-Name.js          → Extension script with manager
* Feature-Name.js               → Ordinary single script
