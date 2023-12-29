<template>
  <div class="LinkSettingsPanel-container" v-show="visible" :style="containerStyle">
    <div>文本：<input type="text" v-model="linkData.text" /></div>
    <div style="margin-top: 10px">链接：<input type="text" v-model="linkData.link" /></div>
    <div style="text-align: right; margin-top: 16px">
      <input type="button" value="取消" @click="handleCancel" />
      <input
        type="button"
        value="保存"
        style="background: rgb(61, 137, 233); color: white"
        @click="handleSave"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, inject } from "vue";
import { setLink } from "../../command/command-link";
const editorView = inject("editorView");
const visible = ref(false);
const linkData = reactive({
  left: "",
  top: "",
  text: "",
  link: "",
  from: null,
  to: null,
});

const parentCoords = reactive({
  left: "",
  top: "",
});

const containerStyle = computed(() => {
  let offsetLeft = 0;
  let offsetTop = 0;
  // 需要加上 #editor 的 padding（border和margin不用管，没有影响）
  const outerContainer = document.querySelector("#editor");
  if (outerContainer) {
    const style = getComputedStyle(outerContainer);
    offsetLeft += parseInt(style["padding-left"]);
    offsetTop += parseInt(style["padding-top"]);
  }
  // 需要加上 .ProseMirror 的 margin（padding和border不用管，没有影响）
  const innerEditor = document.querySelector(".ProseMirror");
  if (innerEditor) {
    const style = getComputedStyle(innerEditor);
    offsetLeft += parseInt(style["margin-left"]);
    offsetTop += parseInt(style["margin-top"]);
  }
  const panelHeight = 133;
  return {
    left: linkData.left - parentCoords.left + offsetLeft + "px",
    top: linkData.top - parentCoords.top - panelHeight + offsetTop + "px",
  };
});

function handleSave() {
  setLink(
    linkData.from,
    linkData.to,
    linkData.link,
    linkData.text
  )(editorView.value.state, editorView.value.dispatch);
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}

function showSettingsPanel({ left, top, text, link, from, to }) {
  linkData.left = left;
  linkData.top = top;
  linkData.text = text;
  linkData.link = link;
  linkData.from = from;
  linkData.to = to;
  const parentInfo = editorView.value.dom.getBoundingClientRect();
  parentCoords.left = parentInfo.left;
  parentCoords.top = parentInfo.top;

  visible.value = true;
}

function hideSettingsPanel() {
  visible.value = false;
}

defineExpose({ showSettingsPanel, hideSettingsPanel });
</script>
<style scoped lang="scss">
.LinkSettingsPanel-container {
  position: absolute;
  background: white;
  padding: 20px 16px 12px 15px;
  border: 1px solid #ccc;
  box-shadow: rgb(193 193 193) 1px 1px 6px;
  border-radius: 4px;
  z-index: 99;
  font-size: 14px;
  box-sizing: border-box;
  input[type="text"] {
    border: 1px solid #999;
    padding: 4px 6px;
    border-radius: 2px;
  }
  input[type="button"] {
    padding: 2px 4px;
    border: none;
    cursor: pointer;
    border: 1px solid #eee;
  }
  input[type="button"] + input[type="button"] {
    margin-left: 8px;
  }
}
</style>
