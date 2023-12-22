import { Plugin } from "prosemirror-state";
import { reactive } from "vue";
import { toggleSelectedEmojiState } from "../command";

export const menuPlugin = new Plugin({
  view(view) {
    updateButtonState(view);
    return {
      update(view) {
        updateButtonState(view);
      },
    };
  },
});

export const buttonState = reactive({
  toggleSelectedEmojiStateButton_disable: false,
});

function updateButtonState(view) {
  buttonState.toggleSelectedEmojiStateButton_disable = !toggleSelectedEmojiState()(view.state);
}
