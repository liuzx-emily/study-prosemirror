export function setLink(from, to, link, text) {
  link = link && link.trim();
  return function (state, dispatch) {
    if (dispatch) {
      const linkMarkType = state.schema.marks.link;
      let tr = state.tr;
      tr.insertText(text, from, to); // insertText 会移除 mark。所以必须先 insertText。后 addMark
      const newLinkMark = linkMarkType.create({ href: link });
      // tr.addMark(from, to, newLinkMark); // 第二个参数不能传 to，那是原来的文字范围，要用新文字的长度！
      tr.addMark(from, from + text.length, newLinkMark);
      dispatch(tr);
    }
    return true;
  };
}

export function removeLink(from, to) {
  return function (state, dispatch) {
    const linkMarkType = state.schema.marks.link;
    if (!state.doc.rangeHasMark(from, to, linkMarkType)) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr.removeMark(from, to, linkMarkType);
      dispatch(tr);
    }
    return true;
  };
}

/**
 * 移除选区内的所有链接
 * @returns Command
 */
export function removeAllLinksInSelection() {
  return function (state, dispatch) {
    const { from, to, empty } = state.selection;
    // 选区内容为空时，判断光标是否在某个链接内。如果在，移除这个链接。
    if (empty) {
      const res = getLinkTextNode(state, from);
      if (!res) {
        return false; // 光标不在链接内，返回 false
      }
      // 光标在链接内，移除整个链接
      return removeLink(res.start, res.end)(state, dispatch);
    }
    // 选区不为空，可以直接调用 removeLink。removeLink 会判断选区内是否有 link 并相应返回 true/false
    return removeLink(from, to)(state, dispatch);
  };
}

/**
 * 获取 pos 位置所在的链接的信息。如果 pos 不在链接中，返回 {}。如果 pos 在某个链接中，返回这个 TextNode 的起始位置、结束位置、TextNode
 * @param {EditorState} state
 * @param {Number} pos
 * @returns {{start,end,node}|null}
 */
export function getLinkTextNode(state, pos) {
  const linkMarkType = state.schema.marks.link;
  const $pos = state.doc.resolve(pos);

  // 使用 marks() 获取当前位置的 marks
  if (!linkMarkType.isInSet($pos.marks())) {
    return null;
  }
  // 当 $pos 在文本节点中时，$pos.textOffset =  $pos.pos - 文本节点起始位置。所以文本节点起始位置 = $pos.pos - $pos.textOffset
  const start = pos - $pos.textOffset;
  const linkNode = state.doc.nodeAt(pos); // // $pos.node 不能找 TextNode。要用 nodeAt
  // const linkNode = $pos.parent.maybeChild($pos.index()); // 这样也可以找到 TextNode
  const end = start + linkNode.nodeSize;
  return {
    start,
    end,
    node: linkNode,
  };
}
