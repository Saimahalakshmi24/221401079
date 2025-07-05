
const data = {
  urls: {},
};

module.exports = {
  saveUrl(shortcode, record) {
    data.urls[shortcode] = record;
  },
  getUrl(shortcode) {
    return data.urls[shortcode];
  },
  shortcodeExists(shortcode) {
    return !!data.urls[shortcode];
  },
  incrementClicks(shortcode, clickInfo) {
    if (data.urls[shortcode]) {
      data.urls[shortcode].clicks.push(clickInfo);
    }
  },
};
