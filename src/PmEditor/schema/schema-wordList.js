export const wordList = {
  inline: false,
  attrs: {
    listId: "",
    listItemLevel: "",
  },
  group: "block",
  content: "inline*", // TODO 列表项可以设置为标题1
  parseDOM: [
    {
      tag: "p[list-id][list-item-level]",
      getAttrs(dom) {
        return {
          listId: dom.getAttribute("list-id"),
          listItemLevel: parseInt(dom.getAttribute("list-item-level")),
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "p",
      {
        "list-id": node.attrs.listId,
        "list-item-level": node.attrs.listItemLevel,
      },
      0, // 0代表有内容
    ];
  },
};
