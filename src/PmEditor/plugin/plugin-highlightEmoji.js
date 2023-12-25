import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// 高亮emoji
export const plugin_highlightEmoji = new Plugin({
  props: {
    decorations(state) {
      const emojiPosition = [];
      state.doc.descendants((node, pos) => {
        if (node.type.name === "emoji") {
          emojiPosition.push({ from: pos, to: pos + node.nodeSize });
        }
      });
      if (emojiPosition.length === 0) {
        return DecorationSet.empty;
      }
      return DecorationSet.create(
        state.doc,
        emojiPosition.map((pos) => {
          return Decoration.node(pos.from, pos.to, { class: "highlight" });
        })
      );
    },
  },
});
