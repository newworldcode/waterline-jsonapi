# waterline-jsonapi

Create [JSON API][json-api] compliant payloads from Waterline blueprints and query results and get a promise in return.

`npm i waterline-jsonapi --save`

# Usage

You need only your query results and your collection to get started. Assuming the [example][getting-started] `user` and `pet` collections.

```js
const Waterline_JSONAPI = require("waterline-jsonapi")

// The query
User
  .find()
  .populate("pets")
  
  // Create a JSON API payload from the results.
  .then(user_and_pets => {
    new Waterline_JSONAPI(user_and_pets, User).generate()
      // Reply with your data.
      .then(payload => reply(payload))
      
      // If there was an unlikely error, you can catch here.
      .catch(error => reply(error))
  })
```

The above will reply with a valid JSONAPI payload, the same works by passing in an `Error` or an object with `is_error: true`.

## Links

Links are retrieved from your collections if they have any of the following functions.

All links functions are passed a single resource object and a `meta` object passed into the constructor.

`get_self_link(resource, meta)`  
`get_next_link(resource, meta)`  
`get_last_link(resource, meta)`  
`get_related_link(resource, meta)`  

Inside of the `meta` object is a `context` variable passed in by this library, it is a string and one of these values:

```
"related"
"single"
"list"
```

For you to return the appropriate link.

## Meta

You can define metadata on your collection in the `get_meta` function. This function takes no arguments and should return an object.

## API

This version is a 100% rebuild from the ground up and all previous API methods have been deprecated and removed as they were invalid.

MIT License &copy; *New World Code*

[getting-started]: https://github.com/balderdashy/waterline-docs/blob/master/introduction/getting-started.md
[jsonapi-validator]: https://www.npmjs.com/package/jsonapi-validator
[json-api]: http://jsonapi.org/
