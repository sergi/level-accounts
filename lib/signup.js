const uuid = require("node-uuid");
const { isEmpty } = require("./util");
const { hash } = require("bcryptjs");

module.exports = async function(username, password) {
  if (isEmpty(username) || isEmpty(password)) {
    throw new Error("Username and password required");
  }

  let _username;
  try {
    _username = await this.db.get(
      this.prefix + this.usernameToIdPrefix + username
    );
  } catch (error) {
    if (!error.notFound) {
      throw error;
    }
  }

  if (_username) {
    throw new Error("Username not available");
  }

  const id = uuid.v1();
  const token = uuid.v4();

  let _hash = await new Promise((resolve, reject) => {
    hash(password, 8, (error, hash) => {
      if (error) {
        return reject(error);
      }
      return resolve(hash);
    });
  });
  password = _hash;

  await this.db
    .batch()
    .put(this.prefix + this.idToUsernamePrefix + id, username)
    .put(this.prefix + this.usernameToIdPrefix + username, id)
    .put(this.prefix + this.tokenToIdPrefix + token, id)
    .put(this.prefix + this.idToPasswordPrefix + id, password)
    .write();

  return {
    username,
    id,
    token
  };
};
