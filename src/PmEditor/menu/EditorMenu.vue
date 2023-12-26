<template>
  <section>
    <MenuInsertEmoji />
    <a-button
      title="切换选中的单个emoji的状态"
      :disabled="menuButtonState.toggleSelectedEmojiStateButton_disable"
      @click="callMenuCommand(toggleSelectedEmojiState())"
      >切换单个emoji的状态</a-button
    >
    <a-button
      title="将选区中所有emoji设为文本"
      :disabled="menuButtonState.setStateOfAllEmojisInTheSelectionToTextButton_disable"
      @click="callMenuCommand(setStateOfAllEmojisInTheSelection('text'))"
      >将选区中所有emoji设为文本</a-button
    >
    <a-button
      title="将选区中所有emoji设为图像"
      :disabled="menuButtonState.setStateOfAllEmojisInTheSelectionToPicButton_disable"
      @click="callMenuCommand(setStateOfAllEmojisInTheSelection('pic'))"
      >将选区中所有emoji设为图像</a-button
    >
    <a-button
      title="切换高亮文档中所有emoji"
      :disabled="menuButtonState.toggleHighlightEmojiButton_disable"
      @click="callMenuCommand(toggleHighlightEmoji())"
      >切换高亮emoji</a-button
    >
  </section>
</template>

<script setup>
import { inject, provide } from "vue";
import { menuButtonState } from "../plugin/plugin-updateMenuButtonState";
import MenuInsertEmoji from "./MenuInsertEmoji.vue";
import {
  toggleSelectedEmojiState,
  setStateOfAllEmojisInTheSelection,
  toggleHighlightEmoji,
} from "../command";

const editorView = inject("editorView");

provide("callMenuCommand", callMenuCommand);
function callMenuCommand(command) {
  return command(editorView.value.state, editorView.value.dispatch);
}
</script>
