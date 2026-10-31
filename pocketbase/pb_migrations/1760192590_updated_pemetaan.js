/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.indexes = [
    "CREATE INDEX `idx_uu7eUgl` ON `pemetaan` (\n  `iduka`,\n  `siswa`,\n  `program_keahlian`\n)"
  ]

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.indexes = []

  return app.save(collection)
})
