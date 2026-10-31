/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `_1d4fljtg4b3ycm6_username_idx` ON `teacher_users` (username COLLATE NOCASE)",
      "CREATE INDEX `_1d4fljtg4b3ycm6_email_idx` ON `teacher_users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `_1d4fljtg4b3ycm6_tokenKey_idx` ON `teacher_users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_1d4fljtg4b3ycm6` ON `teacher_users` (`email`) WHERE `email` != ''"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `_1d4fljtg4b3ycm6_username_idx` ON `teacher_users` (username COLLATE NOCASE)",
      "CREATE UNIQUE INDEX `_1d4fljtg4b3ycm6_email_idx` ON `teacher_users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `_1d4fljtg4b3ycm6_tokenKey_idx` ON `teacher_users` (`tokenKey`)"
    ]
  }, collection)

  return app.save(collection)
})
