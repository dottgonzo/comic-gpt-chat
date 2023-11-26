import { model, Schema } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IMember {
  status: string;
  role: string;
  email: string;
  language?: string;
}

// 2. Create a Schema corresponding to the document interface.
const memberSchema = new Schema<IMember>({
  status: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  language: { type: String },
});

// 3. Create a Model.
const Member = model<IMember>("Member", memberSchema);

export default Member;
