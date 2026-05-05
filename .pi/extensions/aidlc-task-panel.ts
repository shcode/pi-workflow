/**
 * AIDLC Task Panel Extension
 *
 * Persistent task progress panel for AIDLC workflow.
 * Shows current phase, stage, units, and progress below the editor.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

interface UnitStatus {
	name: string;
	stage: string;
	status: "done" | "in-progress" | "pending";
}

interface AidlcState {
	phase: string;
	currentStage: string;
	progress: number;
	units: UnitStatus[];
}

function findAidlcState(cwd: string): string | null {
	// Search upward for aidlc-docs/aidlc-state.md
	let dir = cwd;
	for (let i = 0; i < 10; i++) {
		const path = join(dir, "aidlc-docs", "aidlc-state.md");
		if (existsSync(path)) return path;
		const parent = join(dir, "..");
		if (parent === dir) break;
		dir = parent;
	}
	return null;
}

function parseAidlcState(cwd: string): AidlcState | null {
	const statePath = findAidlcState(cwd);
	if (!statePath) return null;

	try {
		const content = readFileSync(statePath, "utf-8");
		const lines = content.split("\n");

		let phase = "INCEPTION";
		let currentStage = "Unknown";
		let progress = 0;
		const units: UnitStatus[] = [];

		// Detect phase from emojis
		for (const line of lines) {
			if (line.includes("🔵")) phase = "INCEPTION";
			if (line.includes("🟢")) phase = "CONSTRUCTION";
			if (line.includes("🟡")) phase = "OPERATIONS";
		}

		// Parse compact routing table rows
		let inTable = false;
		let totalStages = 0;
		let completedStages = 0;

		for (const line of lines) {
			if (line.startsWith("|")) {
				inTable = true;
				const cells = line.split("|").map((c) => c.trim());
				if (cells.length >= 4 && cells[1] && (cells[1] === "[x]" || cells[1] === "[ ]")) {
					const status = cells[1];
					const stageName = cells[2];
					const details = cells[3];

					if (status === "[x]") {
						completedStages++;
						units.push({ name: stageName, stage: details, status: "done" });
					} else {
						const isNext = units.length === 0 || units[units.length - 1].status === "done";
						units.push({
							name: stageName,
							stage: details,
							status: isNext ? "in-progress" : "pending",
						});
						if (isNext) currentStage = stageName;
					}
					totalStages++;
				}
			} else if (inTable && !line.startsWith("|")) {
				break;
			}
		}

		if (totalStages > 0) {
			progress = Math.round((completedStages / totalStages) * 100);
		}

		return { phase, currentStage, progress, units };
	} catch {
		return null;
	}
}

function renderWidget(state: AidlcState | null): string[] {
	if (!state) {
		return ["  No AIDLC project detected  —  start with 'build a feature' or 'AIDLC resume'"];
	}

	const lines: string[] = [];

	// Header: phase + progress
	const phaseIcon = state.phase === "INCEPTION" ? "🔵" : state.phase === "CONSTRUCTION" ? "🟢" : "🟡";
	lines.push(`  ${phaseIcon} ${state.phase}  ·  ${state.progress}%`);
	lines.push("");

	// Units
	for (const unit of state.units) {
		const icon = unit.status === "done" ? "✓" : unit.status === "in-progress" ? "▶" : "○";
		const name = unit.status === "done"
			? unit.name // completed units shown plainly
			: unit.name;
		lines.push(`  ${icon} ${name}  ${unit.stage}`);
	}

	return lines;
}

function renderStatus(state: AidlcState | null): string | undefined {
	if (!state) return undefined;
	const currentUnit = state.units.find((u) => u.status === "in-progress");
	if (currentUnit) {
		return `🏗️ ${currentUnit.name} · ${state.progress}%`;
	}
	if (state.progress === 100) {
		return "✓ AIDLC Complete";
	}
	return `AIDLC · ${state.progress}%`;
}

function updateWidget(ctx: ExtensionContext): void {
	if (!ctx.hasUI) return;
	const state = parseAidlcState(ctx.cwd);

	// Always render something — never silently clear
	const lines = renderWidget(state);
	ctx.ui.setWidget("aidlc-panel", lines, { placement: "belowEditor" });

	const status = renderStatus(state);
	ctx.ui.setStatus("aidlc", status);
}

export default function (pi: ExtensionAPI) {
	// Manual refresh command
	pi.registerCommand("aidlc-status", {
		description: "Refresh AIDLC task panel",
		handler: async (_args, ctx) => {
			updateWidget(ctx);
			const state = parseAidlcState(ctx.cwd);
			if (state) {
				ctx.ui.notify(`AIDLC: ${state.phase} · ${state.progress}% · ${state.currentStage}`, "info");
			} else {
				ctx.ui.notify("No AIDLC project detected in current directory", "warning");
			}
		},
	});

	// Setup on session start (catches startup, new, resume, fork)
	pi.on("session_start", (_event, ctx) => {
		updateWidget(ctx);
	});

	// Fallback: resources_discover fires after session_start during startup,
	// ensuring the widget is set even if session_start raced extension load.
	pi.on("resources_discover", (_event, ctx) => {
		updateWidget(ctx);
	});

	// Update after each turn (files typically written here)
	pi.on("turn_end", (_event, ctx) => {
		updateWidget(ctx);
	});

	// Update on tree navigation (branch switching / resume)
	pi.on("session_tree", (_event, ctx) => {
		updateWidget(ctx);
	});
}
