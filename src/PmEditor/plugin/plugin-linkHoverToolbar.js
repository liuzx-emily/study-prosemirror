import { Plugin } from "prosemirror-state";
import { getLinkTextNode } from "../command";
export function usePlugin_linkHoverToolbar(LinkHoverToolbarRef, LinkSettingsPanelRef) {
  const plugin_linkHoverToolbar = new Plugin({
    props: {
      handleDOMEvents: {
        mousemove(view, e) {
          // 1. 找 pos
          // const pos = view.posAtDOM(e.target);
          const pos = view.posAtCoords({ top: e.clientY, left: e.clientX })?.pos;
          // 2. 获取 pos所在位置的 link 的信息
          const linkTextNodeInfo = getLinkTextNode(view.state, pos);
          if (!linkTextNodeInfo) {
            LinkHoverToolbarRef.value.hideToolbar();
            return;
          }
          const { start, end, node: linkTextNode } = linkTextNodeInfo;
          const linkMark = linkTextNode.marks.find((mark) => mark.type.name === "link");
          const { left: headLeft, top: headTop } = view.coordsAtPos(start);
          // 跨行还得取父元素段首、段尾的位置。但是我懒得算了！就跟 link 起始位置对齐吧
          LinkHoverToolbarRef.value.showToolbar({
            left: headLeft,
            top: headTop,
            text: linkTextNode.text,
            link: linkMark.attrs.href,
            from: start,
            to: end,
          });
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
