import { Plugin } from "prosemirror-state";
import { reactive } from "vue";
import {
  toggleSelectedEmojiState,
  setStateOfAllEmojisInTheSelection,
  toggleHighlightEmoji,
} from "../command";

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
});

function updateMenuButtonState(view) {
  const state = view.state;
  menuButtonState.toggleSelectedEmojiState_disable = !toggleSelectedEmojiState()(state);
  menuButtonState.setStateOfAllEmojisInTheSelectionToText_disable =
    !setStateOfAllEmojisInTheSelection("text")(state);
  menuButtonState.setStateOfAllEmojisInTheSelectionToPic_disable =
    !setStateOfAllEmojisInTheSelection("pic")(state);
  menuButtonState.toggleHighlightEmoji_disable = !toggleHighlightEmoji("pic")(state);
  menuButtonState.toggleBold_active = checkMarkActive(state, state.schema.marks.strong);
  menuButtonState.setHeading1_active = checkNodeActive(state, state.schema.nodes.heading, {
    level: 1,
  });
  menuButtonState.setParagraph_active = checkNodeActive(state, state.schema.nodes.paragraph);
}

/**
 * mark 类型的按钮用来判断 active（从 prosemirror-example-setup 包中复制过来的）
 * @param {EditorState} state
 * @param {MarkType} markType
 * @returns Boolean
 */
function checkMarkActive(state, markType) {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    // 选区为空时，按钮的 active 状态代表：如果在光标位置输入文字，文字是否有该mark。下面用 bold 举例

    /* 
    state.storedMarks: Mark[] .A set of marks to apply to the next input. Will be null when no explicit marks have been set.
    注意区分 null 和 []
    state.storedMarks = null，代表下次输入不作特殊处理（跟周围环境走）
    state.storedMarks = []，代表确保接下来输入的内容没有任何mark

    对于内容：abc<strong>def</strong>gh
    情况一：当光标在ab之间时，bold按钮是非active的（此时 state.storedMarks = null）
    点击bold按钮，代表用户希望接下来输入的内容被加粗，此时bold按钮应该变为active。（此时 state.storedMarks = [strong mark]）

    情况二：当光标在de之间时，bold按钮是高亮状态。（此时 state.storedMarks = null）
    点击bold按钮，代表用户希望接下来输入的内容不加粗，此时bold按钮应该取消高亮。（此时 state.storedMarks = []）
    */
    // console.log("state.storedMarks", state.storedMarks);

    /* 
    对于内容： 你<strong>喜欢</strong>吃什么水果？
    当光标在“喜”和“欢”之间，或者光标在“欢”字之后时，$from.marks()的值都是[strong mark]
    */
    // console.log("$from.marks()", $from.marks());

    /* state.storedMarks 是特殊设定。$from.marks() 是周围环境的设定。
    需要优先判定特殊设定，所以把 storedMarks 放在 || 前面：
    - 当storedMarks = null 时，说明没有特殊设定，跟着 $from.marks() 走。
    - 当storedMarks = =[] 时，说明特殊设定要求不能有 mark，所以不考虑 $from.marks() 了。
    - 当 storedMarks.length>0 时，说明特殊设定有 mark 要求，也不考虑 $from.marks()
    */

    return !!markType.isInSet(state.storedMarks || $from.marks());
  }
  // 选区有内容时，按钮的 active 状态代表：选区内是否有该mark。用 rangeHasMark
  return state.doc.rangeHasMark(from, to, markType);
}

/**
 * node 类型的按钮用来判断 active（从 prosemirror-menu 包中复制过来的，原名为 blockTypeItem）
 * @param {EditorState} state
 * @param {NodeType} nodeType
 * @param {Attrs} attrs
 * @returns Boolean
 */
function checkNodeActive(state, nodeType, attrs) {
  const { to, $from, node } = state.selection;
  if (node) {
    return node.hasMarkup(nodeType, attrs);
  }
  /* 
  ResolvedPos 的方法中，有的方法、属性考虑 TextNode的，有的不考虑 TextNode。要万分小心
  - start() end() before() after() node() 不考虑 TextNode
  - nodeBefore nodeAfter 属性考虑 TextNode

  
  对于内容：<p>123<strong>456</strong>789</p>
  当选区是567时，from是5(文本4和5之间），to是8（文本7和8之间）
  $from.start()是1（文本1之前），$from.end()是10（文本9之后）

  to<=$from.end()，说明选区在同一个非文本 node 中（比如同一个段落、同一个heading）
  */

  return to <= $from.end() && $from.parent.hasMarkup(nodeType, attrs);
}
