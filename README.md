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
- **Rhino图层支持** - 自动识别Rhino导出的GLTF图层结构
- **颜色定制** - 20 种预设颜色 + 自定义颜色选择器 + 原色恢复
- **材质定制** - 11 种 PBR 材质 + 原料恢复
- **贴图系统** - 支持上传颜色/法线/粗糙度/金属度贴图，可调整位置、大小、旋转
- **多视角切换** - 7 种预设视角（正面/侧面左/侧面右/背面/顶部/底部/自由）
- **一键白膜** - 清除所有材质，变为白色模型
- **恢复原始** - 恢复到模型导入时的原始状态

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

- Node.js >= 18.0.0（下载地址：https://nodejs.org/）
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

### 在新电脑上运行

如果需要在其他电脑上运行 ShoeForge，请按以下步骤操作：

**1. 环境准备：**
- 安装 Node.js（>= 18.0.0）：https://nodejs.org/

**2. 下载项目：**
```bash
git clone https://github.com/Leolele07/SHOEFORGE.git
cd SHOEFORGE
git checkout v1.0.6
```

**3. 安装依赖：**
```bash
npm install
```

**4. 启动项目：**
```bash
npm run dev
```

**5. 打开浏览器访问：**
```
http://localhost:5173/
```

**注意事项：**
- 所有定制数据（颜色、材质、贴图）都保存在浏览器本地存储中，不会随项目迁移
- 贴图文件是以 base64 格式存储在配置中的，导出的 JSON 方案会包含贴图数据
- 如果需要保留之前的定制方案，可以在旧电脑上使用"导出方案"功能保存 JSON 文件，然后在新电脑上导入

---

## 使用指南

### 基本操作

1. **上传模型** - 点击右上角"上传模型"按钮，选择 GLB/GLTF 文件
2. **选择部件** - 点击 3D 模型或左侧部件列表
3. **修改颜色** - 在右侧面板选择预设颜色或自定义颜色
4. **切换材质** - 在右侧面板选择材质类型
5. **切换视角** - 点击底部视角按钮

### Rhino图层设置指南

在Rhino中设置图层，导出GLTF后可在ShoeForge中自动识别：

1. **创建图层** - 在Rhino中为每个部件创建独立图层（如"鞋面"、"中底"、"鞋舌"等）
2. **分配对象** - 将对应的网格对象分配到对应图层
3. **导出GLTF** - 使用Rhino的GLTF导出功能
4. **导入ShoeForge** - 在ShoeForge中上传GLTF文件，部件将自动识别

**支持的部件名称**：
- 鞋面 (upper)
- 中底 (midsole)
- 外底 (outsole)
- 鞋舌 (tongue)
- 鞋带 (lace)
- 内衬 (lining)
- 后跟 (heel)
- 标志 (swoosh)
- 配饰 (accessory)

**英文名称也支持**：Upper, Midsole, Outsole, Tongue, Lace, Lining, Heel, Swoosh, Logo

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
│   ├── models/          # 3D 模型文件（支持Rhino导出的GLTF/GLB）
│   └── textures/        # 材质贴图
├── src/
│   ├── components/
│   │   ├── layout/      # 布局组件（TopBar, MainLayout, Sidebar）
│   │   ├── scene/       # 3D 场景组件（ShoeScene, ShoeModel）
│   │   └── panel/       # 面板组件（ColorPicker, MaterialPicker）
│   ├── store/           # Zustand 状态管理
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具函数（包含节点层次结构解析）
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

### v1.1.3 (2026-08-04) - Bug修复、性能优化、代码清理与功能补全
- **修复撤销/重做**：重写historyStore的undo/redo逻辑，修复redo完全失效的根本性bug
- **修复高清截图**：新增renderer级真2x分辨率截图，替代之前的像素拉伸方案
- **修复GPU内存泄漏**：贴图替换/移除时调用texture.dispose()释放GPU资源
- **修复部件列表**：11种材质名称全部正确显示（之前缺失5种）
- **修复UI组件**：btn-loading spinner不可见、deleteDesign缺少错误处理、resetPart硬编码材质类型
- **性能优化**：自动保存500ms防抖、贴图滑块50ms节流、材质应用增量更新、TextureLoader单例化
- **代码清理**：删除4个死代码文件，提取3个组件的内联CSS到独立样式文件
- **移动端完善**：BottomBar完整实现颜色选择和材质选择功能
- **贴图上传**：添加5MB文件大小限制和读取错误处理
- **方案导入**：添加JSON结构校验，防止损坏数据污染状态

### v1.1.2 (2026-07-30) - 简化界面与代码优化
- **删除EmptyState页面**：页面打开后直接显示初始模型
- **消除全局变量**：使用Zustand store替代window.__partMeshMap
- **添加ErrorBoundary**：防止3D渲染异常导致白屏
- **添加输入防抖**：颜色选择器添加150ms debounce，减少性能抖动
- **补充关键注释**：为materialPresets.ts添加PBR参数说明
- **统一错误提示**：使用Toast替代alert()
- **一键白膜修复**：区分一键白膜和修改颜色/材质，确保一键白膜清除贴图

### v1.1.1 (2026-07-30) - 一键白膜与恢复原始功能修复
- **一键白膜修复**：修复一键白膜功能，确保清除所有贴图显示纯白色
- **恢复原始修复**：修复恢复原始功能，确保恢复原模型的材质、贴图、颜色
- **材质独立**：深拷贝贴图，确保原始材质的贴图是独立的

### v1.1.0 (2026-07-30) - 独立调整贴图与恢复原始颜色
- **独立调整贴图**：修复同一贴图在不同部件上不能独立调整的问题
- **恢复原始颜色**：修复恢复原始时颜色不正确的问题
- **设计管理保存**：修复设计管理保存功能
- **性能优化**：移除贴图缓存，为每个部件创建独立的贴图对象

### v0.x (2026-07-17 ~ 2026-07-29) - 早期开发版本
- v1.0.9: 原始材质保留与恢复
- v1.0.8: 原色和原料功能
- v1.0.7: 白模模式
- v1.0.6: 贴图系统
- v1.0.5: Rhino图层部件选择修复
- v1.0.4: 视觉优化与材质调整
- v1.0.3: 转左/转右旋转逻辑优化
- v1.0.2: 视角优化完善
- v1.0.1: 视角交互优化
- v1.0.0: 初始版本发布
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
