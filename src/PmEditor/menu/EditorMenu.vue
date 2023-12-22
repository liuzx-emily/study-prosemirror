<template>
  <section>
    <MenuInsertEmoji />
    <a-button
      title="切换选中的emoji的状态"
      :disabled="buttonState.toggleSelectedEmojiStateButton_disable"
      @click="callMenuCommand(toggleSelectedEmojiState())"
      >切换emoji状态</a-button
    >
  </section>
</template>

<script setup>
import { inject, provide } from "vue";
import { buttonState } from "./menuPlugin";
import MenuInsertEmoji from "./MenuInsertEmoji.vue";
import { toggleSelectedEmojiState } from "../command";

const editorView = inject("editorView");

provide("callMenuCommand", callMenuCommand);
function callMenuCommand(command) {
  return command(editorView.value.state, editorView.value.dispatch);
}
</script>
