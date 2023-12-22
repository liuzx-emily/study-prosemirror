// svg素材下载：https://icon-sets.iconify.design/noto/
const appleUrl = new URL("../../assets/svg/apple.svg", import.meta.url).href;
const bananaUrl = new URL("../../assets/svg/banana.svg", import.meta.url).href;
const cakeUrl = new URL("../../assets/svg/cake.svg", import.meta.url).href;
const pearUrl = new URL("../../assets/svg/pear.svg", import.meta.url).href;
const pineappleUrl = new URL("../../assets/svg/pineapple.svg", import.meta.url).href;
const watermelonUrl = new URL("../../assets/svg/watermelon.svg", import.meta.url).href;

export const emojiMap = {
  apple: { imgUrl: appleUrl, text: "苹果" },
  banana: { imgUrl: bananaUrl, text: "香蕉" },
  cake: { imgUrl: cakeUrl, text: "蛋糕" },
  pear: { imgUrl: pearUrl, text: "梨" },
  pineapple: { imgUrl: pineappleUrl, text: "菠萝" },
  watermelon: { imgUrl: watermelonUrl, text: "西瓜" },
};

export const emoji = {
  inline: true,
  attrs: {
    type: { default: "" },
    state: { default: "pic" }, // pic text
  },
  group: "inline",
  draggable: true,
  selectable: true,
  parseDOM: [
    {
      tag: "span[emoji-type]",
      // getAttrs如果返回false，说明不匹配。
      // 如果返回对象，说明匹配，返回的内容就是attrs的属性值。
      // 如果返回null或undefined，则等同于返回空对象，说明匹配但是没设置属性值。
      getAttrs(dom) {
        const type = dom.getAttribute("emoji-type");
        const state = dom.getAttribute("emoji-state") || "pic";

        return {
          type,
          state,
        };
      },
    },
  ],
  toDOM(node) {
    const type = node.attrs.type;
    const state = node.attrs.state;
    if (state === "pic") {
      // state=pic，显示图片
      // 写法1：描述性
      return [
        "span",
        { "emoji-type": type, "emoji-state": state },
        ["img", { src: emojiMap[type].imgUrl }],
      ];
      /*       // 写法2：手动创建 dom 元素
      const outerSpan = document.createElement("span");
      outerSpan.setAttribute("emoji-type", type);
      outerSpan.setAttribute("emoji-state", state);
      const img = document.createElement("img");
      img.setAttribute("src", emojiMap[type].imgUrl);
      outerSpan.appendChild(img);
      return outerSpan; */
      /*       // 写法3：描述性+手动创建结合起来
      const img = document.createElement("img");
      img.setAttribute("src", emojiMap[type].imgUrl);
      return ["span", { "emoji-type": type, "emoji-state": state }, img]; */
    } else {
      // state=text，显示文字
      // 手动创建dom元素，用innerHTML设置文本
      const innerTextSpan = document.createElement("span");
      innerTextSpan.innerHTML = `[${emojiMap[type].text}]`;
      const outerSpan = document.createElement("span");
      outerSpan.setAttribute("emoji-type", type);
      outerSpan.setAttribute("emoji-state", state);
      outerSpan.appendChild(innerTextSpan);
      return outerSpan;
    }
  },
};
