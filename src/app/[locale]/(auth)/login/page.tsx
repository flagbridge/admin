"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
	const t = useTranslations("login");
	const tc = useTranslations("common");
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				setError(
					res.status === 401
						? t("errorInvalid")
						: data?.message || t("errorGeneric"),
				);
				return;
			}

			router.push("/");
			router.refresh();
		} catch {
			setError(t("errorGeneric"));
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 flex flex-col items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold text-white">
						FB
					</div>
					<div className="flex items-center gap-2">
						<h1 className="text-xl font-semibold text-slate-50">FlagBridge</h1>
						<Badge variant="blue">{t("title")}</Badge>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="rounded-xl border border-slate-700 bg-slate-800 p-6 space-y-4"
				>
					<Input
						id="email"
						type="email"
						label={t("email")}
						placeholder="admin@flagbridge.io"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						autoFocus
					/>
					<Input
						id="password"
						type="password"
						label={t("password")}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					{error && (
						<p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
							{error}
						</p>
					)}

					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? tc("loading") : tc("signIn")}
					</Button>
				</form>
			</div>
		</div>
	);
}
