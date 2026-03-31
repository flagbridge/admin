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
	flag_count: number;
	created_at: string;
	updated_at: string;
}

export interface Environment {
	id: string;
	name: string;
	slug: string;
	project_id: string;
	created_at: string;
}

export interface Flag {
	id: string;
	key: string;
	type: "boolean" | "string" | "number";
	description: string;
	project_id: string;
	created_at: string;
	updated_at: string;
}

export interface FlagState {
	flag_id: string;
	environment_id: string;
	enabled: boolean;
	value: string | number | boolean;
	updated_at: string;
}

export interface TargetingRule {
	id: string;
	flag_id: string;
	environment_id: string;
	priority: number;
	conditions: RuleCondition[];
	result_value: string | number | boolean;
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
	project_slug?: string;
	created_at: string;
	last_used_at: string | null;
}

export interface APIKeyCreateResponse {
	api_key: APIKey;
	key: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface APIError {
	error: string;
	message: string;
	status: number;
}
