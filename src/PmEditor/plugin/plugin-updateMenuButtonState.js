import { Plugin } from "prosemirror-state";
import { reactive } from "vue";
import {
  toggleSelectedEmojiState,
  setStateOfAllEmojisInTheSelection,
  toggleHighlightEmoji,
} from "../command";
import { isNodeActive, isMarkActive } from "../utils/tiptap-isActive";
/* 为什么不用 prosemirror 提供的两个方法：
  checkNodeActive 只判断单一节点。如果选区包含了两个p，那么会返回 false，和想要的效果不符。
  checkMarkActive 在选区不为空时使用 rangeHasMark 判断。会导致选区中既有带 mark 的内容也有不带 mark 的内容时，仍会返回 true，和想要的效果不符。
*/
// import { checkNodeActive, checkMarkActive } from "../utils/prosemirror-isActive";
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
  toggleSelectedEmojiState_disable: false,
  setStateOfAllEmojisInTheSelectionToText_disable: false,
  setStateOfAllEmojisInTheSelectionToPic_disable: false,
  toggleHighlightEmoji_disable: false,
  toggleBold_active: false,
  setHeading1_active: false,
  setParagraph_active: false,
  setList_active: false,
});

function updateMenuButtonState(view) {
  const state = view.state;
  menuButtonState.toggleSelectedEmojiState_disable = !toggleSelectedEmojiState()(state);
  menuButtonState.setStateOfAllEmojisInTheSelectionToText_disable =
    !setStateOfAllEmojisInTheSelection("text")(state);
  menuButtonState.setStateOfAllEmojisInTheSelectionToPic_disable =
    !setStateOfAllEmojisInTheSelection("pic")(state);
  menuButtonState.toggleHighlightEmoji_disable = !toggleHighlightEmoji("pic")(state);
  menuButtonState.toggleBold_active = isMarkActive(state, state.schema.marks.strong);
  menuButtonState.setHeading1_active = isNodeActive(state, state.schema.nodes.heading, {
    level: 1,
  });
  menuButtonState.setParagraph_active = isNodeActive(state, state.schema.nodes.paragraph);
  menuButtonState.setList_active = isNodeActive(state, state.schema.nodes.wordList);
}
