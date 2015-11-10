"use strict"

// Get our tools.
var tape = require("tape")
var waterline_jsonapi = require("../index")
var get_ontology = require("./waterline")

// The test payload.
var payload = [ {
  pets: [ {
    breed: "beagle",
    type: "dog",
    name: "Astro",
    owner: 1,
    createdAt: "2015-11-10T12:41:16.873Z",
    updatedAt: "2015-11-10T12:41:16.873Z",
    id: 1
  } ],
  firstName: "Neil",
  lastName: "Armstrong",
  createdAt: "2015-11-10T12:41:16.866Z",
  updatedAt: "2015-11-10T12:41:16.866Z",
  id: 1
} ]

get_ontology(function (ontology) {
  tape("Test payload", function(test) {
    test.plan(1)
    test.doesNotThrow(function() {
      waterline_jsonapi.new_from_values(payload, ontology.collections.user)
    }, "Does not throw when creating payload.")
  })
})
