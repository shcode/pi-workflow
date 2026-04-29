#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$(pwd)}"

if [[ ! -d "$SCRIPT_DIR/.pi/skills" ]]; then
    echo "Error: .pi/skills/ not found. Run this script from the AIDLC repo root."
    exit 1
fi

if [[ "$TARGET_DIR" == "$SCRIPT_DIR" ]]; then
    echo "Error: target directory cannot be the AIDLC repo itself."
    exit 1
fi

echo "Installing AIDLC skills to: $TARGET_DIR"

# Create target .pi/skills directory
mkdir -p "$TARGET_DIR/.pi/skills"

# Copy all skills
cp -r "$SCRIPT_DIR/.pi/skills/"* "$TARGET_DIR/.pi/skills/"
echo "  ✓ Copied .pi/skills/ ($(ls "$SCRIPT_DIR/.pi/skills" | wc -l) skills)"

# Copy and rename core-workflow.md to AGENTS.md
cp "$SCRIPT_DIR/core-workflow.md" "$TARGET_DIR/AGENTS.md"
echo "  ✓ Copied core-workflow.md → AGENTS.md"

echo ""
echo "Done. Next steps:"
echo "  1. cd $TARGET_DIR"
echo "  2. Edit AGENTS.md with your project-specific context"
echo "  3. Start pi and say: 'build a feature' or load manually with /skill:aidlc-orchestrator"
