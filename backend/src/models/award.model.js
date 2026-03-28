import mongoose from "mongoose";

const awardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "SiteOfTheDay",
        "ProjectOfTheWeek",
        "InnovationAward",
        "CommunityChoice",
      ],
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    year: {
      type: Number,
    },
  },
  { timestamps: true }
);

awardSchema.index({ type: 1 });
awardSchema.index({ projectId: 1 });
awardSchema.index({ developerId: 1 });
awardSchema.index({ year: -1 });
awardSchema.index(
  { name: "text", type: "text" },
  {
    weights: { name: 8, type: 4 },
    name: "award_text_search_idx",
  }
);

const Award = mongoose.model("Award", awardSchema);

export default Award;
