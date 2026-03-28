import mongoose from "mongoose";

const technologySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

technologySchema.index({ category: 1 });
technologySchema.index(
  { name: "text", category: "text" },
  {
    weights: { name: 10, category: 4 },
    name: "technology_text_search_idx",
  }
);

const Technology = mongoose.model("Technology", technologySchema);

export default Technology;
