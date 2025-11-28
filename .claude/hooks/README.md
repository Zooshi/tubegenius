# Claude Code Hooks Configuration

## Task Completion Beep Hook

This hook plays a pleasant beep sound whenever a Task subagent completes its work.

### Setup Instructions

To enable the Task completion beep, add the following to your Claude Code settings:

#### Option 1: Using Claude Code Settings UI

1. Open Claude Code settings (if available via UI)
2. Navigate to "Hooks" section
3. Add a new hook for "Task" tool results
4. Set the command to: `powershell -File .claude/hooks/task-complete-beep.ps1`

#### Option 2: Manual Settings Configuration

Add this to your Claude Code settings file (typically `.claude/settings.json` or global settings):

```json
{
  "hooks": {
    "tool-result": {
      "Task": {
        "command": "powershell",
        "args": ["-File", ".claude/hooks/task-complete-beep.ps1"],
        "blocking": false
      }
    }
  }
}
```

**Or if using a simpler hook configuration format:**

```json
{
  "hooks": {
    "task-complete": "powershell -File .claude/hooks/task-complete-beep.ps1"
  }
}
```

### Hook Details

**Script:** `task-complete-beep.ps1`
**Trigger:** Whenever the Task tool completes (any subagent finishes)
**Behavior:**
- Plays a two-tone beep (800 Hz, then 1000 Hz)
- Logs completion timestamp to console
- Non-blocking (doesn't interfere with workflow)

### Customization

To customize the beep sound, edit `task-complete-beep.ps1`:

```powershell
# Change frequency (Hz) and duration (ms)
[Console]::Beep(frequency, duration)

# Examples:
[Console]::Beep(500, 500)   # Low, long beep
[Console]::Beep(1500, 100)  # High, short beep
[Console]::Beep(440, 200)   # Musical note A4
```

### Troubleshooting

**No sound?**
- Ensure system volume is not muted
- Check that PowerShell execution is allowed
- Verify the script path is correct relative to project root
- Try running the script manually: `powershell -File .claude/hooks/task-complete-beep.ps1`

**Permission errors?**
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Additional Hooks

You can create additional hooks for other events:

- **Slash command execution:** Hook when custom commands run
- **File edits:** Hook after file modifications
- **Test completion:** Hook when tests finish
- **Build completion:** Hook when builds complete

Create new `.ps1` files in this directory and configure them similarly in settings.
