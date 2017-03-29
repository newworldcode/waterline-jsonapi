"use strict"

class Meta_Generator {
  constructor(generator) {
    if (generator.collection.get_meta) {
      if (generator.collection.get_meta instanceof Function)
        return generator.collection.get_meta(generator.values)
      else
        return generator.collection.get_meta
    }
    else {
      return {}
    }
  }
}

module.exports = Meta_Generator
