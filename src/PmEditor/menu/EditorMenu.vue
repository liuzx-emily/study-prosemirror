<template>
  <section>
    <!-- 点击 menu button 时，若不想丢失 editor 的 focus 状态，需要用 mousedown.prevent 代替 click -->
    <MenuInsertEmoji />
    <a-button
      title="切换选中的单个emoji的状态"
      :disabled="menuButtonState.toggleSelectedEmojiState_disable"
      @mousedown.prevent="callMenuCommand(toggleSelectedEmojiState())"
      >切换单个emoji的状态</a-button
    >
    <a-button
      title="将选区中所有emoji设为文本"
      :disabled="menuButtonState.setStateOfAllEmojisInTheSelectionToText_disable"
      @mousedown.prevent="callMenuCommand(setStateOfAllEmojisInTheSelection('text'))"
      >将选区中所有emoji设为文本</a-button
    >
    <a-button
      title="将选区中所有emoji设为图像"
      :disabled="menuButtonState.setStateOfAllEmojisInTheSelectionToPic_disable"
      @mousedown.prevent="callMenuCommand(setStateOfAllEmojisInTheSelection('pic'))"
      >将选区中所有emoji设为图像</a-button
    >
    <a-button
      title="切换高亮文档中所有emoji"
      :disabled="menuButtonState.toggleHighlightEmoji_disable"
      @mousedown.prevent="callMenuCommand(toggleHighlightEmoji())"
      >切换高亮emoji</a-button
    >
  </section>
  <section>
    <a-button
      title="加粗"
      :disabled="false"
      :class="{ active: menuButtonState.toggleBold_active }"
      @mousedown.prevent="callMenuCommand(toggleMark(editorView.state.schema.marks.strong))"
      >B</a-button
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
import { toggleMark } from "prosemirror-commands";
const editorView = inject("editorView");

provide("callMenuCommand", callMenuCommand);
function callMenuCommand(command) {
  return command(editorView.value.state, editorView.value.dispatch);
}
</script>
<style lang="scss" scoped>
:deep() {
  .ant-btn {
    padding: 2px 6px;
    height: auto;
    margin-bottom: 4px;
    &.active {
      background: #fbe9e7;
      color: #bf360c;
    }
  }
  .ant-btn + .ant-btn {
    margin-left: 4px;
  }
}
</style>
