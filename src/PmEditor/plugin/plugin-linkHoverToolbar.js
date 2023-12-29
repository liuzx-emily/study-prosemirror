import { Plugin } from "prosemirror-state";

export function usePlugin_linkHoverToolbar(LinkHoverToolbarRef, LinkSettingsPanelRef) {
  const plugin_linkHoverToolbar = new Plugin({
    props: {
      handleDOMEvents: {
        mousemove(view, e) {
          // 1. 找 pos
          // const pos = view.posAtDOM(e.target);
          const pos = view.posAtCoords({ top: e.clientY, left: e.clientX })?.pos;
          // 2. 找 pmNode
          const node = view.state.doc.nodeAt(pos);
          // 3. node 有没有 link mark
          const marks = node?.marks;
          const linkMark = marks?.find((mark) => (mark.type.name = "link"));
          if (!linkMark) {
            LinkHoverToolbarRef.value.hideToolbar();
          } else {
            let nodeHeadPos;
            view.state.doc.descendants((_node, pos) => {
              if (nodeHeadPos !== undefined) return false;
              if (node === _node) {
                nodeHeadPos = pos;
                // nodeTailPos = pos + node.nodeSize;
              }
            });
            const { left: headLeft, top: headTop } = view.coordsAtPos(nodeHeadPos);

            // 跨行还得取父元素段首、段尾的位置。但是我懒得算了！就跟 link 起始位置对齐吧
            LinkHoverToolbarRef.value.showToolbar({
              left: headLeft,
              top: headTop,
              text: node.text,
              link: linkMark.attrs.href,
              from: nodeHeadPos,
              to: nodeHeadPos + node.nodeSize,
            });
          }
        },
        mousedown() {
          // 用户拖选文字不会触发 click，用 mousedown 能监听到 click + 拖选
          LinkSettingsPanelRef.value.hideSettingsPanel();
        },
      },
    },
  });
  return plugin_linkHoverToolbar;
}
