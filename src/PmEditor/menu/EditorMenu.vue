<template>
  <section>
    <input
      v-for="(menu, index) in menus"
      :key="index"
      :value="menu.label"
      :title="menu.description"
      :disabled="menu.disabled"
      @click="callMenuCommand(menu)"
      type="button"
    />
  </section>
</template>

<script setup>
import { inject } from "vue";
import { menus } from "./menuPlugin";

const editorView = inject("editorView");

function callMenuCommand(menu) {
  return menu.command(editorView.value.state, editorView.value.dispatch);
}
</script>
