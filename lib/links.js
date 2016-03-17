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
    this.entity_url_base = `${generator.api_root}/${generator.collection.adapter.identity}`

    return generator.run(this.generate, this)
  }

  generate(values) {
    const links = {}
    const generator = this.generator

    // Check for each method and add any links we have methods for,
    if (generator.collection.get_self_link) {
      links.self = generator.collection.get_self_link(values) || `${this.entity_url_base}/${values.id}`
    }

    if (generator.collection.get_next_link) {
      links.next = generator.collection.get_next_link(values)
    }

    if (generator.collection.get_last_link) {
      links.last = generator.collection.get_last_link(values)
    }

    if (generator.collection.get_related_link) {
      links.last = generator.collection.get_related_link(values)
    }

    if (Object.keys(links).length > 0) {
      return links
    }
    else {
      return
    }
  }
}
// Export our functionality.
module.exports = Links_Generator
