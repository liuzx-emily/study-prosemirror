<template>
  <section id="content" style="display: none">
    <p>123<strong>456</strong>789你好。abc</p>
    <h1>Conversation</h1>
    <p>小明：你好。你<span style="font-weight: bold">喜欢</span>吃什么水果？</p>
    <p>小红：我喜欢 <span emoji-type="apple"></span>和<span emoji-type="banana"></span>。你呢？</p>
    <p>
      小明：我喜欢吃 <span emoji-type="pear"></span>、
      <span emoji-type="watermelon" emoji-state="text"></span>
    </p>
    <h1>word列表</h1>
    <p list-id="1" list-item-level="0">你好。美国宇航局的科学家们</p>
    <p list-id="1" list-item-level="1">首次掌握了天王星上有极地气旋的有力证据。</p>
    <p list-id="1" list-item-level="1">通过检查从这个冰雪巨人身上发出的无线电波，</p>
    <p list-id="1" list-item-level="0">他们在这个星球的北极检测到了这种现象。</p>
    <p list-id="1" list-item-level="5">这些发现证实了：<strong>（证实了什么呢？）</strong></p>
    <p>无论这些行星主要由岩石还是气体组成，</p>
    <p list-id="1" list-item-level="0">它们的大气层在两极都有漩涡的迹象。</p>
    <p list-id="1" list-item-level="1">科学家们利用微波观测发现了天王星上的第一个极地气旋，</p>
    <p list-id="1" list-item-level="1">在这里看到的是天王星每张图片中中心右侧的一个浅色的点。</p>
    <p list-id="1" list-item-level="5">这些图像使用的是波长为K、Ka和Q的波段，</p>
    <h1>link</h1>
    <p>
      123<a href="http://www.baidu.com">AAAAAAA</a>123。你好啊，吃了吗？去<a
        href="http://www.abc.com"
        >食堂</a
      >吗？
    </p>
    <p>222<a href="http://www.bing.com">BBB</a>你好，222</p>
  </section>
  <EditorMenu @insert-link="insertLink" />
  <Search ref="SearchRef" />
  <section id="editor">
    <LinkHoverToolbar ref="LinkHoverToolbarRef" @edit-link="hoverToolbarCallEditLink" />
    <LinkSettingsPanel ref="LinkSettingsPanelRef" />
  </section>
</template>

<script setup>
import { exampleSetup } from "prosemirror-example-setup";
import { keymap } from "prosemirror-keymap";
import { DOMParser } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { onMounted, provide, ref, shallowRef } from "vue";
import "../assets/editor.css";
import { liftWordListItem, sinkWordListItem } from "./command";
import LinkHoverToolbar from "./components/Link/LinkHoverToolbar.vue";
import LinkSettingsPanel from "./components/Link/LinkSettingsPanel.vue";
import EditorMenu from "./components/Menu/EditorMenu.vue";
import Search from "./components/Search/Search.vue";
import { plugin_highlightEmoji } from "./plugin/plugin-highlightEmoji";
import { usePlugin_linkHoverToolbar } from "./plugin/plugin-linkHoverToolbar";
import { plugin_menuButtonState } from "./plugin/plugin-menuButtonState";
import {
  activeIndex,
  count,
  find,
  findNext,
  findPrev,
  plugin_search,
  replace,
  replaceAll,
  reset,
} from "./plugin/plugin-search";
import { plugin_wordListNumber } from "./plugin/plugin-wordListNumber";
import schema from "./schema"; // step1 创建schema

const editorView = shallowRef(); // vue3中必须用shallowRef。如果用ref，会报错 Applying a mismatched transaction
provide("editorView", editorView);

// link
const LinkHoverToolbarRef = ref();
const LinkSettingsPanelRef = ref();
const plugin_linkHoverToolbar = usePlugin_linkHoverToolbar(
  LinkHoverToolbarRef,
  LinkSettingsPanelRef
);
function hoverToolbarCallEditLink({ left, top, text, link, from, to }) {
  LinkSettingsPanelRef.value.showSettingsPanel({
    left,
    top,
    text,
    link,
    from,
    to,
  });
}
function insertLink() {
  const state = editorView.value.state;
  const { from, to } = state.selection;
  const { left, top } = editorView.value.coordsAtPos(from);
  const selectionFragment = state.doc.cut(from, to);
  LinkSettingsPanelRef.value.showSettingsPanel({
    left: left - 10,
    top: top - 10,
    text: selectionFragment.textContent,
    link: "",
    from,
    to,
  });
}

// search and replace
const SearchRef = ref();
function showSearchPopper() {
  SearchRef.value.showPopper();
}
provide("showSearchPopper", showSearchPopper);
provide("find", find);
provide("findNext", findNext);
provide("findPrev", findPrev);
provide("replace", replace);
provide("replaceAll", replaceAll);
provide("reset", reset);
provide("count", count);
provide("activeIndex", activeIndex);

onMounted(() => {
  // step2 由schema创建state（因为使用了dom元素，所以必须放在onMounted中）
  const state = EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
    // exampleSetup提供了input rules、keymaps、cursor、history、menu等插件。不需要它提供的菜单，通过menuBar:false关闭
    plugins: exampleSetup({ schema, menuBar: false }).concat([
      plugin_menuButtonState,
      plugin_highlightEmoji,
      plugin_wordListNumber,
      plugin_linkHoverToolbar,
      plugin_search,
      keymap({
        Tab: () => callMenuCommand(sinkWordListItem()),
        "Shift-Tab": () => callMenuCommand(liftWordListItem()),
      }),
    ]),
  });
  // step3 由 state 创建 view（因为使用了dom元素，所以必须放在onMounted中）
  editorView.value = new EditorView(document.querySelector("#editor"), { state });
  window.view = editorView.value;
});

provide("callMenuCommand", callMenuCommand);
function callMenuCommand(command) {
  return command(editorView.value.state, editorView.value.dispatch);
}
</script>
<style lang="scss">
#editor {
  position: relative;
  height: 400px;
  overflow: auto;
  .ProseMirror {
    // link
    a {
      color: #4299e1;
    }
    a:hover {
      color: #24659b;
    }
    // emoji
    span[emoji-type][emoji-state="pic"] {
      img {
        width: 20px;
      }
      &.highlight {
        img {
          background: orange;
          outline: 2px solid red;
        }
      }
    }
    span[emoji-type][emoji-state="text"] {
      span {
        background: #eee;
      }
      &.highlight {
        span {
          background: orange;
        }
      }
    }
    // word list
    p[list-id][list-item-level]::before {
      display: inline;
      content: attr(list-item-number);
      margin-right: 8px;
    }
  }
}
</style>
