# 海螺AI视频进度监控插件

一个Chrome浏览器扩展，用于实时监控海螺AI平台(hailuoai.video)的视频生成进度。

## 主要功能

- 实时监控视频生成进度
- 在扩展图标上显示当前进度百分比
- 点击图标查看详细进度信息
- 视频生成完成时自动发送系统通知
- 支持多语言（中文、英文）
- 深色主题UI设计

## 安装方法

### 从Chrome网上应用店安装
1. 访问Chrome网上应用店
2. 搜索"海螺AI视频进度监控"
3. 点击"添加到Chrome"

### 开发者模式安装
1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本插件的目录

## 使用说明

1. 安装插件后，在Chrome浏览器右上角会显示插件图标
2. 访问 hailuoai.video 网站
3. 创建视频生成任务
4. 插件会自动开始监控进度：
   - 图标上显示当前进度百分比
   - 点击图标可查看详细进度
   - 任务完成时会收到系统通知

## 技术实现

### 架构设计
- 采用Chrome Extension Manifest V3规范
- 模块化设计，包含：
  - 后台服务（background.js）
  - 内容脚本（content scripts）
  - 弹出界面（popup）
  - 基础监控类（BaseMonitor）
  - 平台适配类（HailuoMonitor）

### 核心功能实现
1. 进度监控：使用MutationObserver监听页面DOM变化
2. 状态管理：通过background.js集中管理所有任务状态
3. 通知系统：使用Chrome通知API发送系统通知
4. 数据存储：使用chrome.storage.local保存任务状态
5. 国际化：支持多语言切换

### 权限说明
- notifications: 用于发送任务完成通知
- storage: 用于保存任务进度信息
- host_permissions: 仅限访问 hailuoai.video 域名

## 文件结构 
extension/
├── manifest.json # 扩展配置文件
├── background.js # 后台服务脚本
├── content/ # 内容脚本
│ ├── common.js # 通用监控基类
│ └── hailuo.js # 海螺平台监控实现
├── popup/ # 弹出窗口
│ ├── index.html # 弹窗页面
│ ├── style.css # 样式文件
│ └── popup.js # 弹窗逻辑
├── locales/ # 国际化资源
│ ├── zh_CN/ # 中文语言包
│ └── en/ # 英文语言包
├── icons/ # 图标资源
├── privacy.html # 隐私政策
└── README.md # 说明文档

## 开发指南

### 本地开发
1. 克隆代码库
2. 修改代码后在Chrome扩展管理页面点击刷新
3. 查看Console日志进行调试

### 代码规范
- 使用ES6+语法
- 保持代码简洁清晰
- 添加必要的错误处理
- 保持良好的代码注释

### 调试方法
1. 打开Chrome开发者工具
2. 选择"扩展程序"面板
3. 查看background和content script的控制台输出

## 隐私说明

- 插件仅在hailuoai.video域名下运行
- 所有数据仅保存在本地，不会上传到服务器
- 仅收集必要的任务进度信息
- 详细隐私政策请查看privacy.html

## 更新日志

### v1.0
- 初始版本发布
- 实现基础进度监控功能
- 添加任务完成通知
- 支持中英文双语

## 问题反馈

如果您在使用过程中遇到任何问题，请通过以下方式反馈：
1. 在GitHub上提交Issue
2. 发送邮件至：[fengakon@gmail.com]

## 开源协议

MIT License