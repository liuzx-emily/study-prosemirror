import { Schema } from "prosemirror-model";

// schema-basic.js 和 prosemirror-schema-basic 包内容相同，复制出来是为了开发时方便查找对比。
// prosemirror-schema-basic 包中定义了所有常用的 nodes 和 marks，除了 list。
import { nodes as nodes_basic, marks as marks_basic } from "./schema-basic";

import { emoji } from "./schema-emoji";
import { wordList } from "./schema-wordList";

const schema = new Schema({
  // DOMParser.matchTag 中是按照 nodes 定义时从前到后的顺序找的，先到先得。
  // p[list-id][list-item-level] 能通过 paragraph 和 wordList 的 parseDOM 验证，所以为了保证 wordList 优先级比 paragraph 高，要放在前面
  nodes: { wordList, ...nodes_basic, emoji },
  marks: marks_basic,
});

export default schema;
