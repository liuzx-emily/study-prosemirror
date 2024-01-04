<template>
  <section class="editor-search-and-replace-popper" v-show="visible">
    <CloseCircleOutlined class="close-icon" @click="closePopper" />
    <a-input v-model:value="search" placeholder="查找" @keydown.enter="callMenuCommand(findNext())">
      <template #suffix>
        <span style="color: #666" v-if="count !== -1">
          <span v-if="count === 0">未找到</span>
          <span v-else>
            <LeftCircleOutlined
              style="cursor: pointer"
              @mousedown.prevent="callMenuCommand(findPrev())"
            />
            <span style="margin: 0 5px">{{ activeIndex + 1 }}/{{ count }}</span>
            <RightCircleOutlined
              style="cursor: pointer"
              @mousedown.prevent="callMenuCommand(findNext())"
            />
          </span>
        </span>
      </template>
    </a-input>
    <section style="display: flex; align-items: center; margin-top: 10px">
      <a-input v-model:value="replaceText" placeholder="替换" />
      <a-button @mousedown.prevent="callMenuCommand(replace(replaceText))" :disabled="count <= 0"
        >替换</a-button
      >
      <a-button @mousedown.prevent="callMenuCommand(replaceAll(replaceText))" :disabled="count <= 0"
        >替换全部</a-button
      >
    </section>
  </section>
</template>

<script setup>
import { inject, ref, watch } from "vue";
import {
  LeftCircleOutlined,
  RightCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";

const callMenuCommand = inject("callMenuCommand");
const find = inject("find");
const findNext = inject("findNext");
const findPrev = inject("findPrev");
const replace = inject("replace");
const replaceAll = inject("replaceAll");
const reset = inject("reset");
const count = inject("count");
const activeIndex = inject("activeIndex");

const visible = ref(false);

const search = ref("");
const replaceText = ref("");

watch(search, () => callMenuCommand(find(search.value)));

function showPopper() {
  visible.value = true;
}
function closePopper() {
  visible.value = false;
  search.value = "";
  callMenuCommand(reset());
}
defineExpose({ showPopper });
</script>
<style lang="scss" scoped>
.editor-search-and-replace-popper {
  box-sizing: border-box;
  width: 400px;
  padding: 15px 34px 20px 22px;
  background: #fff;
  box-shadow: 1px 1px 10px 0 rgb(213 213 213);
  position: fixed;
  z-index: 1;
  left: 40%;
  top: 40px;
  border-radius: 4px;
  .ant-btn {
    padding: 0px 5px;
  }
  .close-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 1;
    color: #7d7d7d;
    cursor: pointer;
  }
}
</style>
<style lang="scss">
.find {
  background: orange;
}
.active-find {
  background: #00bcd4;
}
</style>
