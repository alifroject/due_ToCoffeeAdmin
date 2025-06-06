export interface QueueStatus {
  accepted: boolean;
  almost_ready: boolean;
  in_progress: boolean;
  picked_up: boolean;
  ready_for_pickup: boolean;
  updated_at: Date;
}
