"use strict"

/**
 * THIS FILE SETS UP AN IN-MEMORY DATABASE FOR
 * TESTING PURPOSES ONLY.
 */

// Get the tools.
const Waterline = require("waterline")
const sailsMemoryAdapter = require("sails-memory")
const waterline = new Waterline()

// Create a config.
const config = {
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
const user_collection = Waterline.Collection.extend({
  identity: "user",
  connection: "default",
  attributes: {
    firstName: "string",
    lastName: "string",
    pets: {
      collection: "pet",
      via: "owner"
    }
  },
  associations: [
    {
      alias: "pets"
    }
  ],
  get_self_link: values => `http://localhost:1811/user/${values.id}`,
  get_next_link: () => false,
  get_related_link: values => `http://localhost:1811/pet/${values.id}`,
  get_meta: {
    copyright: "New World Code 2016",
    author: "New World Code hello@newworld.codes <https://newworld.codes>"
  }
})

const pet_collection = Waterline.Collection.extend({
  identity: "pet",
  connection: "default",
  attributes: {
    breed: "string",
    type: "string",
    name: "string",

    // Add a reference to User.
    owner: {
      model: "user"
    },

    // Add a reference to Collar.
    collar: {
      model: "collar"
    }
  },

  associations: [
    {
      alias: "owner"
    },
    {
      alias: "collar"
    }
  ],

  get_next_link: (values, meta) => {
    switch (meta.context) {
    case "relationship":
      return
    default:
      return `http://localhost:1811/pet/?page=${meta.page + 1}`
    }
  },
  get_last_link: (values, meta) => {
    switch (meta.context) {
    case "relationship":
      return
    default:
      return `http://localhost:1811/pet/?page=${Math.max(meta.page - 1, 0)}`
    }
  }
})

const collar_collection = Waterline.Collection.extend({
  identity: "collar",
  connection: "default",
  attributes: {
    color: "string"
  }
})

// Register the collections.
waterline.loadCollection(user_collection)
waterline.loadCollection(pet_collection)
waterline.loadCollection(collar_collection)

// Export.
module.exports = function start(callback) {
  waterline.initialize(config, function(err, ontology) {
    ontology.collections.user.create({
      firstName: "Neil",
      lastName: "Armstrong"
    })
    .then(function (user) {
      ontology.collections.collar.create([
        {
          color: "red"
        },
        {
          color: "blue"
        }
      ])
      .then(function(collars) {
        return ontology.collections.pet.create([
          {
            breed: "beagle",
            type: "dog",
            name: "Astro",
            owner: user.id,
            collar: collars[0].id
          },
          {
            breed: "beagle",
            type: "dog",
            name: "Cosmo",
            owner: user.id,
            collar: collars[1].id
          }
        ])
      })
      // .then(function(pets) {
      //   ontology.collections.pet.find().populateAll().exec(console.log.bind(console))
      // })

      return ontology
    })
    .then(callback)
  })
}
