import { model, Schema } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IPanel {
  story: any;
  image: string;
  datetime: Date;
}

// 2. Create a Schema corresponding to the document interface.
const panelSchema = new Schema<IPanel>({
  story: { type: Schema.Types.ObjectId, required: true },
  image: { type: String, required: true },
  datetime: { type: Date, required: true },
});

// 3. Create a Model.
const Panel = model<IPanel>("Panel", panelSchema);

export default Panel;
