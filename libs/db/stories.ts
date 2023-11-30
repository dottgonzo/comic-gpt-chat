import { model, Schema } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IStory {
  background: string;
  language: string;
  datetime: Date;
  public: boolean;
}

// 2. Create a Schema corresponding to the document interface.
const storySchema = new Schema<IStory>({
  background: { type: String, required: true },
  language: { type: String, required: true },
  datetime: { type: Date, required: true },
  public: { type: Boolean, required: true, default: false },
});

// 3. Create a Model.
const Story = model<IStory>("Story", storySchema);

export default Story;
