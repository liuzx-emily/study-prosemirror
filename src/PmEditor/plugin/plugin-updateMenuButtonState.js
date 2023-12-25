import { Plugin } from "prosemirror-state";
import { reactive } from "vue";
import { toggleSelectedEmojiState, setStateOfAllEmojisInTheSelection } from "../command";

export const plugin_updateMenuButtonState = new Plugin({
  view(view) {
    updateMenuButtonState(view);
    return {
      update(view) {
        updateMenuButtonState(view);
      },
    };
  },
});

export const menuButtonState = reactive({
  toggleSelectedEmojiStateButton_disable: false,
  setAllEmojisInSelectionToTextButton_disable: false,
});

function updateMenuButtonState(view) {
  const state = view.state;
  menuButtonState.toggleSelectedEmojiStateButton_disable = !toggleSelectedEmojiState()(state);
  menuButtonState.setStateOfAllEmojisInTheSelectionToTextButton_disable =
    !setStateOfAllEmojisInTheSelection("text")(state);
  menuButtonState.setStateOfAllEmojisInTheSelectionToPicButton_disable =
    !setStateOfAllEmojisInTheSelection("pic")(state);
}
