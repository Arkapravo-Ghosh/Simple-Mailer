import mongoose, { Schema, Document, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IMailRecipient extends Document {
  uuid: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MailRecipientSchema = new Schema<IMailRecipient>(
  {
    uuid: { type: String, required: true, unique: true, default: () => uuidv4(), index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  },
  { timestamps: true }
);

const MailListModel: Model<IMailRecipient> = (mongoose.models.MailList as Model<IMailRecipient>) ||
  mongoose.model<IMailRecipient>("MailList", MailRecipientSchema);

export default MailListModel;
