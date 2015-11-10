"use strict"

// Get our tools.
var format = require("util").format

/**
 * Get a link to the next resource in the database.
 * @return {String} url to this resource.
 */
function get_next_link() {
  return undefined
}

/**
 * Get a link to the previous resource in the database.
 * @return {String} url to this resource.
 */
function get_prev_link() {
  return undefined
}

/**
 * Get a link to this resource.
 * @return {String} url to this resource.
 */
function get_self_link() {
  return format("%s/%s/%s", this.frontend_base_url, this.type, this.id)
}

// Export our helpers.
module.exports.get_next_link = get_next_link
module.exports.get_self_link = get_self_link
module.exports.get_prev_link = get_prev_link
