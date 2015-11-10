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
  return {
    last: collection.get_last_link(),
    next: collection.get_next_link(),
    self: collection.get_self_link()
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
