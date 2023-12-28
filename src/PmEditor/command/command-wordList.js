import { setBlockType } from "prosemirror-commands";
import { isNodeActive } from "../utils/tiptap-isActive";

let index = 100;
export function toggleWordList() {
  return function (state, dispatch) {
    const wordListType = state.schema.nodes.wordList;
    if (isNodeActive(state, wordListType)) {
      const paragraphType = state.schema.nodes.paragraph;
      return setBlockType(paragraphType)(state, dispatch);
    } else {
      // TODO 当选区中既有列表又有普通段落时，不应该修改选区内列表的 listId 和 listItemLevel
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
      return setBlockType(wordListType, { listId: index++, listItemLevel: 0 })(state, dispatch);
    }
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
