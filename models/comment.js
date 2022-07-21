const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  on_comment: {
    type: String,
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  datecommented: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

commentSchema.set("toJSON", {
  virtuals: true,
});

exports.Comment = mongoose.model("Comment", commentSchema);
exports.commentSchema = commentSchema;
