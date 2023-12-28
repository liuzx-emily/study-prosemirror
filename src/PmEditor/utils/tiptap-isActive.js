// 本文件中的方法都是从 @tiptap/core 中复制出来的
export function isNodeActive(state, typeOrName, attributes = {}) {
  const { from, to, empty } = state.selection;
  const type = typeOrName ? getNodeType(typeOrName, state.schema) : null;
  const nodeRanges = [];
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText) {
      return;
    }
    const relativeFrom = Math.max(from, pos);
    const relativeTo = Math.min(to, pos + node.nodeSize);
    nodeRanges.push({
      node,
      from: relativeFrom,
      to: relativeTo,
    });
  });
  const selectionRange = to - from;
  const matchedNodeRanges = nodeRanges
    .filter((nodeRange) => {
      if (!type) {
        return true;
      }
      return type.name === nodeRange.node.type.name;
    })
    .filter((nodeRange) => objectIncludes(nodeRange.node.attrs, attributes, { strict: false }));
  if (empty) {
    return !!matchedNodeRanges.length;
  }
  const range = matchedNodeRanges.reduce(
    (sum, nodeRange) => sum + nodeRange.to - nodeRange.from,
    0
  );
  return range >= selectionRange;
}

export function isMarkActive(state, typeOrName, attributes = {}) {
  const { empty, ranges } = state.selection;
  const type = typeOrName ? getMarkType(typeOrName, state.schema) : null;
  if (empty) {
    return !!(state.storedMarks || state.selection.$from.marks())
      .filter((mark) => {
        if (!type) {
          return true;
        }
        return type.name === mark.type.name;
      })
      .find((mark) => objectIncludes(mark.attrs, attributes, { strict: false }));
  }
  let selectionRange = 0;
  const markRanges = [];
  ranges.forEach(({ $from, $to }) => {
    const from = $from.pos;
    const to = $to.pos;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText && !node.marks.length) {
        return;
      }
      const relativeFrom = Math.max(from, pos);
      const relativeTo = Math.min(to, pos + node.nodeSize);
      const range = relativeTo - relativeFrom;
      selectionRange += range;
      markRanges.push(
        ...node.marks.map((mark) => ({
          mark,
          from: relativeFrom,
          to: relativeTo,
        }))
      );
    });
  });
  if (selectionRange === 0) {
    return false;
  }
  // calculate range of matched mark
  const matchedRange = markRanges
    .filter((markRange) => {
      if (!type) {
        return true;
      }
      return type.name === markRange.mark.type.name;
    })
    .filter((markRange) => objectIncludes(markRange.mark.attrs, attributes, { strict: false }))
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  // calculate range of marks that excludes the searched mark
  // for example `code` doesn’t allow any other marks
  const excludedRange = markRanges
    .filter((markRange) => {
      if (!type) {
        return true;
      }
      return markRange.mark.type !== type && markRange.mark.type.excludes(type);
    })
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  // we only include the result of `excludedRange`
  // if there is a match at all
  const range = matchedRange > 0 ? matchedRange + excludedRange : matchedRange;
  return range >= selectionRange;
}

function getNodeType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.nodes[nameOrType]) {
      throw Error(
        `There is no node type named '${nameOrType}'. Maybe you forgot to add the extension?`
      );
    }
    return schema.nodes[nameOrType];
  }
  return nameOrType;
}

function getMarkType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.marks[nameOrType]) {
      throw Error(
        `There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`
      );
    }
    return schema.marks[nameOrType];
  }
  return nameOrType;
}

function isRegExp(value) {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}

/**
 * Check if object1 includes object2
 * @param object1 Object
 * @param object2 Object
 */
function objectIncludes(object1, object2, options = { strict: true }) {
  const keys = Object.keys(object2);
  if (!keys.length) {
    return true;
  }
  return keys.every((key) => {
    if (options.strict) {
      return object2[key] === object1[key];
    }
    if (isRegExp(object2[key])) {
      return object2[key].test(object1[key]);
    }
    return object2[key] === object1[key];
  });
}
