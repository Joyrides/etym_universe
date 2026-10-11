# 词源宇宙 · Etymology Universe

在宇宙中画出一个词的历史轨迹：以力导向图的方式可视化英语单词之间的词源关系（多对多），
选中一个单词后点亮它与词源的路径，其余节点变暗，通过发光程度、节点大小、轨道距离、连线粗细表达关系强度。

## 功能

- **星图可视化**：基于 `react-force-graph-2d` 的交互式力导向图，可拖拽、缩放
- **双向词源索引**：一个单词有多个词源，一个词源属于多个单词（Word ↔ Etymon 多对多）
- **路径高亮**：选中单词 / 词源后，相关节点发光，无关节点变暗，粒子沿路径流动
- **搜索**：通过搜索栏快速定位单词或词源
- **详情面板**：查看选中项的释义、类型与关联关系
- **节点分类着色**：单词（青蓝）、词根（金黄）、前缀（紫）、后缀（绿）

## 技术栈

| 技术 | 用途 |
| --- | --- |
| [React 18](https://react.dev/) | UI 框架 |
| [TypeScript 5](https://www.typescriptlang.org/) | 类型系统 |
| [Vite 5](https://vitejs.dev/) | 开发服务器 / 构建工具 |
| [react-force-graph-2d](https://github.com/vasturiano/react-force-graph) | 力导向图渲染 |

## 环境要求

- **Node.js ≥ 18**（Vite 5 要求）
- npm（随 Node.js 附带）

## 快速开始

```bash
# 1. 安装依赖（首次运行需要；若 node_modules 已存在可跳过）
npm install

# 2. 启动开发服务器
npm run dev
```

启动后终端会输出本地地址（默认为 **http://localhost:5173**），在浏览器中打开即可。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（带热更新） |
| `npm run build` | 类型检查（`tsc -b`）并构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建产物（默认 http://localhost:4173） |

## 项目结构

```
etym_universe/
├── index.html                  # 入口 HTML
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── 项目需求文档.txt             # 设计需求与数据模型说明
└── src/
    ├── main.tsx                # 应用入口，挂载 React
    ├── App.tsx                 # 根组件：搜索栏 + 星图 + 详情面板
    ├── data/
    │   ├── types.ts            # 数据模型：Word / Etymon / WordEtymon
    │   └── seed.ts             # ★ 示例数据（在这里添加单词和词源）
    ├── lib/
    │   └── graph.ts            # 数据 → 图结构转换 + 高亮路径计算
    ├── components/
    │   ├── Universe.tsx        # 力导向图（星图）渲染
    │   ├── SearchBar.tsx       # 搜索栏
    │   └── DetailPanel.tsx     # 详情面板
    └── styles/
        └── universe.css        # 全局样式（星空主题）
```

## 数据模型

数据采用三张"表"的多对多关系（当前为前端静态数据，后续可替换为数据库/接口）：

```
Word（单词） ←── wordEtymons（关联表） ──→ Etymon（词源）
  一个词 → 多个词源                一个词源 → 多个单词
```

- **Word**：用户实际学习的英语单词，如 `educate`、`conductor`
- **Etymon**：词源节点，类型为 `root`（词根）/ `prefix`（前缀）/ `suffix`（后缀），如 `*deuk-`、`ex-`
- **WordEtymon**：关联关系，含 `weight`（关系强度 1~5），驱动连线粗细、距离与发光

### 如何添加数据

编辑 `src/data/seed.ts`：

```ts
export const seedData: EtymologyData = {
  words: [
    { id: 9, form: 'produce', meaning: '生产' },   // 1. 加单词（id 唯一）
  ],
  etymons: [
    { id: 18, form: '*pre-', type: 'root', meaning: '向前' },  // 2. 加词源（id 唯一）
  ],
  wordEtymons: [
    { wordId: 9, etymonId: 18, weight: 3 },       // 3. 建立关联（weight 1~5）
  ],
}
```

> 注意：`wordEtymons` 中引用的 id 必须已存在于 `words` / `etymons`，否则该关系会被忽略。
> 保存后开发服务器会热更新，无需重启。
