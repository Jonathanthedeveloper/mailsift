export class ApiKeyDto {
  id: string;
  key: string;
  user_id: string;
  name: string | null;
  created_at: Date;
  revoked_at: Date | null;

  constructor(partial: Partial<ApiKeyDto>) {
    Object.assign(this, partial);
  }
}
