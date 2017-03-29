"use strict"

/**
 * Get the links for a collection:
 * next, self and
 * @param  {Waterline.Collection} collection to get links for and from.
 * @return {Object} Object containing the last, next and self links.
 */
class Links_Generator {
  constructor(generator) {
    this.generator = generator
    this.entity_url_base = `${generator.api_root || ""}/${generator.collection.adapter.identity}`

    const links = this.generate(generator.collection, generator.values)

    return this.optimise(links)
  }

  generate(collection, values) {
    const links = {}
    const is_array = Array.isArray(this.generator.values)

    // Check for each method and add any links we have methods for.
    if (collection.get_self_link) {
      links.self = collection.get_self_link(values, this.generator.meta)
    }
    else if (is_array) {
      links.self = this.entity_url_base
    }
    else {
      links.self = `${this.entity_url_base}/${values.id}`
    }

    if (collection.get_next_link) {
      links.next = collection.get_next_link(values, this.generator.meta)
    }

    if (collection.get_last_link) {
      links.last = collection.get_last_link(values, this.generator.meta)
    }

    if (collection.get_related_link && !is_array) {
      links.last = collection.get_related_link(values, this.generator.meta)
    }

    return links
  }

  /**
   * Remove any bad values from the object
   * such as undefined, null or false
   * @return {Object} optimised object.
   */
  optimise(links) {
    Object.keys(links)
      .forEach(key => {
        if (
          !links[key] ||
          links[key].length === 0
        ) {
          delete links[key]
        }
      })

    return links
  }
}
// Export our functionality.
module.exports = Links_Generator
