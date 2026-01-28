# 🎨 VRCX非官方主题插件库

[![GitHub release](https://img.shields.io/github/release/你的用户名/你的仓库名.svg)](https://github.com/你的用户名/你的仓库名/releases/latest)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![VRCX](https://img.shields.io/badge/VRCX-Compatible-green.svg)](https://vrcx.pypy.moe/)

*为 VRCX 提供的自定义主题样式与实用脚本合集*

[下载](#下载) • [安装指南](#安装指南) • [主题](#主题插件) • [脚本](#js脚本)

---

## 📋 目录

- [主题插件](#-主题插件)
  - [darkblue-theme.css](#darkblue-themecss)
- [JS脚本](#-js脚本)
  - [change-avatar.js](#change-avatarjs)

---

## 🎨 主题插件

### darkblue-theme.css

还原2026年初VRCX的深蓝色主题样式

![darkblue-theme-preview](<img width="1558" height="914" alt="QQ20260128-233248" src="https://github.com/user-attachments/assets/3a6704fb-3a7b-44d0-99f6-e72657a759bf" />)



#### 📥 安装步骤
1. 下载 `themes/darkblue-theme.css` 文件
2. 重命名为 'custom.css' 
3. 放到 %%APPDATA%/VRCX 里
4. 按下 Shitf + ALT + R 或重启 VRCX 即可生效

#### 🖼️ 效果预览
| 原版样式 | 深蓝主题 |
|:--------:|:--------:|
| ![原始](图片链接) | ![深蓝](图片链接) |

---

## ⚡ JS脚本

### change-avatar.js

更换房间时自动更新模型

&lt;div align="center"&gt;

![change-avatar-demo](在此处插入图片链接)

&lt;/div&gt;

#### 📋 功能说明
- 🔍 自动检测房间切换事件
- 🔄 进入新世界时自动更换指定模型
- 📝 支持自定义触发条件和目标模型
- 🛡️ 智能防重复触发机制

#### 📥 安装步骤
1. 下载 `scripts/change-avatar.js` 文件
2. 打开 VRCX → **设置** ⚙️ → **高级** → **自定义 JavaScript**
3. 将 JS 代码粘贴到编辑器中
4. 根据注释修改配置参数（模型ID等）
5. 点击 **保存并运行**

#### ⚙️ 配置示例
```javascript
// ==================== 用户配置区 ====================

// 需要更换的目标模型ID
// 格式: avtr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
const targetAvatarId = 'avtr_00000000-0000-0000-0000-000000000000';

// 是否仅在特定类型的房间触发
// 可选值: 'public', 'friends+', 'friends', 'invite+', 'invite', 'group'
const triggerOnInstanceType = ['public', 'friends+'];

// 是否显示通知提示
const showNotification = true;

// ==================== 配置结束 ====================
