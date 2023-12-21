<template>
  <section id="content" style="display: none">
    <p>
      emoji图标：
      <span emoji-type="apple"></span>
      <span emoji-type="banana"></span>
      <span emoji-type="cake"></span>
      <span emoji-type="pear"></span>
      <span emoji-type="pineapple" emoji-state="text"></span>
      <span emoji-type="watermelon"></span>
    </p>
  </section>
  <section id="editor"></section>
</template>

<script setup>
import { onMounted } from "vue";
import { DOMParser } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";

import schema from "./schema"; // step1 创建schema

onMounted(() => {
  // step2 由schema创建state（因为使用了dom元素，所以必须放在onMounted中）
  const state = EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
    // exampleSetup提供了input rules、keymaps、cursor、history、menu等插件。不需要它提供的菜单，通过menuBar:false关闭
    plugins: exampleSetup({ schema, menuBar: false }),
  });
  // step3 由 state 创建 view（因为使用了dom元素，所以必须放在onMounted中）
  window.view = new EditorView(document.querySelector("#editor"), { state });
});
</script>
<style lang="scss">
#editor {
  .ProseMirror {
    min-height: 400px;
    outline: 1px solid #aaa;
    .ProseMirror-selectednode {
      outline: 2px solid #8cf;
    }
    // emoji
    span[emoji-type][emoji-state="pic"] {
      img {
        width: 30px;
      }
    }
    span[emoji-type][emoji-state="text"] {
      span {
        background: #eee;
      }
    }
  }
}
</style>
