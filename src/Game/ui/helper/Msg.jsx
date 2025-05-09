import { calcLength } from "../../utils/string";

export default {
  onMessage(data) {
    const { width, pixelRatio } = this.$config.screen;
    data = data + "";
    const length = calcLength(data);
    const fontSize = 16;
    const fontWidth = ((fontSize / 2) * (length + 1)) / pixelRatio;
    const msg = {
      message: data,
      tick: 60,
      messageStyle: {
        position: {
          x: width / 2,
        },
        size: {
          width: fontWidth,
        },
        border: {
          width: 2,
          color: "white",
        },
      },
    };
    this.messages.unshift(msg);
  },

  onCreate() {
    this.messages = [];
    this.$event.on("message", this.onMessage);
  },

  onDestroy() {
    this.$event.off("message", this.onMessage);
  },

  calc() {
    this.messages = this.messages.filter((config) => {
      config.tick--;
      return config.tick > 0;
    });
  },

  render() {
    this.calc();
    return this.messages.map((config, index) => {
      const { message, messageStyle, tick } = config;
      const style = { globalAlpha: tick / 60 };
      return (
        <view
          style={style}
          align="center"
          text={message}
          position={messageStyle.position}
          size={{ height: 1, width: 5 }}
          bgColor="rgba(0,0,0,.7)"
        ></view>
      );
    });
  },
};
