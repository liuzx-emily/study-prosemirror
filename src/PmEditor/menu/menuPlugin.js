import { Plugin } from "prosemirror-state";
import { ref } from "vue";
import { toggleSelectedEmojiState } from "../command";

export const menuPlugin = new Plugin({
  view(view) {
    updateMenusDisabledState(view);
    return {
      update(view) {
        updateMenusDisabledState(view);
      },
    };
  },
});

export const menus = ref([
  {
    label: "切换emoji状态",
    description: "切换选中的emoji的状态",
    command: toggleSelectedEmojiState(),
    disabled: false,
  },
]);

function updateMenusDisabledState(view) {
  menus.value.forEach((menu) => {
    menu.disabled = !menu.command(view.state);
  });
}
