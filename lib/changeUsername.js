const { isEmpty } = require("./util");

module.exports = async function(id, newUsername) {
  if (isEmpty(id) || isEmpty(newUsername)) {
    throw new Error("Id and new username required");
  }

  let username, _newUsername;
  try {
    username = await this.db.get(this.prefix + this.idToUsernamePrefix + id);
  } catch (err) {
    if (err.notFound) {
      throw new Error("User not found");
    }
    throw err;
  }

  try {
    _newUsername = await this.db.get(
      this.prefix + this.usernameToIdPrefix + newUsername
    );
  } catch (err) {
    if (!err.notFound) {
      throw err;
    }
  }
  if (_newUsername) {
    throw new Error("New username not available");
  }

  await this.db
    .batch()
    .del(this.prefix + this.idToUsernamePrefix + id)
    .put(this.prefix + this.idToUsernamePrefix + id, newUsername)
    .del(this.prefix + this.usernameToIdPrefix + username)
    .put(this.prefix + this.usernameToIdPrefix + newUsername, id)
    .write();

  return {
    username: newUsername,
    oldUsername: username,
    newUsername: newUsername,
    id: id
  };

  //   this.db.get(this.prefix + this.idToUsernamePrefix + id, function(
  //     error,
  //     _username
  //   ) {
  //     if (error && error.notFound) return callback(new Error("User not found"));
  //     if (error) return callback(error);

  //     username = _username;
  //     after();
  //   });

  //   this.db.get(this.prefix + this.usernameToIdPrefix + newUsername, function(
  //     error
  //   ) {
  //     if (!error) return callback(new Error("New username not available"));
  //     if (error && !error.notFound) return callback(error);

  //     after();
  //   });
};
