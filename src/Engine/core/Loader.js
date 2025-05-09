import { loadJSON, loadText, loadImage } from "../utils/http";

const emptyImage = new Image();

export default class Loader {
  constructor() {
    this.loaded = 0;
    this.total = 0;
    this.loading = true;

    this.$resource = Object.create(null);
    this.$resource.maps = Object.create(null);
    this.$resource.shops = Object.create(null);
    this.$resource.image = Object.create(null);
    this.$resource.sprites = Object.create(null);
  }

  init(config) {
    // this.loading = true
    // config.init.map((item) => this.loadJSON(item))

    // .then(
    //   (...all) => {
    //     config.init.forEach((item, index) => {
    //       config[item] = all[index];
    //     });
    //   }
    // )
    this.config = config;
    this.loadMapping();
    this.loadImage();
    this.loadSprite();
  }

  checkStatus() {
    if (this.loaded === this.total) {
      this.loading = false;
    }
  }

  loadMapping() {
    this.config.resource.mapping.forEach((name) => {
      this.total++;
      loadText(`Data/${name}`).then((data) => {
        this.loaded++;
        this.$resource.mapping = data;
      });
    });
  }

  loadImage() {
    this.config.resource.images.forEach((name) => {
      this.total++;
      loadImage(`Image/${name}`).then((data) => {
        this.$resource.image[name] = data;
        this.loaded++;
        this.checkStatus();
      });
    });
  }

  loadMovie() {
    this.config.resource.images.forEach((name) => {
      this.total++;
      loadMovie(`Image/${name}`).then((data) => {
        this.$resource.image[name] = data;
        this.loaded++;
        this.checkStatus();
      });
    });
  }

  loadSprite() {
    this.config.resource.sprites.forEach((name) => {
      this.total++;
      loadImage(`Sprite/${name}.png`).then((data) => {
        this.$resource.image[name] = data;
        this.loaded++;
        this.checkStatus();
      });
      this.total++;
      loadText(`Sprite/${name}.dat`).then((data) => {
        this.$resource.sprites[name] = data;
        this.loaded++;
        this.checkStatus();
      });
    });
  }

  loadMap(id) {
    // if (this.$resource.maps[id]) {
    //   return Promise.resolve(this.$resource.maps[id]);
    // }
    this.loaded = 0;
    this.total = 0;

    this.total++;
    return loadJSON(`Maps/${id}.json`).then((data) => {
      this.$resource.maps[id] = data;
      this.loaded++;
      this.checkStatus();
      return data;
    });
  }

  loadShop(id) {
    // if (this.$resource.maps[id]) {
    //   return Promise.resolve(this.$resource.maps[id]);
    // }
    this.loaded = 0;
    this.total = 0;

    this.total++;
    return loadJSON(`Shops/${id}.json`).then((data) => {
      this.$resource.shops[id] = data;
      this.loaded++;
      this.checkStatus();
      return data;
    });
  }

  loadJSON(id) {
    this.loaded = 0;
    this.total = 0;

    this.total++;
    return loadJSON(`Data/${id}.json`).then((data) => {
      this.$resource.maps[id] = data;
      this.loaded++;
      this.checkStatus();
      return data;
    });
  }

  loadConfig() {
    return loadJSON("config.json");
  }

  loadImageNext(url) {
    this.$resource.image[url] = emptyImage;
    this.total++;
    if (!url) {
      return;
    }
    return loadImage(`Image/${url}`)
      .then((data) => {
        this.$resource.image[url] = data;
        this.loaded++;
        this.checkStatus();
      })
      .catch((e) => {});
  }
}
