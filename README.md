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
