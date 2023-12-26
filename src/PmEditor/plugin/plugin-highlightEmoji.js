import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// 高亮emoji
export const pluginKey_highlightEmoji = new PluginKey("highlightEmoji");

export const plugin_highlightEmoji = new Plugin({
  key: pluginKey_highlightEmoji,
  // state 中存储一个 Boolean。代表是否高亮
  state: {
    init() {
      // 初始化为false
      return false;
    },
    apply(tr, value) {
      // 每次触发tr都会进apply方法。
      const metadata = tr.getMeta(this);
      if (typeof metadata === "boolean") {
        // getMeta取到的值是Boolean类型，说明本次 tr 中给这个 plugin setMeta 了。
        // return 获取到的 metadata，作为 state 的新值。
        return metadata;
      } else {
        // metadata 的类型不是 Boolean。说明本次 tr 根本没有给这个 plugin 设置 meta，或者设置了但是数据类型错误。
        // state 值不变，直接 return。
        return value;
      }
    },
  },
  props: {
    decorations(state) {
      // this 就是当前 plugin。用 getState 获取数据，是一个 Boolean
      const flag = this.getState(state);
      if (!flag) {
        // flag为false，不高亮，直接返回一个空集。
        return DecorationSet.empty;
      }
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
