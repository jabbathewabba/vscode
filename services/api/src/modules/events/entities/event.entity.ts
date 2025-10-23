export class EventEntity {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startAt: Date;
  endAt?: Date;
  status: string;
  capacity?: number;
}
