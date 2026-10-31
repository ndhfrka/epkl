/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3142635823")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_3142635823` ON `_superusers` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_3142635823` ON `_superusers` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `idx_532rs7fzrx` ON `_superusers` (`username`)"
    ],
    "passwordAuth": {
      "identityFields": [
        "email",
        "username"
      ]
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3142635823")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_3142635823` ON `_superusers` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_3142635823` ON `_superusers` (`email`) WHERE `email` != ''",
      "CREATE INDEX `idx_532rs7fzrx` ON `_superusers` (`username`)"
    ],
    "passwordAuth": {
      "identityFields": [
        "email"
      ]
    }
  }, collection)

  return app.save(collection)
})
