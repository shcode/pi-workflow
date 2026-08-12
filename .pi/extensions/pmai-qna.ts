/**
 * pmai Interactive Q&A Extension
 *
 * When pi runs inside pmai (detected via PI_PMAI_CONTRACT_VERSION env var),
 * this extension intercepts `questionnaire` tool calls and bridges them to
 * pmai's interactive session protocol instead of rendering a TUI widget.
 *
 * Protocol (see pmai-pi-interactive-contract.md):
 *   pi  → pmai: write {"type":"questions", ...} as a JSONL line to stdout
 *   pi blocks reading a single line from stdin
 *   pmai → pi:  write {"type":"answers", ...} as a JSONL line to stdin
 *   pi unblocks, tool_call returns blocked with answer text as the reason
 *   LLM receives answers as the questionnaire tool result
 *
 * In TUI mode or when PI_PMAI_CONTRACT_VERSION is not set, this extension
 * is a no-op — the normal questionnaire tool runs as-is.
 */

import { createInterface } from "node:readline";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

// --- Types matching pmai-pi-interactive-contract.md ---

interface QuestionOption {
  label: string;
  text: string;
}

interface ContractQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  multi_select: boolean;
  required: boolean;
}

interface QuestionsEvent {
  type: "questions";
  stage: string;
  round: number;
  questions: ContractQuestion[];
}

interface AnswerItem {
  id: string;
  selected: string[];
  free_text: string | null;
}

interface AnswersEvent {
  type: "answers";
  stage: string;
  round: number;
  answers: AnswerItem[];
}

// --- Questionnaire tool input shape (mirrors questionnaire.ts) ---

interface QuestionnaireOption {
  value: string;
  label: string;
  description?: string;
}

interface QuestionnaireQuestion {
  id: string;
  label?: string;
  prompt: string;
  options: QuestionnaireOption[];
  allowOther?: boolean;
}

interface QuestionnaireParams {
  questions: QuestionnaireQuestion[];
}

// --- Helpers ---

function isPmaiMode(): boolean {
  return !!process.env["PI_PMAI_CONTRACT_VERSION"];
}

/** Derive a stage name from the first question label for the contract event. */
function deriveStage(questions: QuestionnaireQuestion[]): string {
  return questions[0]?.label?.toLowerCase().replace(/\s+/g, "-") ?? "questionnaire";
}

/** Convert questionnaire tool questions to pmai contract format. */
function toContractQuestions(questions: QuestionnaireQuestion[]): ContractQuestion[] {
  return questions.map((q) => {
    const options: QuestionOption[] = q.options.map((o, i) => ({
      label: String.fromCharCode(65 + i), // A, B, C, ...
      text: o.description ? `${o.label} — ${o.description}` : o.label,
    }));

    if (q.allowOther !== false) {
      options.push({ label: "X", text: "Other (please describe)" });
    }

    return {
      id: q.id,
      text: q.prompt,
      options,
      multi_select: false,
      required: true,
    };
  });
}

/** Read one JSON line from stdin (blocking until pmai writes the answers). */
async function readAnswersFromStdin(): Promise<AnswersEvent | null> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, terminal: false });
    let resolved = false;

    rl.once("line", (line) => {
      resolved = true;
      rl.close();
      try {
        const parsed = JSON.parse(line.trim()) as AnswersEvent;
        resolve(parsed.type === "answers" ? parsed : null);
      } catch {
        resolve(null);
      }
    });

    rl.once("close", () => {
      if (!resolved) resolve(null);
    });
  });
}

/** Format answers as human-readable text the LLM can interpret as a tool result. */
function formatAnswersAsText(
  questions: QuestionnaireQuestion[],
  contractQuestions: ContractQuestion[],
  answers: AnswerItem[]
): string {
  const lines: string[] = ["[Questionnaire answers from user]"];

  for (const answer of answers) {
    const q = questions.find((q) => q.id === answer.id);
    const cq = contractQuestions.find((cq) => cq.id === answer.id);
    const label = q?.label || q?.id || answer.id;

    if (answer.free_text) {
      lines.push(`${label}: ${answer.free_text}`);
    } else if (answer.selected.length > 0) {
      const selectedTexts = answer.selected
        .map((sel) => cq?.options.find((o) => o.label === sel)?.text ?? sel)
        .join(", ");
      lines.push(`${label}: ${selectedTexts}`);
    } else {
      lines.push(`${label}: (no answer provided)`);
    }
  }

  return lines.join("\n");
}

// --- Extension entry point ---

export default function pmaiQna(pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    // Only intercept questionnaire tool in json/rpc mode with pmai contract
    if (ctx.mode === "tui" || !isPmaiMode()) return;
    if (!isToolCallEventType<"questionnaire", QuestionnaireParams>("questionnaire", event)) return;

    const params = event.input as QuestionnaireParams;
    if (!params.questions || params.questions.length === 0) return;

    const stage = deriveStage(params.questions);
    const contractQuestions = toContractQuestions(params.questions);

    // Emit questions event to stdout — pmai reads this, renders form, waits for user
    const questionsEvent: QuestionsEvent = {
      type: "questions",
      stage,
      round: 1,
      questions: contractQuestions,
    };
    process.stdout.write(JSON.stringify(questionsEvent) + "\n");

    // Block on stdin — pmai writes answers after user submits the form
    const answersEvent = await readAnswersFromStdin();

    if (!answersEvent) {
      return {
        block: true,
        reason: "pmai Q&A: no answers received (session may have timed out)",
      };
    }

    const answerText = formatAnswersAsText(
      params.questions,
      contractQuestions,
      answersEvent.answers
    );

    return {
      block: true,
      reason: answerText,
    };
  });
}
