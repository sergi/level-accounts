const uuid = require("node-uuid");
const { isEmpty } = require("./util");
const { compare } = require("bcryptjs");

module.exports = async function(username, password) {
  if (isEmpty(username) || isEmpty(password)) {
    throw new Error("Username and password required");
  }

  let id;
  try {
    id = await this.db.get(this.prefix + this.usernameToIdPrefix + username);
  } catch (error) {
    if (error.notFound) {
      throw new Error("Invalid username");
    }
    throw error;
  }

  const realPassword = await this.db.get(
    this.prefix + this.idToPasswordPrefix + id
  );

  await new Promise((resolve, reject) => {
    compare(password, realPassword, function(error, valid) {
      if (error) {
        return reject(error);
      }
      if (!valid) {
        return reject(new Error("Invalid password"));
      }
      resolve(valid);
    });
  });

  const token = uuid.v4();
  await this.db.put(this.prefix + this.tokenToIdPrefix + token, id);

  return {
    username,
    id,
    token
  };
};
