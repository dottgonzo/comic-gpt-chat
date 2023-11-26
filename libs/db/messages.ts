import { model, Schema } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IMessage {
  member: any;
  story: any;
  panel: any;
  text: string;
  datetime: Date;
}

// 2. Create a Schema corresponding to the document interface.
const messageSchema = new Schema<IMessage>({
  member: { type: Schema.Types.ObjectId, required: true },
  story: { type: Schema.Types.ObjectId, required: true },
  panel: { type: Schema.Types.ObjectId, required: true },
  text: { type: String, required: true },
  datetime: { type: Date, required: true },
});

// 3. Create a Model.
const Message = model<IMessage>("Message", messageSchema);

export default Message;
