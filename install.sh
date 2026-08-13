#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Argument parsing ---
AGENT="pi"
TARGET_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
  --agent)
    if [[ -n "${2:-}" && ! "$2" =~ ^-- ]]; then
      AGENT="$2"
      shift 2
    else
      echo "Error: --agent requires a value (pi, claude, copilot, kiro)"
      exit 1
    fi
    ;;
  --agent=*)
    AGENT="${1#*=}"
    shift
    ;;
  --help)
    echo "Usage: $0 [options] [TARGET_DIR]"
    echo ""
    echo "Install AIDLC workflow into a target project."
    echo ""
    echo "Options:"
    echo "  --agent NAME    Target agent: pi, claude, copilot, kiro (default: pi)"
    echo "  --help          Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --agent claude /path/to/project"
    echo "  $0 /path/to/project             # default: pi"
    exit 0
    ;;
  --*)
    echo "Error: Unknown option $1"
    echo "Run '$0 --help' for usage."
    exit 1
    ;;
  *)
    if [[ -z "$TARGET_DIR" ]]; then
      TARGET_DIR="$1"
    else
      echo "Error: Unexpected argument: $1"
      exit 1
    fi
    shift
    ;;
  esac
done

# Default target to cwd
TARGET_DIR="${TARGET_DIR:-$(pwd)}"

# Validate agent
VALID_AGENTS=("pi" "claude" "copilot" "kiro")
VALID=0
for a in "${VALID_AGENTS[@]}"; do
  if [[ "$AGENT" == "$a" ]]; then
    VALID=1
    break
  fi
done

if [[ "$VALID" -ne 1 ]]; then
  echo "Error: Unknown agent '$AGENT'. Valid: pi, claude, copilot, kiro"
  exit 1
fi

if [[ ! -d "$SCRIPT_DIR/.pi" ]]; then
  echo "Error: .pi/ not found. Run this script from the AIDLC repo root."
  exit 1
fi

if [[ "$TARGET_DIR" == "$SCRIPT_DIR" ]]; then
  echo "Error: target directory cannot be the AIDLC repo itself."
  exit 1
fi

echo "Installing AIDLC workflow to: $TARGET_DIR"
echo "Target agent: $AGENT"
echo ""

# --- Install skills to agent-native directory ---
case "$AGENT" in
pi)
  mkdir -p "$TARGET_DIR/.pi/skills"
  cp -r "$SCRIPT_DIR/.pi/skills/"* "$TARGET_DIR/.pi/skills/"
  skill_count=$(find "$SCRIPT_DIR/.pi/skills" -mindepth 1 -maxdepth 1 -type d | wc -l)
  echo "  ✓ Copied .pi/skills/ ($skill_count skills)"
  cp -r "$SCRIPT_DIR/.pi/extensions" "$TARGET_DIR/.pi/"
  ext_count=$(find "$SCRIPT_DIR/.pi/extensions" -maxdepth 1 \( -name "*.ts" -o -name "*.js" \) | wc -l | tr -d ' ')
  if [[ "$ext_count" -gt 0 ]]; then
    echo "  ✓ Copied .pi/extensions/ ($ext_count extensions)"
  else
    echo "  ✓ Copied .pi/extensions/ (empty, ready for future extensions)"
  fi
  cp "$SCRIPT_DIR/core-workflow.md" "$TARGET_DIR/AGENTS.md"
  echo "  ✓ Created AGENTS.md (pi — workflow trigger, skills handle detail)"
  ;;
claude)
  mkdir -p "$TARGET_DIR/.claude/skills"
  cp -r "$SCRIPT_DIR/.pi/skills/"* "$TARGET_DIR/.claude/skills/"
  skill_count=$(find "$SCRIPT_DIR/.pi/skills" -mindepth 1 -maxdepth 1 -type d | wc -l)
  echo "  ✓ Copied .claude/skills/ ($skill_count skills)"
  if [[ ! -f "$TARGET_DIR/CLAUDE.md" ]]; then
    cp "$SCRIPT_DIR/core-workflow.md" "$TARGET_DIR/CLAUDE.md"
    echo "  ✓ Created CLAUDE.md (Claude Code — steering)"
  else
    echo "  ⚠ CLAUDE.md already exists, skipping"
  fi
  ;;
kiro)
  mkdir -p "$TARGET_DIR/.kiro/skills"
  cp -r "$SCRIPT_DIR/.pi/skills/"* "$TARGET_DIR/.kiro/skills/"
  skill_count=$(find "$SCRIPT_DIR/.pi/skills" -mindepth 1 -maxdepth 1 -type d | wc -l)
  echo "  ✓ Copied .kiro/skills/ ($skill_count skills)"
  cp "$SCRIPT_DIR/core-workflow.md" "$TARGET_DIR/AGENTS.md"
  echo "  ✓ Created AGENTS.md (Kiro — steering)"
  ;;
copilot)
  mkdir -p "$TARGET_DIR/.github/skills"
  cp -r "$SCRIPT_DIR/.pi/skills/"* "$TARGET_DIR/.github/skills/"
  skill_count=$(find "$SCRIPT_DIR/.pi/skills" -mindepth 1 -maxdepth 1 -type d | wc -l)
  echo "  ✓ Copied .github/skills/ ($skill_count skills)"
  if [[ ! -f "$TARGET_DIR/.github/copilot-instructions.md" ]]; then
    cp "$SCRIPT_DIR/core-workflow.md" "$TARGET_DIR/.github/copilot-instructions.md"
    echo "  ✓ Created .github/copilot-instructions.md (GitHub Copilot)"
  else
    echo "  ⚠ .github/copilot-instructions.md already exists, skipping"
  fi
  ;;
esac

echo ""
echo "Done. AIDLC workflow installed for $AGENT."
echo ""

# --- Next steps ---
case "$AGENT" in
pi)
  echo "Next steps:"
  echo "  1. cd $TARGET_DIR"
  echo "  2. Edit AGENTS.md with your project-specific context"
  echo "  3. Start pi and say: 'build a feature' or 'AIDLC resume'"
  ;;
kiro)
  echo "Next steps:"
  echo "  1. cd $TARGET_DIR"
  echo "  2. Edit AGENTS.md with your project-specific context"
  echo "  3. Start Kiro and begin development"
  ;;
claude)
  echo "Next steps:"
  echo "  1. cd $TARGET_DIR"
  echo "  2. Edit CLAUDE.md with your project-specific context"
  echo "  3. Start Claude Code and begin development"
  ;;
copilot)
  echo "Next steps:"
  echo "  1. cd $TARGET_DIR"
  echo "  2. Edit .github/copilot-instructions.md with your project-specific context"
  echo "  3. Open VS Code with Copilot and begin development"
  ;;
esac
