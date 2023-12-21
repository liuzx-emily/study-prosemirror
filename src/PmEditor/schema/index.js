import { Schema } from "prosemirror-model";

// schema-basic.js 和 prosemirror-schema-basic 包内容相同，复制出来是为了开发时方便查找对比。
// prosemirror-schema-basic 包中定义了所有常用的 nodes 和 marks，除了 list。
import { nodes as nodes_basic, marks as marks_basic } from "./schema-basic";

const schema = new Schema({
  nodes: nodes_basic,
  marks: marks_basic,
});

export default schema;
