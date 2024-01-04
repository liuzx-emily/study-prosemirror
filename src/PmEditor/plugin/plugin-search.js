import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { ref, computed } from "vue";

const searchText = ref("");
const results = ref([]); //[{from:Number,to:Number}]
export const count = computed(() => {
  // -1代表没有开始查询
  if (!searchText.value) {
    return -1;
  }
  return results.value.length;
});
export const activeIndex = ref(0); // 从0计数

function scrollToActiveResult() {
  const pos = results.value[activeIndex.value]?.from;
  if (pos) {
    scrollIntoViewByPmPos(pos);
  }
}

export function find(text) {
  return (state, dispatch) => {
    // 不允许用户自己输入正则。将字符串中的特殊字符转义，使其可以被当作普通字符在正则表达式中使用。比如：a|b 会被转换为 a\|b
    text = text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    // 重置 activeIndex，从0计数
    activeIndex.value = 0;
    searchText.value = text;
    dispatch(state.tr); // 为了触发deco更新手动派发tr
    scrollToActiveResult(); // 上一行 dispatch(tr) 后同步调用 decorations()。所以走到本行时，results 和 activeIndex 都已经在 decorations 中算好了，是最新的，可以放心用。
  };
}

export function findNext() {
  return (state, dispatch) => {
    activeIndex.value += 1; // 越界问题不在这处理，放在重新计算results后
    dispatch(state.tr); // 为了触发deco更新手动派发tr
    scrollToActiveResult();
  };
}

export function findPrev() {
  return (state, dispatch) => {
    activeIndex.value -= 1;
    dispatch(state.tr);
    scrollToActiveResult();
  };
}

export function replace(replaceText) {
  return (state, dispatch) => {
    const result = results.value[activeIndex.value];
    if (!result) {
      return;
    }
    const { from, to } = result;
    dispatch(state.tr.insertText(replaceText, from, to));
    scrollToActiveResult();
  };
}

export function replaceAll(replaceText) {
  function rebaseNextResult(replaceText, index, lastOffset = 0) {
    const nextIndex = index + 1;

    if (!results.value[nextIndex]) {
      return null;
    }

    const { from: currentFrom, to: currentTo } = results.value[index];
    const offset = currentTo - currentFrom - replaceText.length + lastOffset;
    const { from, to } = results.value[nextIndex];

    results.value[nextIndex] = {
      to: to - offset,
      from: from - offset,
    };

    return offset;
  }
  return ({ tr }, dispatch) => {
    let offset;

    if (!results.value.length) {
      return;
    }

    results.value.forEach(({ from, to }, index) => {
      tr.insertText(replaceText, from, to);
      offset = rebaseNextResult(replaceText, index, offset);
    });

    dispatch(tr);
    scrollToActiveResult();
  };
}

export function reset() {
  return (state, dispatch) => {
    searchText.value = "";
    results.value = [];
    activeIndex.value = 0;
    dispatch(state.tr);
  };
}

export const plugin_search = new Plugin({
  props: {
    decorations(state) {
      results.value = searchDoc(state.doc, searchText.value);
      // 处理 activeIndex 越界
      if (activeIndex.value < 0) {
        activeIndex.value = results.value.length - 1;
      }
      if (activeIndex.value > results.value.length - 1) {
        activeIndex.value = 0;
      }
      if (results.value.length === 0) {
        return DecorationSet.empty;
      }
      const decorations = results.value.map((result, index) => {
        const className = index === activeIndex.value ? "active-find" : "find";
        const deco = Decoration.inline(result.from, result.to, { class: className });
        return deco;
      });
      return DecorationSet.create(state.doc, decorations);
    },
  },
});

/**
 * 在文档中查找，返回匹配的坐标
 * @param {Node} doc
 * @param {String} searchText
 * @returns [{from:Number,to:Number}]
 */
function searchDoc(doc, searchText) {
  const res = [];
  const mergedTextNodes = [];
  let index = 0;

  if (!searchText) {
    return res;
  }

  doc.descendants((node, pos) => {
    if (node.isText) {
      if (mergedTextNodes[index]) {
        mergedTextNodes[index] = {
          text: mergedTextNodes[index].text + node.text,
          pos: mergedTextNodes[index].pos,
        };
      } else {
        mergedTextNodes[index] = {
          text: node.text,
          pos,
        };
      }
    } else {
      index += 1;
    }
  });
  const caseSensitive = false;
  const findRegExp = RegExp(searchText, !caseSensitive ? "gui" : "gu");
  mergedTextNodes.forEach(({ text, pos }) => {
    let m;
    while ((m = findRegExp.exec(text))) {
      if (m[0] === "") {
        break;
      }

      res.push({
        from: pos + m.index,
        to: pos + m.index + m[0].length,
      });
    }
  });
  return res;
}
/**
 * 根据 pm pos 滚动
 * @param {number} pos
 */
function scrollIntoViewByPmPos(pos) {
  const { node } = window.view.domAtPos(pos);
  if (node) {
    node.scrollIntoView?.(false);
  }
}
