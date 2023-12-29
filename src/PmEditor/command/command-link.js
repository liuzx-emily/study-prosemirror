export function setLink(from, to, link, text) {
  link = link && link.trim();
  return function (state, dispatch) {
    if (dispatch) {
      const linkMark = state.schema.marks.link;
      let tr = state.tr;
      tr.insertText(text, from, to); // insertText 会移除 mark。所以必须先 insertText。后 addMark
      const newLinkMark = linkMark.create({ href: link });
      // tr.addMark(from, to, newLinkMark); // 第二个参数不能传 to，那是原来的文字范围，要用新文字的长度！
      tr.addMark(from, from + text.length, newLinkMark);
      dispatch(tr);
    }
    return true;
  };
}

export function removeLink(from, to) {
  return function (state, dispatch) {
    const linkMark = state.schema.marks.link;
    if (!state.doc.rangeHasMark(from, to, linkMark)) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr.removeMark(from, to, linkMark);
      dispatch(tr);
    }
    return true;
  };
}
