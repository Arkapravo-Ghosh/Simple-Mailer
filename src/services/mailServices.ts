import { Types } from 'mongoose';
import MailListModel, { IMailRecipient } from '../models/mailListModel';

interface InputRecipient { name?: string; email: string }

interface AddResult { success: boolean; doc?: IMailRecipient | null; error?: any; input: InputRecipient }
interface UpdateInput { id?: string; email?: string; update: Partial<{ name: string; email: string }> }
interface UpdateResult { success: boolean; doc?: IMailRecipient | null; error?: any; input: UpdateInput }
interface RemoveResult { success: boolean; deletedCount?: number; error?: any; identifier: string }

const asArray = <T,>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

/**
 * Add one or many recipients. Returns an array of results (one per input).
 * Uses upsert: if an email exists, it updates the name.
 */
const addRecipients = async (items: InputRecipient | InputRecipient[]): Promise<AddResult[]> => {
  const arr = asArray(items);
  const results: AddResult[] = await Promise.all(
    arr.map(async (it) => {
      if (!it || !it.email) {
        const err = new Error('Missing email');
        return { success: false, error: err, input: it };
      }

      try {
        const doc = await MailListModel.findOneAndUpdate(
          { email: it.email.toLowerCase().trim() },
          { $set: { name: it.name?.trim() || '', email: it.email.toLowerCase().trim() } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).exec();
        return { success: true, doc, input: it };
      } catch (error) {
        return { success: false, error, input: it };
      }
    })
  );

  return results;
};

const listRecipients = async (filter: Partial<{ email: string; name: string }> = {}) => {
  const q: any = {};
  if (filter.email) q.email = filter.email.toLowerCase().trim();
  if (filter.name) q.name = { $regex: filter.name, $options: 'i' };
  return MailListModel.find(q).sort({ createdAt: -1 }).exec();
};

const getRecipientById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) return null;
  return MailListModel.findById(id).exec();
};

const findByEmails = async (emails: string[] | string) => {
  const arr = asArray(emails).map((e) => e.toLowerCase().trim());
  return MailListModel.find({ email: { $in: arr } }).exec();
};

/**
 * Update one or many recipients. Each item must contain `id` or `email` and an `update` object.
 */
const updateRecipients = async (items: UpdateInput | UpdateInput[]): Promise<UpdateResult[]> => {
  const arr = asArray(items);
  const results: UpdateResult[] = await Promise.all(
    arr.map(async (it) => {
      if (!it || (!it.id && !it.email)) {
        const err = new Error('Missing identifier (id or email)');
        return { success: false, error: err, input: it };
      }

      try {
        const query: any = {};
        // support _id, email, or uuid
        if (it.id && Types.ObjectId.isValid(it.id)) query._id = it.id;
        else if (it.email) query.email = it.email.toLowerCase().trim();
        else if (it.id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(it.id)) query.uuid = it.id;

        const doc = await MailListModel.findOneAndUpdate(query, { $set: it.update }, { new: true }).exec();
        return { success: true, doc, input: it };
      } catch (error) {
        return { success: false, error, input: it };
      }
    })
  );

  return results;
};

/**
 * Remove recipients by id or email. Accepts single or array input.
 */
const removeRecipients = async (identifiers: string | string[]): Promise<RemoveResult[]> => {
  const arr = asArray(identifiers);
  const results: RemoveResult[] = await Promise.all(
    arr.map(async (idOrEmail) => {
      try {
        let res;
        const val = idOrEmail.trim();
        const isEmail = val.includes('@');
        const isObjectId = Types.ObjectId.isValid(val);
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

        if (isEmail) {
          res = await MailListModel.deleteOne({ email: val.toLowerCase() }).exec();
        } else if (isObjectId) {
          res = await MailListModel.deleteOne({ _id: val }).exec();
        } else if (isUuid) {
          res = await MailListModel.deleteOne({ uuid: val }).exec();
        } else {
          return { success: false, error: new Error('Invalid identifier'), identifier: idOrEmail };
        }

        return { success: true, deletedCount: res.deletedCount ?? 0, identifier: idOrEmail };
      } catch (error) {
        return { success: false, error, identifier: idOrEmail };
      }
    })
  );

  return results;
};

export default {
  addRecipients,
  listRecipients,
  getRecipientById,
  findByEmails,
  updateRecipients,
  removeRecipients,
};
