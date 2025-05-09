import { baseStyle } from "../const/style";
import Draw from "./Draw";
import { defaultHeight, defaultWidth } from "../const/box";
import {
  isArray,
  isDisalbedElement,
  isComponent,
  isElement,
} from "../utils/type";
const mouseEvents = [
  "Click",
  // "ContextMenu",
  // "Wheel",
  // "MouseDown",
  // "MouseUp",
  // "MouseMove",
];
const figureEvents = ["TouchStart", "TouchUp", "TouchMove"];

const keyEvents = ["KeyDown", "KeyUp"];

const listEvents = [...mouseEvents, ...figureEvents];

const map = Object.create(null);

[...listEvents, ...keyEvents].forEach((name) => {
  map[name.toLocaleLowerCase()] = `on${name}`;
});
export default class EventStream {
  constructor(engine) {
    this.$render = engine.$render;
    this.canvas = this.$render.canvas;
    this.$engine = engine;
    this.currentFramesList = [];
    this.bindEvents();

    const canvas = this.canvas;
    this.canvas.$offsetWidth = canvas.offsetWidth;
    this.canvas.$offsetHeight = canvas.offsetHeight;
  }
  callback = (e) => {
    const canvas = this.canvas;
    const { pixelRatio = 32 } = this.$engine.$config;
    const { $offsetWidth, $offsetHeight, width, height } = canvas;

    e.canvasX = (e.offsetX / $offsetWidth) * width;
    e.canvasY = (e.offsetY / $offsetHeight) * height;
    e.gameX = Math.floor(e.canvasX / pixelRatio);
    e.gameY = Math.floor(e.canvasY / pixelRatio);
    e.name = map[e.type];
    // e.preventDefault();
    this.colletEvent(e);
  };
  colletEvent(e) {
    this.currentFramesList.push(e);
  }
  runEvent(element, name, e) {
    if (!element) {
      return;
    }
    const { props, offsetParent } = element;

    e.props = props;
    props?.[name]?.(e, props);

    !e.cancelBubble && this.runEvent(offsetParent, name, e);
  }
  runEvents() {
    this.currentFramesList.forEach((e) => {
      const { name, $node } = e;
      this.runEvent($node, name, e);
    });
    // const length = this.currentFramesList.length;
    // this.currentFramesList.splice(0, length);
    this.currentFramesList = [];
  }
  bind(events, dom) {
    events.forEach((name) => {
      dom.addEventListener(name.toLowerCase(), this.callback, {
        passive: false,
      });
    });
  }
  bindEvents() {
    const canvas = this.canvas;
    this.bind(listEvents, canvas);
    this.bind(keyEvents, window);
  }
  unbindEvents() {
    const canvas = this.canvas;
    listEvents.forEach((name) => {
      document.addEventListener(name.toLowerCase(), this.callback, {
        passive: false,
      });
    });
  }

  calcChildren(node, offsetX, offsetY, offsetParent) {
    const { children } = node;
    children.forEach((child) =>
      this.calcAnything(child, offsetX, offsetY, node)
    );
  }
  calcNode(node, offsetX, offsetY, offsetParent) {
    // 非class component
    // view node
    // { props, children }
    const { props } = node;
    if (props) {
      const { position, size } = props;

      const { x = 0, y = 0 } = position || {};
      const { width = 0, height = 0 } = size || {};

      const { align, verticalAlign } = props;
      if (align) {
        const offsetAlign = { left: 0, center: -0.5, right: -1 };
        const offsetAlignRate = offsetAlign[align];
        offsetX += x + width * offsetAlignRate;
      } else {
        offsetX += x;
      }
      if (verticalAlign) {
        const offsetVerticalAlign = { top: 0, middle: -0.5, bottom: -1 };
        const offsetVerticalAlignRate = offsetVerticalAlign[verticalAlign];
        offsetY += y + height * offsetVerticalAlignRate;
      } else {
        offsetY += y;
      }
    }
    node.offsetParent = offsetParent;
    this.calcEvent(node, offsetX, offsetY, offsetParent);
    this.calcChildren(node, offsetX, offsetY, offsetParent);
  }

  calcEvent(node, offsetX, offsetY) {
    // events of mouse
    const { props } = node;
    if (props) {
      const { size } = props;
      const { width = 0, height = 0 } = size || {};
      this.currentFramesList.forEach((e) => {
        if (e.code) {
          e.$node = node
          return;
        }
        const { gameX, gameY } = e;
        if (
          gameX >= offsetX &&
          gameX < width + offsetX &&
          gameY >= offsetY &&
          gameY < height + offsetY
        ) {
          e.$node = node;
        }
      });
    }
  }

  calcAnything(createdNode, offsetX, offsetY, offsetParent) {
    // undefined null
    // string number
    // array
    // component
    // view node
    if (isElement(createdNode)) {
      // view node
      this.calcNode(createdNode, offsetX, offsetY, offsetParent);
      return;
    }
    if (isDisalbedElement(createdNode)) {
      return;
    }
    if (isArray(createdNode)) {
      createdNode.forEach((child) =>
        this.calcAnything(child, offsetX, offsetY, offsetParent)
      );
      return;
    }
    if (isComponent(createdNode)) {
      this.calcAnything(createdNode.$node, offsetX, offsetY, offsetParent);
      return;
    }
  }
  calc(node) {
    this.calcAnything(node, 0, 0, null);
    this.runEvents();
  }
}
