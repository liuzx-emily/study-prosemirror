<template>
  <div class="LinkHoverToolbar-container" v-show="visible" :style="containerStyle">
    <div class="LinkHoverToolbar-content" :style="{ height: toolbarHeight + 'px' }">
      <span class="action" @click="openLink">打开</span>
      <span class="action" @click="editLink">编辑</span>
      <span class="action" @click="unsetLink">移除</span>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref } from "vue";
import { removeLink } from "../../command/command-link";
const emit = defineEmits(["edit-link"]);
const editorView = inject("editorView");
const visible = ref(false);
const linkData = reactive({
  // 这些数据在点编辑打开设置面板时要传过去，所以要存下来
  left: "",
  top: "",
  text: "",
  link: "",
  from: null,
  to: null,
});

const toolbarHeight = ref(30);
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

  const paddingBottom = 4;
  return {
    left: linkData.left - parentCoords.left + offsetLeft + "px",
    // 计算 top 时最后要+1px，不然会有空隙，鼠标挪到空隙处 toolbar 就消失了
    top:
      linkData.top - parentCoords.top - toolbarHeight.value - paddingBottom + 1 + offsetTop + "px",
    paddingBottom: paddingBottom + "px",
  };
});

function openLink() {
  window.open(linkData.link, "_blank");
}
function editLink() {
  emit("edit-link", {
    left: linkData.left,
    top: linkData.top,
    text: linkData.text,
    link: linkData.link,
    from: linkData.from,
    to: linkData.to,
  });
  hideToolbar();
}
function unsetLink() {
  removeLink(linkData.from, linkData.to)(editorView.value.state, editorView.value.dispatch);
}
function showToolbar({ left, top, text, link, from, to }) {
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
function hideToolbar() {
  visible.value = false;
}
defineExpose({ showToolbar, hideToolbar });
</script>
<style scoped lang="scss">
.LinkHoverToolbar-container {
  position: absolute;
  z-index: 1;
}
.LinkHoverToolbar-content {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  background: #f5f5f5;
  box-shadow: rgb(229 229 229) 1px 1px 4px;
  border-radius: 4px;
  .action {
    font-size: 12px;
    cursor: pointer;
    &:hover {
      color: #2196f3;
      text-decoration: underline;
    }
  }
  .action + .action {
    margin-left: 5px;
  }
}
</style>
