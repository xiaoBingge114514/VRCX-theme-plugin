<div align="center">
  
# 🎨 VRCX Unofficial Theme & Plugin Library
  
*Custom themes and utility scripts for <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="20" height="20"> [VRCX](https://github.com/vrcx-team/VRCX)*

| [简体中文](./README.md) | **English** |
</div>

---

## 📋 Table of Contents

- [Themes](#-themes)
  - [darkblue-theme.css](#darkblue-themecss)
  - [pink-theme.css](#pink-themecss)
- [JS Scripts](#-js-scripts)
  - [change-avatar.js](#change-avatarjs)

---

## 🎨 Themes

### darkblue-theme.css

Restores the dark blue theme style from early 2026.

<div align="center">
<img width="1558" height="923" alt="Dark Blue Theme Preview" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" />
</div>

#### 🖼️ Preview
| Original Style | Dark Blue Theme |
|:------------:|:-------------:|
| <img width="512" height="288" alt="Original" src="https://github.com/user-attachments/assets/2a3c95fe-173b-4461-8d69-b3a9e022f204" /> | <img width="512" height="288" alt="Dark Blue" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" /> |

<br>

---

<br>

### pink-theme.css

Based on [Kamiya4047](https://github.com/kamiya4047)'s [Pink Theme](https://github.com/vrcx-team/VRCX/wiki/Themes#legacy-broken-themes) recreation.

<div align="center">
<img width="1024" height="512" alt="Dark Mode" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" />
</div>

#### 🖼️ Preview
| Light Mode | Dark Mode |
|:----------:|:---------:|
| <img width="512" height="288" alt="Light Mode" src="https://github.com/user-attachments/assets/49ae3d23-da13-46bd-9b96-f6569ac8249a" /> | <img width="512" height="288" alt="Dark Mode" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" /> |

<br>

### 📥 Installation
1. Download the `themes/[theme-name].css` file
2. Rename it to `custom.css`
3. Place it in `%APPDATA%/VRCX`
4. Press **Shift + Alt + R** or restart VRCX to apply

<br>

---

## ⚡ JS Scripts

> 🚨 **Risk Warning:** JS scripts involve VRChat game data interaction. Using unofficial scripts carries certain risks. Please understand the possible consequences before use. **Use at your own risk!** Only use if you understand the code functionality.

### change-avatar.js

Automatically change avatar when switching instances/worlds.

<div align="center">
<img width="355" height="755" alt="Script Interface" src="https://github.com/user-attachments/assets/982bdc9f-84fe-4261-903f-5bf8e1565958" />
</div>

#### 📋 Features
- 🔍 Automatically detect instance/world switching events
- 🔄 Automatically switch to specified avatar when entering new worlds
- 📝 Support custom trigger conditions and target avatars
- 🛡️ Smart anti-repeat trigger mechanism

#### 📥 Installation
1. Download the `scripts/change-avatar.js` file
2. Rename it to `custom.js`
3. Place it in `%APPDATA%/VRCX`
4. Restart VRCX
5. Modify configuration parameters according to comments (avatar ID, etc.)
6. Click **Save**
