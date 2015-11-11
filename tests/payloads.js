"use strict"

module.exports.error = {
  collection: "user",
  payload: new Error("I'm an error and I'm annoying.")
}

module.exports.simple = {
  collection: "user",
  payload: [ {
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
}

module.exports.single = {
  collection: "user",
  payload: {
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
  }
}

module.exports.multi = {
  collection: "user",
  payload: [ {
    pets: [ {
      breed: "beagle",
      type: "dog",
      name: "Astro",
      owner: 1,
      createdAt: "2015-11-10T12:41:16.873Z",
      updatedAt: "2015-11-10T12:41:16.873Z",
      id: 1
    }, {
      breed: "beagle",
      type: "dog",
      name: "Cosmo",
      owner: 1,
      createdAt: "2015-11-10T12:41:16.873Z",
      updatedAt: "2015-11-10T12:41:16.873Z",
      id: 2
    } ],
    firstName: "Neil",
    lastName: "Armstrong",
    createdAt: "2015-11-10T12:41:16.866Z",
    updatedAt: "2015-11-10T12:41:16.866Z",
    id: 1
  },
  {
    pets: [ {
      breed: "beagle",
      type: "dog",
      name: "Astro",
      owner: 1,
      createdAt: "2015-11-10T12:41:16.873Z",
      updatedAt: "2015-11-10T12:41:16.873Z",
      id: 1
    }, {
      breed: "beagle",
      type: "dog",
      name: "Cosmo",
      owner: 1,
      createdAt: "2015-11-10T12:41:16.873Z",
      updatedAt: "2015-11-10T12:41:16.873Z",
      id: 2
    } ],
    firstName: "Dave",
    lastName: "Weckle",
    createdAt: "2015-11-10T12:41:16.866Z",
    updatedAt: "2015-11-10T12:41:16.866Z",
    id: 2
  } ]
}

module.exports.model = {
  collection: "pet",
  payload: [
    {
      owner:{
        firstName:"Neil",
        lastName:"Armstrong",
        createdAt:"2015-11-11T13:56:01.844Z",
        updatedAt:"2015-11-11T13:56:01.844Z",
        id:1
      },
      collar:{
        color:"red",
        createdAt:"2015-11-11T13:56:01.860Z",
        updatedAt:"2015-11-11T13:56:01.860Z",
        id:1
      },
      breed:"beagle",
      type:"dog",
      name:"Astro",
      createdAt:"2015-11-11T13:56:01.918Z",
      updatedAt:"2015-11-11T13:56:01.918Z",
      id:1
    },
    {
      owner:{
        firstName:"Neil",
        lastName:"Armstrong",
        createdAt:"2015-11-11T13:56:01.844Z",
        updatedAt:"2015-11-11T13:56:01.844Z",
        id:1
      },
      collar:{
        color:"blue",
        createdAt:"2015-11-11T13:56:01.860Z",
        updatedAt:"2015-11-11T13:56:01.860Z",
        id:2
      },
      breed:"beagle",
      type:"dog",
      name:"Cosmo",
      createdAt:"2015-11-11T13:56:01.918Z",
      updatedAt:"2015-11-11T13:56:01.918Z",
      id:2
    }
  ]
}
