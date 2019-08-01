const { isEmpty } = require("./util");
const { hash } = require("bcryptjs");

module.exports = async function(id, newPassword) {
  if (isEmpty(id) || isEmpty(newPassword)) {
    throw new Error("Id and new password required");
  }

  const _newPasswordHash = await new Promise((resolve, reject) => {
    hash(newPassword, 8, (error, hash) => {
      if (error) {
        return reject(error);
      }
      resolve(hash);
    });
  });

  const key = this.prefix + this.idToPasswordPrefix + id;
  await this.db
    .batch()
    .del(key)
    .put(key, _newPasswordHash)
    .write();

  return { id };
};
