# Task Completion Beep Hook
# Plays a notification beep when a Task subagent completes

# Play a pleasant two-tone beep
[Console]::Beep(800, 200)   # First beep: 800 Hz for 200ms
Start-Sleep -Milliseconds 50
[Console]::Beep(1000, 300)  # Second beep: 1000 Hz for 300ms

# Optional: Log the completion
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "🔔 Task agent completed at $timestamp" -ForegroundColor Green
