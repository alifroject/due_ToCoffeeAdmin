import { Item } from './item';
import { Location } from './location';
import { QueueStatus } from './queueStatus';
import { RawWebhook } from './rawWebhook';
import { Timestamp } from "firebase/firestore";
export interface Transaction {
  order_id: string;
  amount: number;
  cartId: string;
  created_at: Timestamp;
  custom_note: string;
  invoice_url: string;
  items: Item[];
  location: Location;
  queue_number: string;
  queue_number_status: string;
  queue_status: QueueStatus;
  raw_webhook: RawWebhook;
  status: string;
  updated_at: Date;
  userEmail: string;
  userId: string;
  userName: string;
  userPhone: string;
}
