<template>
  <a-popover trigger="click" v-model:open="visible">
    <template #content>
      <section class="emoji-container">
        <img
          v-for="emoji in emojiList"
          :key="emoji.key"
          :src="emoji.imgUrl"
          :title="emoji.text"
          @click="handleClick(emoji)"
        />
      </section>
    </template>
    <a-button title="在选中位置添加emoji">添加emoji</a-button>
  </a-popover>
</template>

<script setup>
import { emojiMap } from "../schema/schema-emoji";
import { inject, ref } from "vue";
import { insertEmoji } from "../command";

const callMenuCommand = inject("callMenuCommand");

const emojiList = Object.entries(emojiMap).map(([key, value]) => {
  return { key, ...value };
});

const visible = ref(false);

function handleClick(emoji) {
  callMenuCommand(insertEmoji(emoji.key));
  visible.value = false;
}
</script>
<style lang="scss" scoped>
.emoji-container {
  display: flex;
  width: 90px;
  flex-wrap: wrap;
  justify-content: space-around;
  img {
    width: 20px;
    margin: 8px 4px;
    cursor: pointer;
  }
}
</style>
