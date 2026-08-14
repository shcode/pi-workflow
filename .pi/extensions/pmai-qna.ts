/**
 * pmai Interactive Q&A Extension
 *
 * Registers the `questionnaire` tool and, when running inside pmai
 * (PI_PMAI_CONTRACT_VERSION env var set), intercepts calls to bridge them
 * to pmai's interactive session protocol instead of rendering a TUI widget.
 *
 * Protocol (contract v2 — exit + resume):
 *   pi  → pmai: {"type":"questions", ...} written to stdout
 *   pi  ends the turn (terminate) — pmai closes stdin so pi exits and
 *       persists the session to disk
 *   pmai → pi (resume): `pi --session <id> -p "<formatted answers>"`
 *   pi  resumes the session with the answers as a new user message
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

// --- Types ---

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
  multiSelect?: boolean;
}

interface QuestionnaireParams {
  stage?: string; // AIDLC stage context, e.g. "Requirements Analysis"
  questions: QuestionnaireQuestion[];
}

// --- Helpers ---

function isPmaiMode(): boolean {
  return !!process.env["PI_PMAI_CONTRACT_VERSION"];
}

function deriveStage(questions: QuestionnaireQuestion[]): string {
  return questions[0]?.label?.toLowerCase().replace(/\s+/g, "-") ?? "questionnaire";
}

function toContractQuestions(questions: QuestionnaireQuestion[]): ContractQuestion[] {
  return questions.map((q) => {
    const options: QuestionOption[] = q.options.map((o, i) => ({
      label: String.fromCharCode(65 + i),
      text: o.description ? `${o.label} — ${o.description}` : o.label,
    }));
    if (q.allowOther !== false) {
      options.push({ label: "X", text: "Other (please describe)" });
    }
    const isMulti = q.multiSelect === true;
    return { id: q.id, text: q.prompt, options, multi_select: isMulti, required: true };
  });
}

// --- Extension ---

export default function pmaiQna(pi: ExtensionAPI) {
  // Register the questionnaire tool so the LLM can call it.
  // In pmai mode the tool_call handler below intercepts before execute() runs.
  // In TUI mode the execute() renders the native UI widget (manual workflow unaffected).
  pi.registerTool({
    name: "questionnaire",
    label: "Questionnaire",
    description:
      "Ask the user one or more clarifying questions with predefined options. " +
      "Use during requirements analysis, NFR selection, and extension opt-ins. " +
      "Group all questions for a stage into one call.",
    parameters: {
      type: "object" as const,
      properties: {
        stage: {
          type: "string",
          description:
            "AIDLC stage this questionnaire belongs to, e.g. 'Requirements Analysis', " +
            "'User Stories', 'Application Design', 'NFR Requirements'. " +
            "Always pass this so the Q&A history shows meaningful context.",
        },
        questions: {
          type: "array",
          description: "Questions to ask the user",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Unique question ID" },
              label: { type: "string", description: "Short tab label (max 12 chars)" },
              prompt: { type: "string", description: "Full question text" },
              options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    value: { type: "string" },
                    label: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["value", "label"],
                },
              },
              allowOther: { type: "boolean", description: "Allow free-text Other answer" },
              multiSelect: { type: "boolean", description: "Allow selecting multiple options" },
            },
            required: ["id", "prompt", "options"],
          },
        },
      },
      required: ["questions"],
    } as any,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      // In non-pmai TUI mode: inform that UI is unavailable in this mode.
      if (!isPmaiMode()) {
        return {
          content: [{ type: "text" as const, text: "Questionnaire UI is only available in pmai interactive mode." }],
          details: {},
        };
      }
      // In pmai mode this execute() should never be reached —
      // the tool_call handler below intercepts first.
      // Fallback in case interception didn't fire.
      return {
        content: [{ type: "text" as const, text: "pmai Q&A bridge error: execute() called directly. Check pmai-qna extension." }],
        details: {},
      };
    },
  });

  // Intercept questionnaire tool calls in pmai mode (before execute runs).
  pi.on("tool_call", async (event, ctx) => {
    if (ctx.mode === "tui" || !isPmaiMode()) return;
    if (!isToolCallEventType<"questionnaire", QuestionnaireParams>("questionnaire", event)) return;

    const params = event.input as QuestionnaireParams;
    if (!params.questions || params.questions.length === 0) return;

    const stage = params.stage ?? deriveStage(params.questions);
    const contractQuestions = toContractQuestions(params.questions);

    const questionsEvent: QuestionsEvent = {
      type: "questions",
      stage,
      round: 1,
      questions: contractQuestions,
    };
    // Emit questions via ctx.ui.notify() — this goes through pi's RPC output
    // mechanism (writeRawStdout) which writes to the real stdout pipe.
    // The server intercepts extension_ui_request with method=notify containing
    // a pmai_questions payload and transitions the session to waiting_for_input.
    ctx.ui.notify(JSON.stringify(questionsEvent), "info");

    // Contract v2: end the turn and let pmai exit the process (session is
    // persisted to disk). pmai resumes later via `pi --session <id> -p "<answers>"`.
    return {
      block: true,
      terminate: true,
      reason: "awaiting user answers (session will resume)",
    };
  });
}
