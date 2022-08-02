const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  visibility: {
    type: Boolean,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  datePosted: {
    type: Date,
    default: Date.now,
  },
});

postSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

postSchema.set("toJSON", {
  virtuals: true,
});

exports.Post = mongoose.model("Post", postSchema);
exports.postSchema = postSchema;
