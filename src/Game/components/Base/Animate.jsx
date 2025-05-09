export default {
  onCreate () {
    const defaultAnimateConfig = {
      start: 0,
      end: 3,
      interval: 60,
      delta: 1,
      sx: 0,
      sy: 0,
      tick: -1,
    }
    this.animateConfig = Object.assign(
      Object.create(null),
      defaultAnimateConfig,
      this.props.animate,
    )
  },

  runAnimateNext () {
    const { animateConfig } = this
    animateConfig.tick++
    if (animateConfig.tick >= animateConfig.interval) {
      animateConfig.tick = 0
      animateConfig.sx++
      if (animateConfig.sx > animateConfig.end) {
        animateConfig.sx = 0
      }
    }
  },

  render () {
    this.runAnimateNext()
    const { sx, sy } = this.animateConfig
    return (
      <view
        image={this.props.image}
        style={{ ...this.props.style, sx, sy }}
      ></view>
    )
  },
}
