# waterline-jsonapi

Create [JSON API][json-api] compliant payloads from Waterline blueprints and query results.

`npm i waterline-jsonapi --save`

# Usage

You need only your query results and your collection to get started. Assuming the [example][getting-started] `user` and `pet` collections.

All payloads are run through [`jsonapi-validator`][jsonapi-validator] which will raise an exception if the payload fails to be valid.

```js
const JSONAPIModel = require("waterline-jsonapi")

// The query
User
  .find()
  .populate("pets")
  
  // Create a JSON API payload from the results.
  .then(user_and_pets => JSONAPIModel.new_from_values(user_and_pets, User))
  
  // Reply with the JSON API model.
  .then(json_api_payload => reply(json_api_payload.toJSON()))
  
  // If the payload fails validation, or some other unlikely error occurs you can catch here.
  .catch(validation_error => reply(validation_error))
```

The above will reply with 

```json
{
  "data": {
    "id": "1",
    "type": "user",
    "attributes": {
      "firstName": "Neil",
      "lastName": "Armstrong",
      "createdAt": "2015-11-10T12:41:16.866Z",
      "updatedAt": "2015-11-10T12:41:16.866Z"
    },
    "relationships": {
      "pets": {
        "data": {
          "type": "pet",
          "id": "1"
        }
      }
    }
  },
  "included": [
    {
      "id": "1",
      "type": "pet",
      "attributes": {
        "breed": "beagle",
        "type": "dog",
        "name": "Astro",
        "owner": 1,
        "createdAt": "2015-11-10T12:41:16.873Z",
        "updatedAt": "2015-11-10T12:41:16.873Z"
      }
    }
  ]
}
```

Notice, the lack of a `links` property. To get the links property you must add the following methods to your collections.

`get_self_link`  
`get_next_link`  
`get_last_link` 

They **must** return a `string` that must be a valid url. 

MIT License &copy; *New World Code*

[getting-started]: https://github.com/balderdashy/waterline-docs/blob/master/introduction/getting-started.md
[jsonapi-validator]: https://www.npmjs.com/package/jsonapi-validator
[json-api]: http://jsonapi.org/
