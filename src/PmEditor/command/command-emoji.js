/**
 * 修改选中的 emoji 的状态
 * @param {'text'|'pic'} emojiState
 * @returns function(state,dispatch):Boolean
 */
export function changeSelectedEmojiState(emojiState) {
  return function (state, dispatch) {
    const selectedEmoji = getSelectedEmoji(state);
    if (!selectedEmoji) {
      return false;
    } else {
      const pos = state.selection.from;
      // 用 setNodeAttribute 修改 attrs
      const tr = state.tr.setNodeAttribute(pos, "state", emojiState);
      if (dispatch) {
        dispatch(tr);
      }
      return true;
    }
  };
}

/**
 * 切换选中的 emoji 的状态
 * @returns function(state,dispatch):Boolean
 */
export function toggleSelectedEmojiState() {
  return function (state, dispatch) {
    const selectedEmoji = getSelectedEmoji(state);
    if (!selectedEmoji) {
      return false;
    } else {
      const emojiState = selectedEmoji.attrs.state === "text" ? "pic" : "text";
      return changeSelectedEmojiState(emojiState)(state, dispatch);
    }
  };
}

/**
 * 在选中位置插入emoji
 * @param {String} emojiType apple/banana/cake/pear...
 * @returns function(state,dispatch):true
 */
export function insertEmoji(emojiType) {
  return function (state, dispatch) {
    const newEmoji = state.schema.nodes.emoji.create({ type: emojiType });
    const tr = state.tr.replaceSelectionWith(newEmoji);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  };
}

/**
 * 获取选中的emoji。如果选区不是NodeSelection，或者选中的是其他类型的node，均返回null
 * @param {EditorState} state
 * @returns EmojiNodeSelection | null
 */
function getSelectedEmoji(state) {
  const selectedNode = state.selection.node;
  if (!selectedNode) {
    // 选区不是 NodeSelection
    return null;
  }
  if (selectedNode.type.name === "emoji") {
    return selectedNode;
  } else {
    // 是其他类型的node，
    return null;
  }
}

/**
 * 修改选区中所有emoji的状态
 * @param {'text'|'pic'} emojiState
 * @returns function(state,dispatch):true
 */

export function setStateOfAllEmojisInTheSelection(emojiState) {
  return function (state, dispatch) {
    const { from, to, empty } = state.selection;
    if (empty) {
      // 选区为空
      return false;
    }
    const emojiNodes = [];
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === "emoji" && node.attrs.state !== emojiState) {
        emojiNodes.push({ node, pos });
      }
    });
    if (emojiNodes.length === 0) {
      // 选区中没有需要改变状态的emoji
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      emojiNodes.forEach((emojiNode) => {
        tr.setNodeAttribute(emojiNode.pos, "state", emojiState);
      });
      dispatch(tr);
    }
    return true;
  };
}
