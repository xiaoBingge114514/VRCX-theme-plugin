# 🎨 VRCX非官方主题插件库

*为 VRCX 提供的自定义主题样式与实用脚本合集*

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

<div align="center">
<img width="1558" height="923" alt="深蓝色示例" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" />
</div>


#### 📥 安装步骤
1. 下载 `themes/darkblue-theme.css` 文件
2. 重命名为 'custom.css' 
3. 放到 %APPDATA%/VRCX 里
4. 按下 Shitf + ALT + R 或重启 VRCX 即可生效

#### 🖼️ 效果预览
| 原版样式 | 深蓝主题 |
|:--------:|:--------:|
| <img width="512" height="288" alt="QQ20260128-235001" src="https://github.com/user-attachments/assets/2a3c95fe-173b-4461-8d69-b3a9e022f204" /> | <img width="512" height="288" alt="QQ20260128-233248" src="https://github.com/user-attachments/assets/c8e4d064-ed2c-4eaa-81e3-0985067d1fed" /> |

---

## ⚡ JS脚本

> 🚨 **风险提示：**  JS脚本涉及到 VRChat 游戏数据交互，使用非官方脚本存在一定风险。在使用前请务必了解可能的后果，**使用风险自负！** 建议仅在了解代码功能的情况下使用。

### change-avatar.js

更换房间时自动更新模型


#### 📋 功能说明
- 🔍 自动检测房间切换事件
- 🔄 进入新世界时自动更换指定模型
- 📝 支持自定义触发条件和目标模型
- 🛡️ 智能防重复触发机制

#### 📥 安装步骤
1. 下载 `scripts/change-avatar.js` 文件
2. 重命名为 'custom.js' 
3. 放到 %APPDATA%/VRCX 里
4. 重启 VRCX 
5. 根据注释修改配置参数（模型ID等）
6. 点击 **保存**
