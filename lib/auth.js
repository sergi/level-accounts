const { isEmpty } = require("./util");

module.exports = async function(token, callback) {
  if (isEmpty(token)) {
    throw new Error("Token required");
  }

  let id, username;
  try {
    id = await this.db.get(this.prefix + this.tokenToIdPrefix + token);
  } catch (error) {
    if (error && error.notFound) throw new Error("Invalid token");
    if (error) throw error;
  }

  username = await this.db.get(this.prefix + this.idToUsernamePrefix + id);

  return {
    id,
    username,
    token
  };
};
