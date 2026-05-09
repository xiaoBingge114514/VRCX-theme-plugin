<div align="center">
  
# 🎨 VRCX非官方主题插件库
  
*为 <img src="https://raw.githubusercontent.com/vrcx-team/VRCX/master/images/VRCX.ico" width="20" height="20"> [VRCX](https://github.com/vrcx-team/VRCX) 提供的自定义主题样式与实用脚本合集*

| **简体中文** | [English](./README.en.md) |
</div>

---

## 📋 目录

- [主题插件](#-主题插件)
  - [Darkblue-theme.css](#Darkblue-themecss)
  - [Pink-themes.css](#pink-themescss)
- [JS脚本](#-js脚本)
  - [Auto Social Status](#auto-social-status)
  - [Auto Social Status + Avatar Auto Switch](#auto-social-status--avatar-auto-switch)
  - [Avatar Auto Switch](#avatar-auto-switch)

---

## 🎨 主题插件

### Darkblue-theme.css

还原2026年初VRCX的深蓝色主题样式

<div align="center">
<img width="1558" height="923" alt="深蓝色示例" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" />
</div>

#### 🖼️ 效果预览
| 原版样式 | 深蓝主题 |
|:--------:|:--------:|
| <img width="512" height="288" alt="源样式" src="https://github.com/user-attachments/assets/2a3c95fe-173b-4461-8d69-b3a9e022f204" /> | <img width="512" height="288" alt="新样式" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" /> |

<br>

---

<br>

### Pink-themes.css

基于 [Kamiya4047](https://github.com/kamiya4047) 复刻的 [粉色主题](https://github.com/vrcx-team/VRCX/wiki/Themes#legacy-broken-themes) 样式

<div align="center">
<img width="1024" height="512" alt="暗色模式" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" />
</div>

#### 🖼️ 效果预览
| 亮色模式 | 暗色模式 |
|:--------:|:--------:|
| <img width="512" height="288" alt="亮色模式" src="https://github.com/user-attachments/assets/49ae3d23-da13-46bd-9b96-f6569ac8249a" /> | <img width="512" height="288" alt="暗色模式" src="https://github.com/user-attachments/assets/72c52954-6465-4bf2-9609-597e1331152c" /> |

<br>

### 📥 安装步骤
1. 下载 `themes/"颜色主题".css` 文件
2. 重命名为 `custom.css` 
3. 放到 `%APPDATA%/VRCX` 里
4. 按下 `Shift + ALT + R` 或重启 VRCX 即可生效

<br>

---

## ⚡ JS脚本

> 🚨 **风险提示：** JS脚本涉及到 VRChat 游戏数据交互，使用脚本存在一定风险。在使用前请务必了解可能的后果，**使用风险自负！** 建议仅在了解代码功能的情况下使用。

> 📦 **关于 [JSE] 标记：** 带有 [JSE] (JavaScript Extension) 标记的脚本集成了 **ExtensionJSManager**，支持自动卡片管理和多脚本共存。

---

### 💡 2026.5.3版本 正在更新中 *(5.4)💡

### Auto Social Status 

[JSE] 根据时间/房间类型自动切换社交状态

<div align="center">
<img width="1192" height="962" alt="JSE Auto Social Status" src="https://github.com/user-attachments/assets/d22df9c6-54a5-4223-bfe7-8a74a5e55c29" />
</div>



#### 📋 功能说明
- ⏰ **时间规则**：按时间段自动切换状态（如工作时间自动设为 Busy）
- 🏠 **房间规则**：根据房间类型自动切换状态（如进入 Public 自动设为 Busy）
- ⚖️ **优先级设置**：支持时间优先或房间优先
- 📝 **自定义状态文字**：支持自定义状态描述
- 🔄 **多规则支持**：支持添加多个时间段和房间类型规则

#### 📥 安装步骤
1. 下载 `scripts/[JSE]Auto-Social-Status.js` 文件
2. 重命名为 `custom.js` 
3. 放到 `%APPDATA%/VRCX` 里
4. 重启 VRCX
5. 在 Tools 页面的 **扩展JS** 分类中找到卡片
6. 点击卡片配置规则

---

### Avatar Auto Switch

[JSE] 根据房间类型自动切换 Avatar
<img width="1140" height="922" alt="JSE Avatar Auto Switch" src="https://github.com/user-attachments/assets/7554f9d2-eb9d-4cb6-a8d3-feb6889ee93e" />
<div align="center">

</div>

#### 📋 功能说明
- 👤 **自动切换 Avatar**：进入不同房间类型自动更换对应 Avatar
- 🗺️ **双规则配置**：支持配置 A/B 两组规则，灵活应对不同场景
- 🎯 **房间类型选择**：支持 Public、Friends、Friends+、Invite、Invite+、Group 等多种类型
- 📝 **手动输入支持**：可直接输入 Avatar ID 或从列表选择
- 🛡️ **智能防重**：避免重复切换和频繁请求

#### 📥 安装步骤
1. 下载 `scripts/[JSE]Avatar-Auto-Switch.js` 文件
2. 重命名为 `custom.js` 
3. 放到 `%APPDATA%/VRCX` 里
4. 重启 VRCX
5. 在 Tools 页面的 **扩展JS** 分类中找到卡片
6. 点击卡片加载 Avatar 列表并配置切换规则

#### ⚙️ 配置说明
| 设置项 | 说明 |
|:------:|:-----|
| **规则 A/B** | 两组独立的切换规则 |
| **Avatar 选择** | 从已加载列表选择或手动输入 ID |
| **触发房间** | 勾选要触发切换的房间类型 |
| **启用开关** | 总开关控制功能启停 |

> 💡 **提示**：规则 A 和规则 B 的房间类型不要重叠，否则只有规则 A 会生效。

---

### Auto Social Status + Avatar Auto Switch

[JSE] 双功能合一：自动切换社交状态 + 自动切换 Avatar

<div align="center">
<img width="1126" height="449" alt="JSE Auto Social Status+Avatar Auto Switch" src="https://github.com/user-attachments/assets/5c5c9cc5-3a3d-4a9f-921d-aaba6a89f6ca" />
</div>

#### 📋 功能说明
包含上述 **Auto Social Status 和 Avatar Auto Switch** 的全部功能

#### 📥 安装步骤
1. 下载 `scripts/[JSE]Auto-Social-Status+Avatar-Auto-Switch.js` 文件
2. 重命名为 `custom.js` 
3. 放到 `%APPDATA%/VRCX` 里
4. 重启 VRCX
5. 在 Tools 页面的 **扩展JS** 分类中找到两个功能卡片
6. 分别点击配置状态和 Avatar 规则

---

### change-avatar.js（旧版）

更换房间时自动更新模型（单脚本版，无 JSE 支持）

<div align="center">
<img width="355" height="755" alt="QQ20260129-010806" src="https://github.com/user-attachments/assets/982bdc9f-84fe-4261-903f-5bf8e1565958" />
</div>

#### 📋 功能说明
- 🔍 自动检测房间切换事件
- 🔄 进入新世界时自动更换指定模型
- 📝 支持自定义触发条件和目标模型
- 🛡️ 智能防重复触发机制

#### 📥 安装步骤
1. 下载 `scripts/change-avatar.js` 文件
2. 重命名为 `custom.js` 
3. 放到 `%APPDATA%/VRCX` 里
4. 重启 VRCX 
5. 根据注释修改配置参数（模型ID等）
6. 点击 **Save（保存）**

---

## 🔧 技术说明

### ExtensionJSManager 特性
[JSE] 标记的脚本集成了 **ExtensionJSManager**，提供以下增强功能：

| 特性 | 说明 |
|:----:|:-----|
| **自动分类** | 所有扩展脚本自动归类到"扩展JS"分类 |
| **一键折叠** | 支持分类折叠/展开，保持界面整洁 |
| **多脚本共存** | 多个 JS 扩展可同时运行，互不冲突 |
| **自动恢复** | 页面切换后自动恢复卡片位置 |
| **统一销毁** | 全局 `destroy()` 方法一键清理所有扩展 |

### 文件命名规范

* [JSE]功能名称.js          → 带管理器的扩展脚本
* 功能名称.js               → 普通单脚本
