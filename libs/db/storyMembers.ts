import { model, Schema } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IStoryMember {
  story: any;
  member: any;
  character: string;
  datetime: Date;
}

// 2. Create a Schema corresponding to the document interface.
const storyMemberSchema = new Schema<IStoryMember>({
  story: { type: Schema.Types.ObjectId, required: true },
  member: { type: Schema.Types.ObjectId, required: true },
  character: { type: String, required: true },
  datetime: { type: Date, required: true },
});

// 3. Create a Model.
const StoryMember = model<IStoryMember>("StoryMember", storyMemberSchema);

export default StoryMember;
