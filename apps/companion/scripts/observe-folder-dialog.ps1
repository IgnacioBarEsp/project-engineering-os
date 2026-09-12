# Reports which operating-system dialog an application currently has open.
#
# It observes and does not answer. That is not a limitation of this script but of the dialog, and the
# distinction was established by measurement rather than assumed:
#
#   * The folder picker exposes no editable name field and no confirming button through UI Automation.
#     Walking its whole control tree from the window handle yields 53 nodes: the file-list cells, the
#     search box and the "New folder" command. Writing into the only editable field the shell does expose
#     is rejected with "the operation was canceled by the user".
#   * Synthetic keystrokes need the window in the foreground, and a background process is not permitted
#     to take it. Sent anyway, one such keystroke reached the picker's "new folder" command and created
#     an empty directory nobody asked for.
#   * The application's own stop control cannot dismiss it either: it answers "stopping when the current
#     safe step finishes", and the current step is the dialog. Refusing to abandon a step half-done is
#     correct behaviour, not a defect.
#
# A person choosing a folder is therefore a real boundary of this product's acceptance, and the honest
# thing is to verify what can be verified: that the application asked the operating system, and that the
# prompt it put in front of the person says what it is for.
param(
  [Parameter(Mandatory = $true)][int]$ProcessId,
  [int]$TimeoutSeconds = 30
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class DialogWindows {
  [DllImport("user32.dll")] public static extern bool EnumWindows(Callback callback, IntPtr extra);
  public delegate bool Callback(IntPtr window, IntPtr extra);
  [DllImport("user32.dll")] public static extern int GetClassName(IntPtr window, StringBuilder text, int max);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr window);
}
'@

function Find-DialogHandle([int]$owner) {
  $handles = New-Object System.Collections.ArrayList
  $callback = [DialogWindows+Callback] {
    param($window, $extra)
    $windowProcess = 0
    [DialogWindows]::GetWindowThreadProcessId($window, [ref]$windowProcess) | Out-Null
    if ($windowProcess -eq $owner -and [DialogWindows]::IsWindowVisible($window)) {
      $class = New-Object System.Text.StringBuilder 256
      [DialogWindows]::GetClassName($window, $class, 256) | Out-Null
      # The application's own window is not a dialog class; the shell's picker is.
      if ($class.ToString() -eq '#32770') { $null = $handles.Add($window) }
    }
    return $true
  }
  [DialogWindows]::EnumWindows($callback, [IntPtr]::Zero) | Out-Null
  if ($handles.Count -eq 0) { return [IntPtr]::Zero }
  return $handles[0]
}

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$handle = [IntPtr]::Zero
while ($handle -eq [IntPtr]::Zero -and (Get-Date) -lt $deadline) {
  $handle = Find-DialogHandle $ProcessId
  if ($handle -eq [IntPtr]::Zero) { Start-Sleep -Milliseconds 300 }
}
if ($handle -eq [IntPtr]::Zero) {
  [pscustomobject]@{ open = $false } | ConvertTo-Json -Compress
  exit 0
}
$dialog = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
# Only what was observed. Whether a person answers the dialog is not something this can see, and
# reporting it as a measured field would be inventing an observation.
[pscustomobject]@{
  open = $true
  title = $dialog.Current.Name
  ownedByApplication = $true
  note = 'Este script observa el diálogo; no lo responde ni puede ver quién lo responde.'
} | ConvertTo-Json -Compress
