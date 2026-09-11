# Extra installer and uninstaller steps for this application.
#
# Two promises need code behind them. The license page tells the person that uninstalling removes only
# what the installer wrote, and the documentation says the same. Without these steps both statements
# would be false: the packager leaves a full copy of the installer in a per-user cache that nothing here
# ever reads, and the uninstaller removes the whole installation directory whether or not it created it.

!include LogicLib.nsh

# The installer copies itself to $LOCALAPPDATA\${APP_INSTALLER_STORE_FILE} to support differential
# updates. This application publishes no update channel, so that copy is dead weight the size of the
# installer itself. Remove it, and its folder when nothing else is left there.
# During an update the new installer writes that copy before the old uninstaller runs, so skip it then.
!macro customUnInstall
  ${ifNot} ${isUpdated}
    Push $R7
    Delete "$LOCALAPPDATA\${APP_INSTALLER_STORE_FILE}"
    ${StdUtils.GetParentPath} $R7 "$LOCALAPPDATA\${APP_INSTALLER_STORE_FILE}"
    ${if} $R7 != ""
      RMDir "$R7"
    ${endif}
    Pop $R7
  ${endif}
!macroend

!ifndef BUILD_UNINSTALLER
# The uninstaller deletes the installation directory recursively. That is correct for a directory this
# installer created, and destructive for one the person already filled with their own work. A chosen
# destination normally gains a product subdirectory, except when the path already contains the product
# name: that is the one case where an installation and the person's files would share a folder. Refuse
# such a destination unless it is empty or already holds this application.
#
# The substring test is written here rather than included: the assisted installer template includes the
# helper that provides it, and that helper declares variables, so including it twice fails to compile.
Function .onVerifyInstDir
  Push $R0
  Push $R1
  Push $R2
  Push $R3
  StrLen $R2 "${APP_FILENAME}"
  StrCpy $R3 0
  StrCpy $R0 ""
  scan:
    StrCpy $R1 $INSTDIR $R2 $R3
    StrCmp $R1 "" scanned
    StrCmp $R1 "${APP_FILENAME}" 0 next
      StrCpy $R0 "shared"
      Goto scanned
    next:
    IntOp $R3 $R3 + 1
    Goto scan
  scanned:
  # Only a destination that will not gain a subdirectory can collide with existing files.
  ${if} $R0 == "shared"
  ${andIfNot} ${FileExists} "$INSTDIR\${APP_FILENAME}.exe"
    FindFirst $R1 $R0 "$INSTDIR\*.*"
    entries:
      StrCmp $R0 "" closed
      StrCmp $R0 "." skip
      StrCmp $R0 ".." skip
        FindClose $R1
        Pop $R3
        Pop $R2
        Pop $R1
        Pop $R0
        Abort
      skip:
      FindNext $R1 $R0
      Goto entries
    closed:
    FindClose $R1
  ${endif}
  Pop $R3
  Pop $R2
  Pop $R1
  Pop $R0
FunctionEnd
!endif
