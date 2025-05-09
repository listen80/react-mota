import { baseStyle } from "../const/style";
import Draw from "./Draw";
import { defaultHeight, defaultWidth } from "../const/box";
import {
  isArray,
  isDisalbedElement,
  isComponent,
  isElement,
  isUndefined,
} from "../utils/type";
export default class Render extends Draw {
  constructor(config, $loader) {
    super();
    this.config = config.screen;
    this.$loader = $loader;
    this.initCanvas(config);
  }

  getImage(src) {
    const image = this.$loader.$resource.image[src];
    return image;
  }

  initCanvas() {
    const { pixelRatio, el, width = 13, height = 13 } = this.config;

    const canvas = document.createElement("canvas");
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;

    const dom = document.querySelector(el || "#game") || document.body;
    dom && dom.appendChild(this.canvas);

    this.mergeStyle(baseStyle);
    this.getCanvasRenderRect();
  }

  getCanvasRenderRect() {
    const canvas = this.canvas;

    this.canvas.$offsetWidth = canvas.offsetWidth;
    this.canvas.$offsetHeight = canvas.offsetHeight;
  }

  mergeStyle(style) {
    Object.assign(this.context, style);
  }

  drawNode(node, offsetX, offsetY, offsetParent) {
    const { context } = this;
    context.save();
    const { children, props } = node;
    if (props) {
      const {
        style,
        image,
        text,
        border,
        bgImage,
        bgColor,
        lineGradient,
      } = props;

      if (style) {
        this.mergeStyle(style);
      }

      if (bgColor) {
        this.drawBackgroundColor(node, offsetX, offsetY);
      }

      if (bgImage) {
        this.drawBackgroundImage(node, offsetX, offsetY);
      }

      if (image) {
        this.drawImage(node, offsetX, offsetY);
      }

      if (text != null) {
        this.drawText(node, offsetX, offsetY, offsetParent);
      }

      if (border) {
        this.drawBorder(node, offsetX, offsetY);
      }

      if (lineGradient) {
        this.drawLineGradient(node, offsetX, offsetY);
      }
    }

    children.forEach((child) =>
      this.renderAnything(child, offsetX, offsetY, node)
    );

    context.restore();
  }

  renderAnything(createdNode, offsetX, offsetY, offsetParent) {
    // undefined null
    // string number
    // array
    // component
    // view node
    if (isUndefined(createdNode)) {
      return;
    }
    if (isElement(createdNode)) {
      // view node
      this.renderElementNode(createdNode, offsetX, offsetY, offsetParent);
      return;
    }
    if (isDisalbedElement(createdNode, offsetParent)) {
      this.drawTextPrimitiv(createdNode, offsetX, offsetY, offsetParent);
      return;
    }
    if (isArray(createdNode)) {
      createdNode.forEach((child) =>
        this.renderAnything(child, offsetX, offsetY, offsetParent)
      );
      return;
    }
    if (isComponent(createdNode)) {
      this.renderAnything(createdNode.$node, offsetX, offsetY, offsetParent);
      return;
    }
  }

  renderElementNode(node, offsetX, offsetY, offsetParent) {
    // 非class component
    // view node
    // { props, children }
    if (node.props) {
      const { position, size } = node.props;

      const { x = 0, y = 0 } = position || {};
      const { width = 0, height = 0 } = size || {};

      const { align = "left", verticalAlign = "top" } = node.props;
      const offsetAlign = { left: 0, center: -0.5, right: -1 };
      const offsetAlignRate = offsetAlign[align];
      offsetX += x + width * offsetAlignRate;

      const offsetVerticalAlign = { top: 0, middle: -0.5, bottom: -1 };
      const offsetVerticalAlignRate = offsetVerticalAlign[verticalAlign];
      offsetY += y + height * offsetVerticalAlignRate;
    }
    this.drawNode(node, offsetX, offsetY, offsetParent);
  }

  render(createdNode) {
    this.clearRect();
    this.renderAnything(createdNode, 0, 0, null);
  }
}
