"use strict"

/**
 * Get the links for a collection:
 * next, self and
 * @param  {Waterline.Collection} collection to get links for and from.
 * @return {Object} Object containing the last, next and self links.
 */
function get_links(values, collection) {
  var links = {}

  // Check for each method and add any links we have methods for,
  if (collection.get_self_link) {
    links.self = collection.get_self_link(values, collection)
  }

  if (collection.get_next_link) {
    links.next = collection.get_next_link(values, collection)
  }

  if (collection.get_last_link) {
    links.last = collection.get_last_link(values, collection)
  }

  if (Object.keys(links).length > 0) {
    return links
  }
  else {
    return
  }
}

// Export our functionality.
module.exports.get = get_links
