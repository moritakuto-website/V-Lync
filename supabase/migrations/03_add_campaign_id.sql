-- Add campaign_id and skip_reason to sending_queue table
ALTER TABLE sending_queue ADD COLUMN IF NOT EXISTS campaign_id uuid;
ALTER TABLE sending_queue ADD COLUMN IF NOT EXISTS skip_reason text;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_queue_campaign ON sending_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON sending_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_user_status ON sending_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON sending_queue(created_at DESC);
