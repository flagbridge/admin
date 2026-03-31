"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { TargetingRule, RuleCondition, RuleOperator } from "@/lib/types";

interface TargetingRulesProps {
	rules: TargetingRule[];
	onAddRule: (conditions: RuleCondition[], resultValue: string) => void;
	onDeleteRule: (ruleId: string) => void;
	isPending?: boolean;
}

const OPERATORS: RuleOperator[] = [
	"eq", "neq", "contains", "startsWith", "endsWith", "gt", "lt", "in",
];

function emptyCondition(): RuleCondition {
	return { attribute: "", operator: "eq", value: "" };
}

export function TargetingRules({
	rules,
	onAddRule,
	onDeleteRule,
	isPending,
}: TargetingRulesProps) {
	const t = useTranslations("targeting");
	const tc = useTranslations("common");
	const [showForm, setShowForm] = useState(false);
	const [conditions, setConditions] = useState<RuleCondition[]>([emptyCondition()]);
	const [resultValue, setResultValue] = useState("");

	const operatorOptions = OPERATORS.map((op) => ({
		value: op,
		label: t(`operators.${op}`),
	}));

	function updateCondition(index: number, field: keyof RuleCondition, value: string) {
		setConditions((prev) =>
			prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
		);
	}

	function handleSubmit() {
		const valid = conditions.every((c) => c.attribute && c.value);
		if (!valid || !resultValue) return;
		onAddRule(conditions, resultValue);
		setConditions([emptyCondition()]);
		setResultValue("");
		setShowForm(false);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-slate-50">{t("title")}</h3>
				{!showForm && (
					<Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
						<Plus className="h-3.5 w-3.5" />
						{t("addRule")}
					</Button>
				)}
			</div>

			{!rules.length && !showForm && (
				<p className="rounded-xl border border-dashed border-slate-700 py-8 text-center text-sm text-slate-500">
					{t("noRules")}
				</p>
			)}

			{/* Existing rules */}
			<div className="space-y-3">
				{rules.map((rule) => (
					<div
						key={rule.id}
						className="rounded-xl border border-slate-700 bg-slate-800 p-4"
					>
						<div className="flex items-start justify-between">
							<div className="space-y-2">
								{rule.conditions.map((cond, i) => (
									<p key={`${rule.id}-${i}`} className="text-sm text-slate-300">
										<span className="font-mono text-blue-400">{cond.attribute}</span>{" "}
										<span className="text-slate-500">{t(`operators.${cond.operator}`)}</span>{" "}
										<span className="font-mono text-orange-400">{cond.value}</span>
									</p>
								))}
								<p className="mt-2 text-sm">
									<span className="text-slate-500">→</span>{" "}
									<span className="font-mono text-green-400">
										{String(rule.result_value)}
									</span>
								</p>
							</div>
							<button
								type="button"
								onClick={() => onDeleteRule(rule.id)}
								disabled={isPending}
								className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Add rule form */}
			{showForm && (
				<div className="rounded-xl border border-blue-500/30 bg-slate-800 p-4 space-y-4">
					{conditions.map((cond, i) => (
						<div key={i} className="grid grid-cols-3 gap-3">
							<Input
								placeholder={t("attribute")}
								value={cond.attribute}
								onChange={(e) => updateCondition(i, "attribute", e.target.value)}
							/>
							<Select
								value={cond.operator}
								onChange={(e) => updateCondition(i, "operator", e.target.value)}
								options={operatorOptions}
							/>
							<Input
								placeholder={t("value")}
								value={cond.value}
								onChange={(e) => updateCondition(i, "value", e.target.value)}
							/>
						</div>
					))}

					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={() => setConditions((prev) => [...prev, emptyCondition()])}
					>
						<Plus className="h-3.5 w-3.5" />
						{t("addCondition")}
					</Button>

					<Input
						label={t("result")}
						placeholder="true"
						value={resultValue}
						onChange={(e) => setResultValue(e.target.value)}
					/>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								setShowForm(false);
								setConditions([emptyCondition()]);
								setResultValue("");
							}}
						>
							{tc("cancel")}
						</Button>
						<Button
							type="button"
							size="sm"
							onClick={handleSubmit}
							disabled={isPending}
						>
							{t("saveRule")}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
