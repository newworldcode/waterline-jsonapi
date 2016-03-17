"use strict"

class Meta_Generator {
  constructor(generator) {
    if (generator.collection.get_meta) {
      return generator.collection.get_meta(generator.values)
    }
    else {
      return {}
    }
  }
}

module.exports = Meta_Generator
