"use strict"

/**
 * THIS FILE SETS UP AN IN-MEMORY DATABASE FOR
 * TESTING PURPOSES ONLY.
 */

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
      return ontology.collections.pet.create({
        breed: "beagle",
        type: "dog",
        name: "Astro",
        owner: user.id
      })
    })
    .then(function() {
      callback(ontology)
      return ontology.collections.user.find().populate("pets")
    })
  })
}
