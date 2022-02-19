var express = require("express");
var router = express.Router();
var { mongodb, MongoClient, dbUrl } = require("../dbConfig");

//get all questions posted by users
router.get("/all", async (req, res, next) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db("StackOverflow");
    let document = await db.collection("Questions").find().toArray();
    console.log(document);
    res.json({
      statusCode: 200,
      message: "displayed all questions",
      allData: document,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

//get single question by id
router.get("/all/single/:id", async (req, res, next) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db("StackOverflow");
    let document = await db
      .collection("Questions")
      .findOne({ _id: new mongodb.ObjectId(req.params.id) });
    console.log(document);
    res.json({
      statusCode: 200,
      message: "displayed the question",
      questionData: document,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

//put to a single question
router.put("/all/:id", async (req, res, next) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db("StackOverflow");
    let document = await db.collection("Questions").findOneAndUpdate(
      {
        _id: new mongodb.ObjectId(req.params.id),
      },
      {
        $set: {
          views: req.body.views,
          votes: req.body.votes,
        },
      },
      {}
    );
    console.log(document);
    res.json({
      statusCode: 200,
      message: "updated the question, updated views and votes",
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

//post a new question
router.post("/new", async (req, res, next) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db("StackOverflow");
    let document = await db.collection("Questions").insertOne(req.body);
    console.log(document);
    res.json({
      message: "Question posted successfully",
      data: document,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

module.exports = router;
