"use strict"

/**
 * THIS FILE SETS UP AN IN-MEMORY DATABASE FOR
 * TESTING PURPOSES ONLY.
 */

var format = require("util").format

// Get the tools.
var Waterline = require("waterline")
var sailsMemoryAdapter = require("sails-memory")
var waterline = new Waterline()

// Create a config.
var config = {
  adapters: {
    memory: sailsMemoryAdapter
  },

  connections: {
    default: {
      adapter: "memory"
    }
  }
}

// Create the collections.
var user_collection = Waterline.Collection.extend({
  identity: "user",
  connection: "default",
  attributes: {
    firstName: "string",
    lastName: "string",
    pets: {
      collection: "pet",
      via: "owner"
    }
  }
})

var pet_collection = Waterline.Collection.extend({
  identity: "pet",
  connection: "default",
  attributes: {
    breed: "string",
    type: "string",
    name: "string",

    // Add a reference to User
    owner: {
      model: "user"
    }
  },

  get_self_link: function(values) {
    return format("https://example.com/pets/%s", values.id)
  },

  get_next_link: function(values) {
    return format("https://example.com/pets/%s", values.id)
  },

  get_last_link: function(values) {
    return format("https://example.com/pets/%s", values.id)
  }
})

// Register the collections.
waterline.loadCollection(user_collection)
waterline.loadCollection(pet_collection)

// Export.
module.exports = function start(callback) {
  waterline.initialize(config, function(err, ontology) {
    ontology.collections.user.create({
      firstName: "Neil",
      lastName: "Armstrong"
    })
    .then(function (user) {
      ontology.collections.pet.create([
        {
          breed: "beagle",
          type: "dog",
          name: "Astro",
          owner: user.id
        },
        {
          breed: "beagle",
          type: "dog",
          name: "Cosmo",
          owner: user.id
        }
      ])

      return ontology
    })
    .then(callback)
  })
}
