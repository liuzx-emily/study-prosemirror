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
    <h1>word列表</h1>
    <p list-id="1" list-item-level="0">美国宇航局的科学家们</p>
    <p list-id="1" list-item-level="1">首次掌握了天王星上有极地气旋的有力证据。</p>
    <p list-id="1" list-item-level="1">通过检查从这个冰雪巨人身上发出的无线电波，</p>
    <p list-id="1" list-item-level="0">他们在这个星球的北极检测到了这种现象。</p>
    <p list-id="1" list-item-level="5">
      这些发现证实了关于我们太阳系中所有具有大量大气层的行星的一个广泛的事实：
    </p>
    <p>无论这些行星主要由岩石还是气体组成，</p>
    <p list-id="1" list-item-level="0">它们的大气层在两极都有漩涡的迹象。</p>
    <p list-id="1" list-item-level="1">
      美国宇航局的科学家们利用微波观测发现了天王星上的第一个极地气旋，
    </p>
    <p list-id="1" list-item-level="1">在这里看到的是天王星每张图片中中心右侧的一个浅色的点。</p>
    <p list-id="1" list-item-level="5">这些图像使用的是波长为K、Ka和Q的波段，</p>
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
import EditorMenu from "./components/Menu/EditorMenu.vue";
import { plugin_menuButtonState } from "./plugin/plugin-menuButtonState";
import { plugin_highlightEmoji } from "./plugin/plugin-highlightEmoji";
import { plugin_wordListNumber } from "./plugin/plugin-wordListNumber";
import "../assets/editor.css";

const editorView = shallowRef(); // vue3中必须用shallowRef。如果用ref，会报错 Applying a mismatched transaction
provide("editorView", editorView);

onMounted(() => {
  // step2 由schema创建state（因为使用了dom元素，所以必须放在onMounted中）
  const state = EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
    // exampleSetup提供了input rules、keymaps、cursor、history、menu等插件。不需要它提供的菜单，通过menuBar:false关闭
    plugins: exampleSetup({ schema, menuBar: false }).concat([
      plugin_menuButtonState,
      plugin_highlightEmoji,
      plugin_wordListNumber,
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
    // word list
    p[list-id][list-item-level]::before {
      display: inline;
      content: attr(list-item-number);
      margin-right: 8px;
    }
  }
}
</style>
