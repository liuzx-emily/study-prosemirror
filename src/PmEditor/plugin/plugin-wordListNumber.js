import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const plugin_wordListNumber = new Plugin({
  props: {
    decorations(state) {
      const decos = [];
      processDoc_getListNumber(state.doc, (node, pos, numberArr) => {
        const deco = Decoration.node(pos, pos + node.nodeSize, {
          "list-item-number": numberArr.join("."), // 这里直接修改 dom 属性值
          style: `margin-left:${node.attrs.listItemLevel * 18}px`, // 顺便把缩进处理了
        });
        decos.push(deco);
      });
      return DecorationSet.create(state.doc, decos);
    },
  },
});

/**
 * 计算文档中所有 wordList 节点的序号
 * @param {Node} doc doc节点
 * @param {Function} handler function(node,pos,numberArr)
 */
// TODO 列表中的第一项level不是0时，序号算的不对
function processDoc_getListNumber(doc, handler) {
  const listMap = new Map();
  doc.descendants((node, pos) => {
    if (node.type.name === "wordList") {
      const listId = node.attrs.listId;
      const sameListItems = listMap.get(listId) ?? [];
      sameListItems.push({
        node,
        pos,
        level: parseInt(node.attrs.listItemLevel),
      });
      listMap.set(listId, sameListItems);
    }
  });
  for (const [listId, sameListItems] of listMap) {
    // 补齐可能缺少的层级
    patchMissingLevels(sameListItems);
    // 构造成树
    const tree = convertToTree(sameListItems);
    // 给树中的每一项设置编号
    setNumber(tree, handler);
  }
  // 补齐可能缺少的层级
  function patchMissingLevels(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
      var level1 = arr[i].level;
      var level2 = arr[i + 1].level;

      if (level1 + 1 < level2) {
        var newLevel = level1 + 1;
        var newItem = { level: newLevel };
        arr.splice(i + 1, 0, newItem);
      }
    }

    return arr;
  }
  // 构造成树
  function convertToTree(arr) {
    var root = { children: [] }; // 根节点
    var stack = [root]; // 用于维护父节点的栈

    for (var i = 0; i < arr.length; i++) {
      var current = arr[i];
      var level = current.level;

      var parent = null;
      while (stack.length > 0) {
        var last = stack[stack.length - 1];
        if (level > last.level) {
          parent = last;
          break;
        }
        stack.pop();
      }

      var newNode = { ...current, children: [] };
      if (parent) {
        parent.children.push(newNode);
      } else {
        root.children.push(newNode);
      }

      stack.push(newNode);
    }

    return root.children;
  }
  // 给树中的每一项设置编号
  function setNumber(tree, handler, prefixArr = []) {
    tree.forEach((o, index) => {
      const numberArr = prefixArr.concat([index + 1]); //从1计数
      if (o.node) {
        handler(o.node, o.pos, numberArr);
      }
      setNumber(o.children, handler, numberArr);
    });
  }
}
