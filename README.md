# ShoeForge - 鞋子 3D 个性化定制工具

<div align="center">

<img src="public/vite.svg" alt="ShoeForge Logo" width="80" height="80">

**一款基于 Three.js 的 Web 端鞋子 3D 定制工具**

[在线演示](https://github.com/Leolele07/SHOEFORGE) · [报告问题](https://github.com/Leolele07/SHOEFORGE/issues)

</div>

---

## 功能特性

### 核心功能
- **3D 模型加载** - 支持 GLB/GLTF 格式鞋子模型
- **部件选择** - 点击 3D 模型或列表选择可定制部件
- **颜色定制** - 20 种预设颜色 + 自定义颜色选择器
- **材质定制** - 6 种 PBR 材质（皮革/网面/麂皮/帆布/光面/金属）
- **多视角切换** - 7 种预设视角（正面/侧面左/侧面右/背面/顶部/底部/自由）

### 辅助功能
- **方案管理** - 保存/加载定制方案（JSON 格式）
- **截图导出** - 高清截图下载
- **撤销/重做** - 支持 Ctrl+Z / Ctrl+Y 快捷键
- **本地存储** - 自动保存定制状态
- **响应式布局** - 适配桌面端、平板端、移动端

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **3D 渲染** | Three.js + @react-three/fiber + @react-three/drei | 声明式 3D 场景 |
| **前端框架** | React 18 + TypeScript 5 | 组件化架构 |
| **构建工具** | Vite 6 | 秒级 HMR |
| **样式方案** | Tailwind CSS 4 + CSS 自定义属性 | 设计系统 |
| **状态管理** | Zustand | 轻量级状态管理 |

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆仓库
git clone https://github.com/Leolele07/SHOEFORGE.git
cd SHOEFORGE

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 使用指南

### 基本操作

1. **上传模型** - 点击右上角"上传模型"按钮，选择 GLB/GLTF 文件
2. **选择部件** - 点击 3D 模型或左侧部件列表
3. **修改颜色** - 在右侧面板选择预设颜色或自定义颜色
4. **切换材质** - 在右侧面板选择材质类型
5. **切换视角** - 点击底部视角按钮

### 视角控制

| 视角 | 鼠标左键 | 中键/滚轮按下 | 滚轮 | 说明 |
|------|----------|---------------|------|------|
| 转左/转右 | 平移 | - | 缩放 | 相对旋转90度，纯水平视角 |
| 顶部 | 旋转 | 平移 | 缩放 | 俯视，可旋转 |
| 底部 | 旋转 | 平移 | 缩放 | 仰视，可旋转 |
| 自由 | 旋转 | 平移 | 缩放 | 360° 自由旋转 |

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Z` | 撤销 |
| `Ctrl + Y` | 重做 |
| `Ctrl + Shift + Z` | 重做 |

---

## 项目结构

```
shoe-forge/
├── public/
│   ├── models/          # 3D 模型文件
│   └── textures/        # 材质贴图
├── src/
│   ├── components/
│   │   ├── layout/      # 布局组件（TopBar, MainLayout, Sidebar）
│   │   ├── scene/       # 3D 场景组件（ShoeScene, ShoeModel）
│   │   └── panel/       # 面板组件（ColorPicker, MaterialPicker）
│   ├── store/           # Zustand 状态管理
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具函数
│   ├── styles/          # 样式文件（tokens, components）
│   └── types/           # TypeScript 类型定义
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 设计系统

项目使用 CSS 自定义属性构建设计系统：

```css
/* 颜色 */
--sf-color-primary: #000000;
--sf-text-primary: #111111;
--sf-bg-primary: #ffffff;

/* 间距 */
--sf-space-1: 4px;
--sf-space-2: 8px;
--sf-space-4: 16px;

/* 字体 */
--sf-text-sm: 13px;
--sf-text-base: 15px;
--sf-text-lg: 17px;

/* 圆角 */
--sf-radius-md: 8px;
--sf-radius-lg: 12px;
```

---

## 版本历史

### v1.0.3 (2026-07-17) - 转左/转右旋转逻辑优化
- 转左/转右改为基于正方形四边的旋转逻辑
- 旋转中心为鞋子模型中心
- 四个方向：正面（鞋头）、右侧面、背面（鞋跟）、左侧面
- 每次旋转90度，相机垂直于对应的边
- 可重复点击，循环旋转
- 初始视角为正面（鞋头方向）

### v1.0.2 (2026-07-17) - 视角优化完善
- 修复底部视角点击自由视角无法切换的问题
- 转左/转右改为纯水平视角（相机Y=鞋子中心Y）
- 减小fov至20度，减少透视效果
- 优化相机初始位置和动画过渡

### v1.0.1 (2026-07-17) - 视角交互优化
- 四视角（正面/侧面左/侧面右/背面）改为"转左"/"转右"相对旋转
- 转左/转右为纯水平视角，每次旋转90度，可重复点击
- 按钮点击效果：按下黑色边框，松开恢复
- 按钮顺序：转左、转右、顶部、底部、自由
- 顶部/底部/自由视角支持鼠标滚轮按下平移
- 鞋底自动对齐地面（顶点分析检测朝向）
- 动态相机距离适配不同尺寸模型

### v1.0.0 (2026-07-17)
- 初始版本发布
- 3D 模型加载与展示
- 部件选择与高亮
- 颜色定制（20 种预设 + 自定义）
- 材质定制（6 种 PBR 材质）
- 7 种视角切换
- 方案保存/加载
- 截图导出
- 撤销/重做
- 本地存储持久化
- 响应式布局

---

## 许可证

MIT License

---

## 致谢

- [Three.js](https://threejs.org/) - 3D 渲染引擎
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React 3D 绑定
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Nike By You](https://www.nike.com.cn/u/) - 设计灵感

---

<div align="center">

**Made with ❤️ by ShoeForge Team**

</div>
