import { Plugin } from "prosemirror-state";
import { reactive } from "vue";
import { toggleSelectedEmojiState, setStateOfAllEmojisInTheSelection } from "../command";

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
  setAllEmojisInSelectionToTextButton_disable: false,
});

function updateButtonState(view) {
  const state = view.state;
  buttonState.toggleSelectedEmojiStateButton_disable = !toggleSelectedEmojiState()(state);
  buttonState.setStateOfAllEmojisInTheSelectionToTextButton_disable =
    !setStateOfAllEmojisInTheSelection("text")(state);
  buttonState.setStateOfAllEmojisInTheSelectionToPicButton_disable =
    !setStateOfAllEmojisInTheSelection("pic")(state);
}
