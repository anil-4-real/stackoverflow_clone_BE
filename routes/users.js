var express = require("express");
var router = express.Router();
var { MongoClient, dbUrl } = require("../dbConfig");

// create a user
router.post("/new", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    // check if user already exists
    const users = client.db("StackOverflow").collection("Users");
    const user = await users.find({ sub: req.body.sub }).toArray();
    if (user.length > 0) {
      res.send({ statusCode: 200, message: "user already exists" });
    } else {
      const newUser = await users.insertOne(req.body);
      if (newUser.acknowledged) {
        res.send({ statusCode: 201, message: "user created successfully" });
      }
    }
  } catch (e) {
    res.send({ statusCode: 500, message: "internal server error" });
  } finally {
    client.close();
  }
});

router.get("/:sub", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const users = client.db("StackOverflow").collection("Users");
    const user = await users.findOne({ sub: req.params.sub });
    res.send({
      statusCode: 200,
      message: "fetched successfully",
      user,
    });
  } catch (e) {
    console.log(e);
    res.send({ statusCode: 500, message: "internal server error" });
  } finally {
    client.close();
  }
});

module.exports = router;
