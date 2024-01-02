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
      ><BoldOutlined
    /></a-button>
    <a-button title="加粗" :disabled="false" @mousedown.prevent="emit('insert-link')"
      ><LinkOutlined
    /></a-button>
    <a-button
      title="移除选区中的所有链接"
      :disabled="menuButtonState.removeAllLinksInSelection_disable"
      @mousedown.prevent="callMenuCommand(removeAllLinksInSelection())"
      >移除链接</a-button
    >
    <i class="divider"></i>
    <a-button
      title="标题1"
      :disabled="false"
      :class="{ active: menuButtonState.setHeading1_active }"
      @mousedown.prevent="
        callMenuCommand(setBlockType(editorView.state.schema.nodes.heading, { level: 1 }))
      "
      >H1</a-button
    >
    <a-button
      title="段落"
      :disabled="false"
      :class="{ active: menuButtonState.setParagraph_active }"
      @mousedown.prevent="callMenuCommand(setBlockType(editorView.state.schema.nodes.paragraph))"
      >P</a-button
    >
    <i class="divider"></i>
    <a-button
      title="列表"
      :disabled="false"
      :class="{ active: menuButtonState.setList_active }"
      @mousedown.prevent="callMenuCommand(toggleWordList())"
      ><OrderedListOutlined
    /></a-button>
    <a-button
      title="列表->"
      :disabled="menuButtonState.sinkWordListItem_disable"
      @mousedown.prevent="callMenuCommand(sinkWordListItem())"
      ><MenuUnfoldOutlined
    /></a-button>
    <a-button
      title="列表<-"
      :disabled="menuButtonState.liftWordListItem_disable"
      @mousedown.prevent="callMenuCommand(liftWordListItem())"
      ><MenuFoldOutlined
    /></a-button>
  </section>
  <section>
    <MenuSearch />
  </section>
</template>

<script setup>
import { inject, provide } from "vue";
import { menuButtonState } from "../../plugin/plugin-menuButtonState";
import MenuInsertEmoji from "./MenuInsertEmoji.vue";
import MenuSearch from "./MenuSearch.vue";
import {
  toggleSelectedEmojiState,
  setStateOfAllEmojisInTheSelection,
  toggleHighlightEmoji,
  toggleWordList,
  liftWordListItem,
  sinkWordListItem,
  removeAllLinksInSelection,
} from "../../command";
import { toggleMark, setBlockType } from "prosemirror-commands";
import {
  BoldOutlined,
  LinkOutlined,
  OrderedListOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons-vue";

const emit = defineEmits(["insert-link"]);
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
  i.divider {
    width: 1px;
    height: 16px;
    background: #d9d9d9;
    display: inline-block;
    margin: 0 10px;
    position: relative;
    top: 4px;
  }
}
</style>
