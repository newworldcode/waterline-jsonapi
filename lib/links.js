"use strict"

// Get some tools.
var helpers = require("./collection-helpers")

/**
 * Get the links for a collection:
 * next, self and
 * @param  {Waterline.Collection} collection to get links for and from.
 * @return {Object} Object containing the last, next and self links.
 */
function get_links(collection) {
  var links = {}

  // Check for each method and add any links we have methods for,
  if (collection.get_self_link) {
    links.self = collection.get_self_link()
  }

  if (collection.get_next_link) {
    links.next = collection.get_next_link()
  }

  if (collection.get_last_link) {
    links.last = collection.get_last_link()
  }

  if (Object.keys(links).length > 0) {
    return links
  }
  else {
    return
  }
}

/**
 * Add the functions required to get links from.
 * @param  {Waterline.Collection} collection to extend with links functions.
 * @return {Waterline.Collection} modified collection
 */
function extend_waterline_collection(collection) {
  collection.get_last_link = helpers.get_prev_link
  collection.get_next_link = helpers.get_next_link
  collection.get_self_link = helpers.get_self_link

  return collection
}

// Export our functionality.
module.exports.get = get_links
module.exports.extend_waterline_collection = extend_waterline_collection
