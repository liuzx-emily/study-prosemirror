# study-prosemirror-demo

## 创建项目

### 初始化项目

`pnpm create vite`

framework 选择 `Vue`，variant 选择 `JavaScript`

### 安装依赖

- 安装 scss：`pnpm install sass`

- 安装 pm 包：`pnpm install prosemirror-commands prosemirror-example-setup prosemirror-history prosemirror-keymap prosemirror-model prosemirror-schema-basic prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view`

### 安装 ui library

`pnpm i ant-design-vue`

`pnpm i unplugin-vue-components -D`

在 vite.config.js 中配置 [自动按需引入组件](https://antdv.com/docs/vue/introduce-cn#%E8%87%AA%E5%8A%A8%E6%8C%89%E9%9C%80%E5%BC%95%E5%85%A5%E7%BB%84%E4%BB%B6)

### 配置 eslint

`npm init @eslint/config`

### 启动项目

`pnpm dev`

---

## 新建 editor

1. 创建 schema
2. 由 schema 创建 state（放在 onMounted 中）
   如果 editor
3. 由 state 创建 view（放在 onMounted 中）

### style

prosemirror 没有内置任何样式，一些必要的 css 需要自己添加。比如：

```css
.ProseMirror-hideselection *::selection {
  background: transparent;
}
.ProseMirror-selectednode {
  outline: 2px solid #8cf;
}
```

可以参考 prosemirror 官方 example 里的 editor.css，直接用或者在它的基础上修改。

### vue3 中 editorView 不能用 ref()

```js
const editorView = ref();
editorView.value = new EditorView(..)
// 报错
command_1(editorView.value.state, editorView.value.dispatch);
```

执行命令时会报错 `Uncaught RangeError: Applying a mismatched transaction`

应该改用 `shallowRef`

```js
const editorView = shallowRef();
```

---

## 创建 emoji node

emoji 有两个属性：type 和 state

### parseDom

`parseDom` 是 `ParseRule` 构成的数组。每条 `ParseRule` 中必须包含 `tag` 或 `style` 字段，二选一。

#### tag

tag 的值是 css 选择器，`span`或者`span[aaa="bbb"]`等都可以。

#### getAttrs

`getAttrs` 有两个作用：

- 作为一个更灵活的 filter，控制哪些情况 match，哪些情况不 match。有的时候情况比较复杂，仅用 tag 或者 style 时很难描述清，这时就要用 getAttrs 了。
- 设置 attrs

`getAttrs` 返回值：

- 返回 false，说明不匹配。
- 返回对象，说明匹配，对象的内容就是 attrs 的属性值。
- 返回 null 或 undefined，则等同于返回空对象，说明匹配，但是不设置属性值

### toDom

#### 元素嵌套的写法：`span>img`

1. 写法 1：描述性

   ```js
   return ["span", { "emoji-type": type, "emoji-state": state }, ["img", { src: urlMap[type] }]];
   ```

2. 写法 2：手动创建 dom 元素

   ```js
   const outerSpan = document.createElement("span");
   outerSpan.setAttribute("emoji-type", type);
   outerSpan.setAttribute("emoji-state", state);
   const img = document.createElement("img");
   img.setAttribute("src", urlMap[type]);
   outerSpan.appendChild(img);
   return outerSpan;
   ```

3. 写法 3：描述性+手动创建结合起来

   ```js
   const img = document.createElement("img");
   img.setAttribute("src", urlMap[type]);
   return ["span", { "emoji-type": type, "emoji-state": state }, img];
   ```

#### 给元素设置文本内容

1. 写法 1 ：用 ::before 的 content
2. 写法 2 ：在 toDom 中自己创建 dom 元素，设置 innerHTML

---

## 添加 command 切换 emoji 状态

command 格式：`function(state,dispatch)`

### 修改节点 attrs

不能直接 `node.attrs.a=1`，这样只会更新数据，视图不会变。

用 setNodeAttribute 修改节点属性。

```js
const tr = state.tr.setNodeAttribute(...);
dispatch(tr);
```

### 使用 Plugin 的 view 属性去实时更新菜单按钮状态

### 按钮点击事件用 @mousedown.prevent

点击 menu button 时，不想丢失 editor 的 focus 状态，需要用 mousedown.prevent 代替 click

---

## 高亮 emoji

使用 `decorations` 给 emoji 添加 `class:'highlight'`

### 切换是否高亮

plugin 中需要存储数据，记录是否高亮 —— 用 plugin 的 `state` 字段。

在 decorations 中可以获取到 state 的值。如果是 true，就高亮。是 false，就不高亮。

点击按钮“切换高亮”时，需要修改 state 的值。但是不要在外部直接修改，应该发消息给 plugin。让 plugin 内部自己修改 state 的值 —— 外部通过 `tr.setMeta(plugin,meta值)` 发消息。plugin 在 state - apply(tr) 中通过 `tr.getMeta(plugin)` 接受到 meta 值，并相应的去修改 state 数据。

---

## 常规文本编辑功能

### 加粗

点击按钮：用 `prosemirror-commands` 包中的 `toggleMark`
按钮是否 active，参考 @tiptap/core 的 `isMarkActive` 方法

下面的是 prosemirror 提供的方法，因为和想要的效果不符，本项目中现在不再使用了：

```js
// 具体说明看源码，里面有详细的注释举例
function checkMarkActive(state, markType) {
  let { from, $from, to, empty } = state.selection;
  if (empty) {
    // 选区为空时，按钮的 active 状态代表：如果在光标位置输入文字，文字是否有该mark
    //  state.storedMarks 是针对下一次输入的特殊设定。$from.marks() 是周围环境的设定。
    return !!markType.isInSet(state.storedMarks || $from.marks());
  }
  // 选区有内容时，按钮的 active 状态代表：选区内是否有该mark。用 rangeHasMark
  return state.doc.rangeHasMark(from, to, markType);
}
```

### 标题、段落

点击按钮：用 `prosemirror-commands` 包中的 `setBlockType`

按钮是否 active，参考 @tiptap/core 的 `isNodeActive` 方法

下面的是 prosemirror 提供的方法，因为和想要的效果不符，本项目中现在不再使用了：

```js
// 具体说明看源码，里面有详细的注释举例
function checkNodeActive(state, nodeType, attrs) {
  const { to, $from, node } = state.selection;
  if (node) {
    return node.hasMarkup(nodeType, attrs);
  }
  // to<=$from.end()，说明选区在同一个非文本 node 中（比如同一个段落、同一个heading）
  return to <= $from.end() && $from.parent.hasMarkup(nodeType, attrs);
}
```

---

## word 列表

schema 中 定义 nodes 的顺序很重要，决定匹配 dom 时的优先级。

在视图变化时，去修改列表的序号和缩进，应该用 decorations。不能用 view-update，它不能用来修改编辑器内容。

具体内容看 blog

---

## link

看 blog

### 判断 pos 所在位置是不是 link

`!linkMarkType.isInSet($pos.marks()`

### 若 pos 所在位置是一个 TextNode，获取 TextNode 的起始位置和结束位置：

```js
// 当 $pos 在文本节点中时，$pos.textOffset =  $pos.pos - 文本节点起始位置。所以文本节点起始位置 = $pos.pos - $pos.textOffset
const start = pos - $pos.textOffset;
const linkNode = state.doc.nodeAt(pos); // // $pos.node 不能找 TextNode。要用 nodeAt
// const linkNode = $pos.parent.maybeChild($pos.index()); // 这样也可以找到 TextNode
const end = start + linkNode.nodeSize;
```

---
