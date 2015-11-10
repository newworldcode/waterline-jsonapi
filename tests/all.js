"use strict"

// Get our tools.
var tape = require("tape")
var waterline_jsonapi = require("../index")
var get_ontology = require("./waterline")

// The test payload.
var payloads = require("./payloads")

get_ontology(function (ontology) {
  // tape("Test simple payload", function(test) {
  //   test.plan(1)
  //   test.doesNotThrow(function() {
  //     waterline_jsonapi.new_from_values(payloads.simple, ontology.collections.user)
  //   }, "Does not throw when creating simple payload.")
  // })

  tape("Test complex payload", function(test) {
    test.plan(1)
    test.doesNotThrow(function() {
      waterline_jsonapi.new_from_values(payloads.complex, ontology.collections.user)
    }, "Does not throw when creating complex payload.")
  })
})
