import mongoose from "mongoose";

const projectRequestSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    technologies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technology",
      },
    ],
    budget: {
      type: Number,
      min: 0,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "matched", "in_progress", "completed"],
      default: "open",
    },
    matchedDevelopers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

projectRequestSchema.index({ technologies: 1 });
projectRequestSchema.index({ clientId: 1 });
projectRequestSchema.index({ category: 1 });
projectRequestSchema.index({ status: 1 });
projectRequestSchema.index({ createdAt: -1 });
projectRequestSchema.index(
  { title: "text", description: "text" },
  {
    weights: { title: 8, description: 4 },
    name: "project_request_text_search_idx",
  }
);

const ProjectRequest = mongoose.model("ProjectRequest", projectRequestSchema);

export default ProjectRequest;
