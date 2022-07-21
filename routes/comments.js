const { Comment } = require("../models/comment");
const { Post } = require("../models/post");
const express = require("express");
const { json } = require("body-parser");

const router = express.Router();
router.get(`/`, async (req, res) => {
  const commentList = await Comment.find()
    .populate("user", "firstName lastName image ")
    .populate("post", "image datePosted")
    .sort({ datecommented: -1 });

  if (!commentList) {
    res.status(500).json({ success: false });
  }
  res.send(commentList);
});

router.get("/:id", async (req, res) => {
  const comments = await Comment.find({ post: req.body.id });

  console.log(comments);
  const comment = await Comment.findById(req.params.id)
    .populate("user", "firstName lastName image ")
    .populate("post", "image datePosted")
    .sort({ datecommented: -1 });

  if (!comment) {
    res
      .status(500)
      .json({ message: "The comment with the given ID was not found." });
  }
  res.status(200).send(comment);
});

router.post("/posts/:postId/comments", async (req, res) => {
  let comment = new Comment({
    user: req.body.user,
    // post: req.body.post,
    on_comment: req.body.on_comment,
  });

  comment = await comment
    .save()
    .then(() => Post.findById(req.params.postId))
    .then((post) => {
      post.comments.unshift(comment);
      return post.save();
    })
    // .then(() => res.redirect("/"))
    .catch((err) => {
      console.log(err);
    });

  if (!comment) return res.status(400).send("the user cannot be created!");

  res.send(comment);
});

router.put("/:id", async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    {
      on_comment: req.body.on_comment,
    },
    { new: true }
  );

  if (!comment) return res.status(400).send("the comment cannot be update!");
  console.log(comment);
  res.send(comment);
});

router.delete("/:id", (req, res) => {
  Comment.findByIdAndRemove(req.params.id)
    .then((comment) => {
      if (comment) {
        return res
          .status(200)
          .json({ success: true, message: "the comment is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "comment not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
module.exports = router;
