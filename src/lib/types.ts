export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: string;
  name: string;
  slug: string;
  project_id: string;
  color?: string;
  sort_order: number;
  created_at: string;
}

export interface Flag {
  id: string;
  key: string;
  name: string;
  type: "boolean" | "string" | "number";
  description?: string;
  default_value: unknown;
  tags: string[];
  project_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EnvSummary {
  enabled: boolean;
  rule_count: number;
}

export interface FlagState {
  id: string;
  flag_id: string;
  environment_id: string;
  enabled: boolean;
  value?: unknown;
  updated_by?: string;
  updated_at: string;
}

export interface TargetingRule {
  id: string;
  flag_id: string;
  environment_id: string;
  name: string;
  priority: number;
  conditions: RuleCondition[];
  value: unknown;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RuleCondition {
  attribute: string;
  operator: RuleOperator;
  value: string;
}

export type RuleOperator =
  | "eq"
  | "neq"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "in";

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scope: "evaluation" | "management" | "full";
  project_id: string;
  environment_id?: string;
  created_by: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface APIKeyCreateResponse {
  id: string;
  name: string;
  key_prefix: string;
  scope: string;
  project_id: string;
  environment_id?: string;
  created_by: string;
  created_at: string;
  key: string;
}

export interface AuditEntry {
  id: string;
  project_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Webhook {
  id: string;
  project_id: string;
  url: string;
  events: string[];
  enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookCreateResponse extends Webhook {
  secret: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: string;
  status_code: number;
  response?: string;
  attempts: number;
  success: boolean;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface APIError {
  code: string;
  message: string;
}
