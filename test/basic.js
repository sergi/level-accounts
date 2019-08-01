var levelup = require("levelup");
var leveldown = require("leveldown");
var encode = require("encoding-down");
var db = levelup(encode(leveldown("./test/db")));

require("../")(db);

var test = require("tape");
var id;

test("valid signup", async function(t) {
  t.plan(4);
  let user;
  try {
    user = await db.accounts.signup("alex", "$ecret");
  } catch (error) {
    t.fail(error);
  }
  id = user.id;
  t.equal(user.hasOwnProperty("id"), true);
  t.equal(user.hasOwnProperty("token"), true);
  t.equal(user.hasOwnProperty("username"), true);
  t.equal(user.username, "alex");
});

test("invalid signup (duplicate)", async function(t) {
  t.plan(2);
  let id;
  try {
    id = await db.accounts.signup("alex", "$ecret");
  } catch (error) {
    t.equal(error.message, "Username not available");
    t.equal(id, undefined);
  }
});

var token;

test("valid signin", async function(t) {
  t.plan(2);
  let user;
  try {
    user = await db.accounts.signin("alex", "$ecret");
  } catch (error) {
    t.fail(error);
  }
  token = user.token;
  t.equal(user.hasOwnProperty("token"), true);
  delete user.token;
  t.deepEqual(user, { id: id, username: "alex" });
});

test("invalid signin", async function(t) {
  t.plan(2);
  let user;
  try {
    user = await db.accounts.signin("alex", "$nvalid");
  } catch (error) {
    t.notEqual(error, null);
  }
  t.equal(user, undefined);
});

test("valid auth", async function(t) {
  t.plan(1);
  let user;
  try {
    user = await db.accounts.auth(token);
  } catch (error) {
    t.fail(error);
  }
  t.deepEqual(user, { id: id, username: "alex", token: token });
});

test("invalid auth", async function(t) {
  t.plan(2);
  let user;
  try {
    user = await db.accounts.auth("invalid token");
  } catch (error) {
    t.notEqual(error, null);
  }
  t.equal(user, undefined);
});

test("changeUsername", async function(t) {
  t.plan(2);
  let newUser;
  try {
    newUser = await db.accounts.changeUsername(id, "not_alex");
  } catch (error) {
    t.fail(error);
  }

  t.deepEqual(newUser, {
    id: id,
    newUsername: "not_alex",
    oldUsername: "alex",
    username: "not_alex"
  });

  try {
    await db.accounts.signin("not_alex", "$ecret");
  } catch (error) {
    t.fail(error);
  }

  try {
    await db.accounts.signin("alex", "$ecret");
  } catch (error) {
    t.ok(error);
  }
});

test("changePassword", async function(t) {
  t.plan(1);
  try {
    await db.accounts.changePassword(id, "geheim");
  } catch (error) {
    t.fail(error);
  }
  try {
    await db.accounts.signin("not_alex", "geheim");
  } catch (error) {
    t.fail(error);
  }

  try {
    await db.accounts.signin("not_alex", "$ecret");
  } catch (error) {
    t.ok(error);
  }
});
