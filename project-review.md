---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 128ac332802a26b8e88630c8f2a435c9_9f2e2c7b8bbb11f1a642525400287e28
    ReservedCode1: YwzC1+PEjgYm0TRmPCsFFGr2IbKkuLIR3RgZqfv+S5pS6cqGZK/2cntmxEBukRb1U4UMqjYkfoC/bD+I6FZ+Ud7xeJ8ViUmL7ua1Y7WTutLmx8nZLoPhYAwl20Sy6K3b+/B//KMdf5iKnGjFvePlNe2xtxOmL1RUGTvn0g+xSaQnabRgzwCIQMYFIRo=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 128ac332802a26b8e88630c8f2a435c9_9f2e2c7b8bbb11f1a642525400287e28
    ReservedCode2: YwzC1+PEjgYm0TRmPCsFFGr2IbKkuLIR3RgZqfv+S5pS6cqGZK/2cntmxEBukRb1U4UMqjYkfoC/bD+I6FZ+Ud7xeJ8ViUmL7ua1Y7WTutLmx8nZLoPhYAwl20Sy6K3b+/B//KMdf5iKnGjFvePlNe2xtxOmL1RUGTvn0g+xSaQnabRgzwCIQMYFIRo=
---

# Shoe-Forge 项目代码评审报告

> 评审日期：2026-07-30  
> 项目路径：`D:\Project-AI Creator\SHOE-CREATOR\shoe-forge`  
> 评审范围：全量源代码（src/）、配置文件、资源目录

---

## 一、项目概览

**shoe-forge** 是一个基于 Web 的 3D 球鞋可视化定制工具，用户可加载 GLTF/GLB 模型，对鞋的各个部件进行颜色、材质、贴图的实时调整，支持方案管理、截图导出、撤销/重做、本地持久化等功能。

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| 框架 | React | 19.x |
| 语言 | TypeScript | 6.x |
| 3D 引擎 | Three.js (via R3F) | 0.185 |
| React 3D 绑定 | @react-three/fiber | 9.x |
| 辅助工具 | @react-three/drei | 10.x |
| 状态管理 | Zustand | 5.x |
| 样式方案 | Tailwind CSS + 自定义 Design Tokens | 4.x |
| 构建工具 | Vite | 8.x |

### 目录结构

```
shoe-forge/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.ts
├── .eslintrc.cjs
├── .gitignore
├── README.md
├── PROJECT_SUMMARY.md
├── DEVELOPMENT_SUMMARY.md
├── public/
│   └── models/
│       └── shoe.glb                    # 默认鞋模型
└── src/
    ├── main.tsx                         # 入口
    ├── App.tsx                          # 根组件
    ├── index.css                        # 全局样式
    ├── types/
    │   └── index.ts                     # 类型定义、常量
    ├── store/
    │   ├── customizationStore.ts        # 部件定制状态
    │   ├── modelStore.ts                # 模型加载状态
    │   ├── historyStore.ts              # 撤销/重做历史
    │   └── uiStore.ts                   # UI 交互状态
    ├── hooks/
    │   ├── useAutoSave.ts               # 自动保存/加载
    │   └── useKeyboardShortcuts.ts      # 键盘快捷键
    ├── lib/
    │   ├── modelLoader.ts               # GLB 元数据提取
    │   ├── materialPresets.ts           # PBR 材质创建
    │   ├── screenshot.ts                # 截图功能
    │   └── storage.ts                   # localStorage 封装
    ├── styles/
    │   ├── tokens.css                   # 设计令牌（CSS 变量）
    │   └── components.css               # 通用组件样式
    ├── components/
    │   ├── Toast.tsx                    # Toast 通知
    │   ├── layout/
    │   │   ├── MainLayout.tsx           # 响应式三栏布局
    │   │   ├── TopBar.tsx               # 顶栏（上传/白膜/管理）
    │   │   ├── Sidebar.tsx              # 侧边栏容器
    │   │   └── BottomBar.tsx            # 移动端底部面板（未完成）
    │   ├── scene/
    │   │   ├── ShoeScene.tsx            # 3D 场景（Canvas + 灯光）
    │   │   ├── ShoeModel.tsx            # 模型加载与部件识别
    │   │   ├── CameraController.tsx     # 预设视角 + 旋转动画
    │   │   ├── CameraPresets.tsx        # 视角按钮 UI + 截图
    │   │   ├── LoadingOverlay.tsx       # 加载遮罩
    │   │   └── ModelSelector.tsx        # 模型选择/上传
    │   └── panel/
    │       ├── CustomizationPanel.tsx   # 定制面板（颜色/材质/贴图）
    │       ├── PartListPanel.tsx        # 部件列表
    │       ├── ColorPicker.tsx          # 颜色选择器
    │       ├── MaterialPicker.tsx       # 材质选择器
    │       ├── TextureUploader.tsx      # 贴图上传
    │       └── TextureTransformControls.tsx  # 贴图变换控件
```

---

## 二、各维度评价

### 2.1 代码质量

**总体评价：中等偏上（7/10）**

**优点：**

- **TypeScript 使用到位**：定义了品牌类型 `PartId`、完整的接口体系（`PartConfig`、`TextureConfig`、`DesignPreset` 等），类型安全性较好。
- **命名规范统一**：Zustand store 使用 `useXxxStore`，组件使用 PascalCase，函数使用 camelCase，CSS 类使用 BEM 风格前缀 `sf-`。
- **组件职责划分清晰**：`ShoeScene` 只管场景搭建，`ShoeModel` 只管模型加载与部件识别，`CameraController` 只管相机逻辑——符合单一职责原则。
- **内联样式与逻辑内聚**：每个组件末尾使用 `<style>` 标签内联组件级 CSS，避免了样式与逻辑分离导致的维护困难。

**不足：**

- **注释不足**：核心逻辑如 `materialPresets.ts` 中的 PBR 材质参数（`roughness`、`metalness` 的具体含义和取值逻辑）缺乏注释说明，维护者需要深入 Three.js 文档才能理解。
- **内联 CSS 方案存在隐患**：组件内 `<style>` 标签虽然内聚性好，但在 React 严格模式下可能被插入两次（实际行为取决于 React 版本），且无法利用 PostCSS/Tailwind 的编译优化。大量 CSS 内联在 JSX 中也降低了可读性。
- **PartListPanel 中硬编码中文映射**：材质类型的中文显示在 JSX 中直接写 `{config.materialType === 'leather' && '皮革'}` 这样的大段条件链，而 `types/index.ts` 已有 `MATERIAL_NAMES` 常量，应复用而非重复。

```tsx
// PartListPanel.tsx 当前写法（应改为使用 MATERIAL_NAMES 常量）
<span className="part-item-material">
  {config.materialType === 'leather' && '皮革'}
  {config.materialType === 'mesh' && '网面'}
  {/* ... 共 6 个条件 */}
</span>

// 建议写法
<span className="part-item-material">{MATERIAL_NAMES[config.materialType]}</span>
```

### 2.2 架构设计

**总体评价：良好（7.5/10）**

**优点：**

- **状态管理分层合理**：`customizationStore`（部件配置） + `modelStore`（模型元数据） + `historyStore`（撤销重做） + `uiStore`（交互状态），四个 store 职责明确、互不重叠。
- **数据流单向清晰**：`Store → Component → Action → Store` 的 Zustand 单向数据流，避免了 props drilling。
- **依赖注入思想**：`materialPresets.ts` 作为独立的材质工厂函数，不依赖任何 React 上下文，可单独测试。
- **Vite 分包策略合理**：将 Three.js 和 R3F 拆分为独立 chunk，利用浏览器缓存优化加载性能。
- **设计系统体系完善**：`tokens.css` 定义了完整的颜色、间距、字体、阴影、动画、z-index 体系，且预留了暗色模式扩展点。

**不足：**

- **全局变量污染**：`ShoeModel.tsx` 将部件 Mesh 映射存储在 `window.__partMeshMap`，这是一个反模式：

```typescript
// ShoeModel.tsx 当前写法
(window as any).__partMeshMap = partMeshMap;
```

  这不仅绕过了 TypeScript 类型检查，还在 React 并发模式下存在竞态条件。应改为 Zustand store 或 React Context。

- **ModelSelector 样式体系不一致**：该组件使用 Tailwind 原子类（`bg-white`、`rounded-lg`、`space-y-1`），而其他 90% 组件使用自定义 CSS 变量 + 内联 `<style>`。两种体系混用降低了可维护性。
- **Tailwind 配置与 CSS Token 存在漂移**：`tailwind.config.ts` 定义了 `primary.text: '#111111'` 等颜色，但 `tokens.css` 使用 `--sf-text-primary: #111111`。两套体系各自维护，长期来看可能出现不一致。

### 2.3 功能完整性

**总体评价：中等（6.5/10）**

**已完成功能（可用且稳定）：**

| 功能 | 状态 | 说明 |
|------|------|------|
| 3D 模型加载 | ✅ 完成 | 支持 GLB/GLTF，50MB 上限校验 |
| 部件选择 | ✅ 完成 | 列表点击 + 3D 射线拾取双通道 |
| 颜色定制 | ✅ 完成 | 预设色板 + 自定义取色器 + Hex 输入 |
| 材质切换 | ✅ 完成 | 11 种材质，含 PBR 参数实时预览 |
| 贴图上传/变换 | ✅ 完成 | 支持上传 + 缩放/旋转/位移控制 |
| 多视角切换 | ✅ 完成 | 四向 + 顶底 + 自由视角，lerp 动画 |
| 白膜模式 | ✅ 完成 | 一键切换线框预览 |
| 恢复原始 | ✅ 完成 | 按部件或全局恢复 |
| 方案管理 | ✅ 完成 | 保存/加载/删除设计预设 |
| 截图导出 | ✅ 完成 | Canvas → PNG 下载 |
| 撤销/重做 | ⚠️ 部分 | Ctrl+Z/Y 快捷键已注册，但逻辑有缺陷 |
| 自动保存 | ✅ 完成 | localStorage 持久化 |
| 移动端适配 | ⚠️ 部分 | BottomBar 仅占位，颜色/材质标签无实际内容 |

**已知缺陷：**

1. **撤销/重做逻辑不完整**：`historyStore.ts` 的 `undo` 函数中有明确的技术债务标记：

```typescript
// 当前状态应从 customizationStore 获取，而不是从 history 中取
// 因为 history 中存储的是上一次 push 时的状态
// 暂时先这样实现
```

  这意味着撤销操作可能恢复到错误的快照。`historyStore` 的 `undo` 直接从内部数组弹出状态，但 `customizationStore` 的当前状态可能与历史栈不同步。

2. **BottomBar 是空壳**：移动端体验不完整，颜色和材质 Tab 只有占位文本。

3. **无模型导出功能**：用户只能截图，无法导出修改后的 GLB 模型文件（对于 3D 定制工具这是核心期望功能之一）。

### 2.4 健壮性

**总体评价：中等偏下（5.5/10）**

**优点：**

- **模型加载基础校验**：`ModelSelector.tsx` 对文件类型（`.glb`/`.gltf`）和大小（50MB）做了前端校验。
- **store 中存在性检查**：`customizationStore` 的 `updatePartColor` 等函数会检查 `partConfigs` 中是否存在对应 key，避免空指针。
- **操作幂等性**：`ModelSelector.handleModelSelect` 对同一模型重复点击做了提前返回。

**不足：**

- **零 React ErrorBoundary**：项目中没有定义任何错误边界。如果 `ShoeModel` 中的 GLTF 加载抛出异常（如模型格式损坏），整个应用会白屏。

- **原始 `alert()` 用于错误提示**：`ModelSelector.tsx` 使用 `alert('请选择 .glb 或 .gltf 格式的文件')` 处理校验失败，而项目已有完善的 `Toast` 组件——应统一使用 Toast。

- **无加载失败状态处理**：`ShoeScene` 中 `useGLTF` 加载失败时没有 `.catch()` 或 Suspense 的 fallback，用户看到的是空白场景而没有任何错误信息。

- **useAutoSave 初始化竞态**：组件挂载时，`useAutoSave` 的第一个 `useEffect` 调用 `importPreset` 恢复保存的状态，但此时模型可能尚未加载完成（`ShoeModel` 的异步 `useGLTF` 可能还在进行中）。如果 `importPreset` 的 `parts` 与模型实际部件不匹配，可能导致部分配置静默丢失。

- **Toast 模块级变量违反 React 模式**：`toastId` 和 `addToastFn` 作为模块级变量，在 React 并发渲染（StrictMode 双次调用 useEffect）或热更新（HMR）时可能产生不可预期的行为。应使用 `useRef` 或 Zustand store。

- **CameraController 无卸载清理**：`requestAnimationFrame` 循环中没有检查组件是否已卸载（`isMounted` 标记），如果用户快速切换页面，动画回调可能操作已销毁的场景对象。

- **无输入防抖**：`ColorPicker` 的 Hex 输入每输入一个字符就触发 `onColorChange` → 更新 store → 触发 Three.js 材质重建，频繁操作时可能造成性能抖动。建议加 debounce（~150ms）。

### 2.5 配置与依赖管理

**总体评价：良好（8/10）**

**优点：**

- **依赖精简**：仅 7 个运行时依赖（react、react-dom、three、@react-three/fiber、@react-three/drei、zustand、uuid），无冗余库。
- **TypeScript 严格模式启用**：`strict: true`、`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch` 全开，代码质量有保障。
- **Vite 配置合理**：路径别名 `@/`、依赖预构建优化、生产构建分 chunk，均为最佳实践。
- **`.gitignore` 完善**：覆盖 `node_modules/`、`dist/`、`.env` 及各类本地文件。

**不足：**

- **缺少 Prettier 配置**：仅 `.eslintrc.cjs` 而无 `.prettierrc`，代码风格一致性依赖开发者自觉。
- **无 pre-commit hooks**：缺少 `husky` + `lint-staged`，无法在提交时自动格式化和 lint。
- **无测试框架**：`package.json` 中无任何测试相关依赖（vitest、jest、@testing-library 等），也没有 test scripts。
- **ESLint 配置为 CommonJS (.cjs)**：项目中其他配置文件均为 ESM (`.ts`)，风格不统一。

---

## 三、后续更新方向建议

按优先级分为高/中/低三级。

### 高优先级

#### 1. 修复撤销/重做逻辑

- **目标**：确保 Ctrl+Z / Ctrl+Y 的行为正确且与 customizationStore 状态同步。
- **问题根因**：`historyStore.undo()` 从内部历史栈弹出快照直接返回，但调用方需要将该快照应用回 `customizationStore`。当前 `customizationStore` 的 `undo`/`redo` 方法调用了 `historyStore` 却没有正确地将结果写回 `partConfigs`。
- **建议方案**：
  ```
  1. historyStore 的 undo 返回快照数据，不直接修改 customizationStore
  2. customizationStore.undo 调用 historyStore.undo() 获取快照
  3. 用快照中的 Map 替换当前 partConfigs
  4. 写入单元测试覆盖撤销→重做→恢复一致的完整路径
  ```

#### 2. 添加 React ErrorBoundary

- **目标**：防止 3D 渲染异常导致整个应用白屏。
- **建议方案**：
  ```tsx
  // src/components/ErrorBoundary.tsx
  // 包裹 <ShoeScene />，catch 后显示"3D 场景加载失败"并提供重试按钮
  // 区分开发/生产环境：开发环境显示错误堆栈，生产环境显示友好提示
  ```

#### 3. 消除 window.__partMeshMap 全局变量

- **目标**：将部件 Mesh 映射从全局变量迁移到 Zustand store。
- **建议方案**：
  ```
  1. 在 modelStore 或新 store 中添加 partMeshMap: Map<PartId, THREE.Mesh>
  2. ShoeModel 加载完成后调用 store.setPartMeshMap(...)
  3. materialPresets.ts 的 applyMaterialToPart 从 store 读取而非 window
  4. 同时为 window.__partMeshMap 添加 @deprecated 注释，逐步迁移调用方
  ```

### 中优先级

#### 4. 完成移动端 BottomBar

- **目标**：移动端提供与桌面端一致的定制体验。
- **建议方案**：复用 `ColorPicker` 和 `MaterialPicker` 组件，在 BottomBar 中以抽屉/浮层形式呈现，适配触屏操作（触摸区域 ≥44px）。

#### 5. 统一样式方案

- **目标**：消除 Tailwind 原子类与自定义 CSS Token 混用的问题。
- **建议方案**：
  ```
  方案 A（推荐）：全量迁移到 CSS Token 体系。移除 ModelSelector 等组件中的 Tailwind 原子类，
               统一使用 tokens.css 中的变量和内联 <style>。
  方案 B：全量迁移到 Tailwind。在 tailwind.config.ts 的 theme.extend 中映射 tokens.css
          的变量，让 Tailwind 类名（如 bg-sf-primary）可用。移除大部分内联 <style>。
  ```

#### 6. 添加输入防抖

- **目标**：减少高频操作（颜色滑动、Hex 输入）导致的 Three.js 材质重建。
- **建议方案**：在 `ColorPicker` 的 `handleHexInputChange` 和 `handleCustomColorChange` 中增加 150ms debounce。

#### 7. 统一错误提示方式

- **目标**：所有用户可见的错误/提示使用 Toast 组件，不再使用原生 `alert()`。
- **涉及文件**：`ModelSelector.tsx`、`TopBar.tsx`（如果有）、模型加载失败场景。

#### 8. 补充关键注释与文档

- **目标**：降低后续维护者的理解成本。
- **涉及内容**：
  - `materialPresets.ts` 中每个材质类型的 PBR 参数说明
  - `historyStore.ts` 的撤销逻辑数据流图
  - `CameraController.tsx` 中 step 状态机的转换规则
  - `PROJECT_SUMMARY.md` 和 `DEVELOPMENT_SUMMARY.md` 建议合并且翻译为英文版本

### 低优先级

#### 9. 模型导出功能

- **目标**：支持将定制后的模型导出为 GLB 文件。
- **建议方案**：使用 Three.js 的 `GLTFExporter`，在导出前遍历所有 Mesh 将当前材质"烘焙"到导出的 GLB 中。

#### 10. 暗色模式支持

- **目标**：`tokens.css` 已预留 `@media (prefers-color-scheme: dark)` 扩展点，补充暗色模式的颜色 Token。
- **建议方案**：定义暗色模式的颜色映射，提供手动切换开关。

#### 11. 添加单元测试与 E2E 测试

- **目标**：保障核心逻辑的回归稳定性。
- **建议方案**：
  ```
  单元测试（vitest）：覆盖 customizationStore、historyStore、materialPresets、modelLoader
  E2E 测试（Playwright）：覆盖模型加载→选择部件→修改颜色→撤销→截图 的完整用户流程
  ```

#### 12. 引入 CI/CD 质量门禁

- **目标**：自动化代码质量检查。
- **建议方案**：
  ```
  - 添加 husky + lint-staged：提交前自动 eslint + prettier
  - 添加 GitHub Actions / 内部 CI：PR 时自动 typecheck + lint + test
  ```

#### 13. CameraController 卸载清理

- **目标**：防止组件卸载后 `requestAnimationFrame` 继续执行。
- **建议方案**：添加 `isMountedRef`，在 cleanup 中置为 false，动画循环开头检查。

---

## 四、总结

| 维度 | 评分 | 关键词 |
|------|------|--------|
| 代码质量 | 7/10 | 命名规范好、类型安全，但注释不足、PartListPanel 有冗余硬编码 |
| 架构设计 | 7.5/10 | Store 分层清晰、数据流单向，但存在全局变量污染和样式体系不一致 |
| 功能完整性 | 6.5/10 | 核心定制功能完善，但撤销逻辑有缺陷、移动端未完成、缺少模型导出 |
| 健壮性 | 5.5/10 | 缺少 ErrorBoundary、竞态条件、无加载失败处理、Toast 实现不规范 |
| 配置管理 | 8/10 | 依赖精简、TS 严格模式、Vite 配置合理，但缺测试框架和 CI 门禁 |

**总体结论**：shoe-forge 是一个架构思路清晰、技术选型现代化的 3D 定制工具原型。核心的"加载模型 → 选择部件 → 调整外观 → 导出方案"闭环已经跑通，UI 设计系统也具备不错的完成度。当前的主要短板集中在**错误处理缺失**、**撤销逻辑的技术债务**以及**样式体系不一致**三个方面。建议优先解决高优先级的 3 个问题（撤销修复、ErrorBoundary、全局变量消除），然后再推进移动端适配和样式统一。

---

*评审人：File Agent | 评审工具链：read_text × 18 + shell_executor × 1*
*（内容由AI生成，仅供参考）*
