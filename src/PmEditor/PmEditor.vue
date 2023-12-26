<template>
  <section id="content" style="display: none">
    <p>123<strong>456</strong>789</p>
    <h1>Conversation</h1>
    <p>小明：你<span style="font-weight: bold">喜欢</span>吃什么水果？</p>
    <p>小红：我喜欢 <span emoji-type="apple"></span>和<span emoji-type="banana"></span>。你呢？</p>
    <p>
      小明：我喜欢吃 <span emoji-type="pear"></span>、
      <span emoji-type="watermelon" emoji-state="text"></span>
    </p>
  </section>
  <EditorMenu />
  <section id="editor"></section>
</template>

<script setup>
import { onMounted, provide, shallowRef } from "vue";
import { DOMParser } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import schema from "./schema"; // step1 创建schema
import EditorMenu from "./menu/EditorMenu.vue";
import { plugin_updateMenuButtonState } from "./plugin/plugin-updateMenuButtonState";
import { plugin_highlightEmoji } from "./plugin/plugin-highlightEmoji";
import "../assets/editor.css";

const editorView = shallowRef(); // vue3中必须用shallowRef。如果用ref，会报错 Applying a mismatched transaction
provide("editorView", editorView);

onMounted(() => {
  // step2 由schema创建state（因为使用了dom元素，所以必须放在onMounted中）
  const state = EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
    // exampleSetup提供了input rules、keymaps、cursor、history、menu等插件。不需要它提供的菜单，通过menuBar:false关闭
    plugins: exampleSetup({ schema, menuBar: false }).concat([
      plugin_updateMenuButtonState,
      plugin_highlightEmoji,
    ]),
  });
  // step3 由 state 创建 view（因为使用了dom元素，所以必须放在onMounted中）
  editorView.value = new EditorView(document.querySelector("#editor"), { state });
  window.view = editorView.value;
});
</script>
<style lang="scss">
#editor {
  .ProseMirror {
    min-height: 400px;
    outline: 1px solid #aaa;

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
  }
}
</style>
