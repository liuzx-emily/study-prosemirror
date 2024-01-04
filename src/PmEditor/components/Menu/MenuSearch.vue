<template>
  <a-button title="查找替换" @mousedown.prevent="showSearchPopper"><SearchOutlined /></a-button>
</template>

<script setup>
import { inject } from "vue";
import { SearchOutlined } from "@ant-design/icons-vue";
const showSearchPopper = inject("showSearchPopper");
</script>
