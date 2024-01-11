import { setBlockType } from "prosemirror-commands";
import { isNodeActive } from "../utils/tiptap-isActive";

export function toggleWordList() {
  return function (state, dispatch) {
    const wordListType = state.schema.nodes.wordList;
    if (isNodeActive(state, wordListType)) {
      const paragraphType = state.schema.nodes.paragraph;
      return setBlockType(paragraphType)(state, dispatch);
    } else {
      // 根据上下文获取 listId：先看前一个一级节点是不是列表；若不是，再看后一个一级节点是不是列表
      let listId;
      const { $from, $to } = state.selection;
      const prevLevelOneNode = getPrevLevelOndeNode(state, $from);
      if (prevLevelOneNode?.type === wordListType) {
        listId = prevLevelOneNode.attrs.listId;
        return setBlockType(wordListType, { listId, listItemLevel: 0 })(state, dispatch);
      }
      const nextLevelOneNode = getNextLevelOneNode(state, $to);
      if (nextLevelOneNode?.type === wordListType) {
        listId = nextLevelOneNode.attrs.listId;
        return setBlockType(wordListType, { listId, listItemLevel: 0 })(state, dispatch);
      }
      return setBlockType(wordListType, { listId: guid(), listItemLevel: 0 })(state, dispatch);
      /**
       * 这段代码存在一个小问题：当选区中既有列表又有段落时，列表项的 listId 和 listItemLevel 也会被重新设置。
       *
       * 为了解决这个问题，我不对选区整体设置 setBlockType。而是找到选区中的非列表项（p h1），逐一计算 listId、执行 tr.setBlockType()。
       *
       * 但这样改完遇到更棘手的问题：假定文档为 p1+(p2+p3+p4+l1)+l2，括号内是选区
       * 先找到p2，发现前后都不是列表，所以p2属于新列表
       * 再找到p3，虽然给p2设置了 tr.setBlockType，但是还没有dispatch(tr)。p3不知道p2将会变为列表，所以p3又属于一个新新列表
       * 再找到p4，同理它也不知道p3将变为列表，它向后看发现l1是列表，所以p4和l1同属一个列表
       *
       * 暂时没想好怎么解决，还是先整体设置 setBlockType 吧。
       */
    }
  };
}

export function liftWordListItem() {
  return function (state, dispatch) {
    const wordListType = state.schema.nodes.wordList;
    const { from, to } = state.selection;
    const nodes = [];
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === wordListType && node.attrs.listItemLevel > 0) {
        nodes.push({ node, pos });
      }
    });
    if (nodes.length === 0) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      nodes.forEach(({ node, pos }) => {
        const level = node.attrs.listItemLevel - 1;
        tr.setNodeAttribute(pos, "listItemLevel", level);
      });
      dispatch(tr);
    }
    return true;
  };
}

export function sinkWordListItem() {
  return function (state, dispatch) {
    const wordListType = state.schema.nodes.wordList;
    const { from, to } = state.selection;
    const nodes = [];
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === wordListType && node.attrs.listItemLevel < 5) {
        nodes.push({ node, pos });
      }
    });
    if (nodes.length === 0) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      nodes.forEach(({ node, pos }) => {
        const level = node.attrs.listItemLevel + 1;
        tr.setNodeAttribute(pos, "listItemLevel", level);
      });
      dispatch(tr);
    }
    return true;
  };
}

/**
 * 获取前一个一级节点
 * @param {EditorState} state
 * @param {ResolvedPos} $pos
 * @returns Node | null
 */
function getPrevLevelOndeNode(state, $pos) {
  // ResolvedPos.index(depth) depth从0计数 index(0)代表在一级节点中排第几，即顶级节点doc的第几个child。返回值也是从0开始计数
  const levelOneNodeIndex = $pos.index(0);
  if (levelOneNodeIndex !== 0) {
    return state.doc.child(levelOneNodeIndex - 1);
  }
  return null;
}

/**
 * 获取下一个一级节点
 * @param {EditorState} state
 * @param {ResolvedPos} $pos
 * @returns Node | null
 */
function getNextLevelOneNode(state, $pos) {
  const levelOneNodeIndex = $pos.index(0);
  if (levelOneNodeIndex < state.doc.childCount - 1) {
    return state.doc.child(levelOneNodeIndex + 1);
  }
  return null;
}

function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
