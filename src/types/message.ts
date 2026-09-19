export interface Message {
  id: string;
  original_id?: string | null;
  quoted_message_id?: string | null;
  message?: string | null;
  message_type: number;
  created_at: string;
  pharmacy_id: string;
  from_number: string;
  to_number: string;
  log: string;
  image_url?: string | null;
  album_id?: string | null;
  confidence?: number | null;
}

export interface CreateMessageDto {
  to_number: string;
  from_number: string;
  pharmacyId: number;
  message?: string;
  image_url?: string;
  instance_name?: string;
  message_type?: number;
}
