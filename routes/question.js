var express = require("express");
var router = express.Router();
var { mongodb, MongoClient, dbUrl } = require("../dbConfig");

//get all questions posted by users
router.get("/all", async (req, res, next) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = client.db("StackOverflow");
    let document = await db.collection("Questions").find().toArray();
    res.json({
      statusCode: 200,
      message: "displayed all questions",
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

//get single question by id
router.get("/all/single/:id", async (req, res, next) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db("StackOverflow");
    let document = await db
      .collection("Questions")
      .findOne({ uid: req.params.id });
    res.json({
      statusCode: 200,
      message: "displayed the question",
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

//put to a single question
router.put("/all/:id", async (req, res, next) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db("StackOverflow");
    let document = await db.collection("Questions").findOneAndUpdate(
      {
        uid: req.params.id,
      },
      {
        $set: {
          views: req.body.views,
        },
      },
      {}
    );
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
    const {
      title,
      body,
      tags,
      views,
      answers,
      votes,
      sub,
      uid,
      likedby,
      dislikedby,
      postedby,
    } = req.body;
    //posting the question to question collection
    const db = await client.db("StackOverflow");
    //posting the question to current user's document
    let document = await db.collection("Questions").insertOne({
      title,
      body,
      tags,
      views,
      answers,
      votes,
      uid,
      likedby,
      dislikedby,
      postedby,
    });
    let userDocument = await db.collection("Users").findOneAndUpdate(
      { sub: sub },
      {
        $push: {
          questions: { title, uid },
        },
      }
    );
    res.send({
      message: "Question posted successfully",
      statusCode: 201,
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

//add answer to the question
router.put("/answer/:uid", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const questions = client.db("StackOverflow").collection("Questions");
    const insertToQuestions = await questions.findOneAndUpdate(
      { uid: req.params.uid },
      { $push: { answers: req.body } }
    );
    res.send({ message: "Answer added successfully", statusCode: 201 });
  } catch (e) {
    console.log(e);
    res.send({ statusCode: 500, message: "internal server error" });
  } finally {
    client.close();
  }
});

//update question likes
router.put("/update/likes/:uid", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const questions = client.db("StackOverflow").collection("Questions");
    if (req.body.value === 1) {
      //updating likedby and removing the vote from dislikes
      await questions.findOneAndUpdate(
        { uid: req.params.uid },
        { $push: { likedby: req.body.sub } }
      );
      await questions.findOneAndUpdate(
        { uid: req.params.uid },
        { $pull: { dislikedby: req.body.sub } }
      );
      res.send({ message: "upvoted successfully", statusCode: 201 });
    } else if (req.body.value === 0) {
      await questions.findOneAndUpdate(
        { uid: req.params.uid },
        { $pull: { likedby: req.body.sub } }
      );
      res.send({ message: "unvoted successfully", statusCode: 201 });
    }
  } catch (e) {
    console.log(e);
    res.send({ statusCode: 500, message: "internal server error" });
  } finally {
    client.close();
  }
});

// update question dislike
router.put("/update/dislikes/:uid", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const questions = client.db("StackOverflow").collection("Questions");
    if (req.body.value === 1) {
      //updating dislikedby and removing the vote from likes
      await questions.findOneAndUpdate(
        { uid: req.params.uid },
        { $push: { dislikedby: req.body.sub } }
      );
      await questions.findOneAndUpdate(
        { uid: req.params.uid },
        { $pull: { likedby: req.body.sub } }
      );

      res.send({ message: "disliked successfully", statusCode: 201 });
    } else if (req.body.value === 0) {
      await questions.findOneAndUpdate(
        { uid: req.params.uid },
        { $pull: { dislikedby: req.body.sub } }
      );
      res.send({ message: "unvoted successfully", statusCode: 201 });
    }
  } catch (e) {
    console.log(e);
    res.send({ statusCode: 500, message: "internal server error" });
  } finally {
    client.close();
  }
});

//update answer likes
router.put("/answer/update/likes/:uid/:auid", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const questions = client.db("StackOverflow").collection("Questions");
    if (req.body.value === 1) {
      await questions.findOneAndUpdate(
        {
          uid: req.params.uid,
          "answers.uid": req.params.auid,
        },
        { $push: { "answers.$.likedby": req.body.sub } }
      );

      await questions.findOneAndUpdate(
        {
          uid: req.params.uid,
          "answers.uid": req.params.auid,
        },
        { $pull: { "answers.$.dislikedby": req.body.sub } }
      );

      res.send({ message: "upvoted successfully", statusCode: 201 });
    } else if (req.body.value === 0) {
      await questions.findOneAndUpdate(
        {
          uid: req.params.uid,
          "answers.uid": req.params.auid,
        },
        { $pull: { "answers.$.likedby": req.body.sub } }
      );
      res.send({ message: "unvoted successfully", statusCode: 201 });
    }
  } catch (e) {
    console.log(e);
    res.send({ statusCode: 500, message: "internal server error" });
  } finally {
    client.close();
  }
});

//update answer dislike
router.put("/answer/update/dislikes/:uid/:auid", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const questions = client.db("StackOverflow").collection("Questions");
    if (req.body.value === 1) {
      await questions.findOneAndUpdate(
        {
          uid: req.params.uid,
          "answers.uid": req.params.auid,
        },
        { $push: { "answers.$.dislikedby": req.body.sub } }
      );

      await questions.findOneAndUpdate(
        {
          uid: req.params.uid,
          "answers.uid": req.params.auid,
        },
        { $pull: { "answers.$.likedby": req.body.sub } }
      );

      res.send({ message: "downvoted successfully", statusCode: 201 });
    } else if (req.body.value === 0) {
      await questions.findOneAndUpdate(
        {
          uid: req.params.uid,
          "answers.uid": req.params.auid,
        },
        { $pull: { "answers.$.dislikedby": req.body.sub } }
      );
      res.send({ message: "unvoted successfully", statusCode: 201 });
    }
  } catch (e) {
    console.log(e);
    res.send({ statusCode: 500, message: "internal server error" });
  } finally {
    client.close();
  }
});

module.exports = router;
