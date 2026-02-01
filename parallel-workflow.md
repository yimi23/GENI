# Parallel Development Workflow for GENI

## Quick Start

### 1. Load Aliases
```bash
source /Users/yimi/Desktop/GENI/setup-aliases.sh
```

### 2. Open 4 Terminal Tabs/Windows

**Tab 1: Main (Production Work)**
```bash
zm  # Jump to main worktree
# Run backend + frontend here
cd backend && npm run dev
```

**Tab 2: Testing (Test Features)**
```bash
zt  # Jump to testing worktree
# Run tests, experiment with features
cd backend && npm test
```

**Tab 3: Docs (Documentation)**
```bash
zd  # Jump to docs worktree
# Update CLAUDE.md, guides, etc.
# Use this for analysis/logs review
```

**Tab 4: Features (New Features)**
```bash
zf  # Jump to features worktree
# Build new features in isolation
# Merge to main when ready
```

---

## Parallel Claude Sessions

### Session 1: Main Development (This Session)
- **Focus:** Core feature implementation
- **Context:** Full project context
- **Tasks:** Bug fixes, integrations, main features

### Session 2: Testing & QA (Subagent)
- **Focus:** Test automation, verification
- **Context:** Test files + critical paths
- **Tasks:** Write tests, verify features, catch bugs

### Session 3: Documentation (Subagent)  
- **Focus:** Keep docs updated
- **Context:** Code changes + user-facing features
- **Tasks:** Update README, guides, CLAUDE.md

### Session 4: Analysis & Planning (Dedicated)
- **Focus:** Review logs, plan features
- **Context:** Read-only, analysis mode
- **Tasks:** Read logs, plan architecture, review PRs

---

## Subagent Delegation Examples

### Example 1: "Fix failing tests"
```
PROMPT: "use subagents - Go fix the failing CI tests in the testing worktree"
```
Claude spawns subagent → navigates to testing worktree → runs tests → fixes issues → reports back

### Example 2: "Update docs after feature"
```
PROMPT: "use subagents - Update all documentation to reflect the new continuous monitoring feature"
```
Subagent → docs worktree → updates README, guides, CLAUDE.md → commits changes

### Example 3: "Analyze logs"
```
PROMPT: "use subagents - Review backend logs from the last hour and summarize any errors"
```
Subagent → reads logs → categorizes errors → provides summary without cluttering main context

---

## Plan Mode Workflow

### For Complex Features
1. **Start in plan mode:** "Enter plan mode and design the multi-camera support system"
2. **Get plan reviewed:** (Optional) Spawn second Claude to review as staff engineer
3. **Implement:** "Execute the plan we just created"
4. **Verify:** "Enter plan mode and verify the implementation matches the plan"

### When Things Go Wrong
1. **Stop pushing forward**
2. **Re-enter plan mode:** "Something's not working. Enter plan mode and re-plan the approach."
3. **Fresh start:** Clear thinking, better approach

---

## Git Worktree Commands

### Create new worktree
```bash
git branch feature-name
git worktree add ../GENI-worktrees/feature-name feature-name
```

### Remove worktree
```bash
git worktree remove ../GENI-worktrees/feature-name
git branch -d feature-name
```

### List all worktrees
```bash
git worktree list
```

### Switch between worktrees (use aliases)
```bash
zm   # Main
zt   # Testing
zd   # Docs  
zf   # Features
```

---

## Best Practices

### DO:
✅ Use subagents for isolated tasks (tests, docs, analysis)
✅ Start complex features in plan mode
✅ Update CLAUDE.md after every correction
✅ Name terminal tabs by worktree (Main, Testing, Docs, Features)
✅ Use voice dictation for detailed prompts (fn x2 on macOS)
✅ Keep main session context clean (delegate to subagents)

### DON'T:
❌ Mix multiple unrelated tasks in one session
❌ Keep pushing when stuck (re-plan instead)
❌ Forget to update notes/ after PRs
❌ Micromanage subagents (trust them to figure it out)
❌ Clutter main context with analysis (use dedicated worktree)

---

## Status Check

Run across all worktrees:
```bash
zstatus
```

---

## Tips from the Claude Code Team

1. **Do more in parallel** - 3-5 worktrees running different Claude sessions
2. **Plan mode for complex tasks** - Invest energy in planning for 1-shot implementation
3. **CLAUDE.md is your memory** - Ruthlessly update it after corrections
4. **Notes directory** - Updated after every PR for long-term context
5. **Voice dictation** - 3x faster than typing, more detailed prompts
6. **Subagents for isolation** - Keep main context clean and focused
7. **Color-code terminal tabs** - Visual organization helps

---

Last Updated: 2026-01-31 23:50 PM EST
