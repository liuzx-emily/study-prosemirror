# study-prosemirror-demo

## 创建项目

### 初始化项目

`pnpm create vite`

framework 选择 `Vue`，variant 选择 `JavaScript`

### 安装依赖

- 安装 scss：`pnpm install sass`

- 安装 pm 包：`pnpm install prosemirror-commands prosemirror-example-setup prosemirror-history prosemirror-keymap prosemirror-model prosemirror-schema-basic prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view`

### 配置 eslint

`npm init @eslint/config`

### 启动项目

`pnpm dev`

---

## 新建 editor

1. 创建 schema
2. 由 schema 创建 state（放在 onMounted 中）
3. 由 state 创建 view（放在 onMounted 中）
