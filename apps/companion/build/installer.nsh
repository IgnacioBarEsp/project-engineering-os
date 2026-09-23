# Extra installer and uninstaller steps for this application.
#
# Two promises need code behind them. The license page tells the person that uninstalling removes only
# what the installer wrote, and the documentation says the same. Without these steps both statements
# would be false: the packager leaves a full copy of the installer in a per-user cache that nothing here
# ever reads, and the uninstaller removes the whole installation directory whether or not it created it.

!include LogicLib.nsh
!include nsDialogs.nsh
!include MUI2.nsh

!ifndef BUILD_UNINSTALLER
  Var /GLOBAL createDesktopShortcutChoice
  Var /GLOBAL desktopShortcutLabel
  Var /GLOBAL desktopShortcutCheckbox
!endif

# The installer copies itself to $LOCALAPPDATA\${APP_INSTALLER_STORE_FILE} to support differential
# updates. This application publishes no update channel, so that copy is dead weight the size of the
# installer itself. Remove it, and its folder when nothing else is left there.
# During an update the new installer writes that copy before the old uninstaller runs, so skip it then.
!macro customUnInstall
  Delete "$oldDesktopLink"
  Delete "$newDesktopLink"
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
# Detect previously installed versions of the application from Windows registry.
# When the same version is installed: allow repairing (reinstalling files), uninstalling or cancelling.
# When an earlier version is installed: allow updating or cancelling.
# When the person cancels: abort immediately without modifying files or registry.
!macro customInit
  # The assisted page can change this value. /S never renders the page, so this checked default is
  # also the documented silent-install behavior.
  StrCpy $createDesktopShortcutChoice "true"
  Push $0
  Push $1
  Push $2
  Push $3
  ReadRegStr $0 HKCU "${UNINSTALL_REGISTRY_KEY}" "DisplayVersion"
  ${if} $0 != ""
    ReadRegStr $1 HKCU "${UNINSTALL_REGISTRY_KEY}" "UninstallString"
    ReadRegStr $2 HKCU "${UNINSTALL_REGISTRY_KEY}" "InstallLocation"
    ${if} $0 == "${VERSION}"
      MessageBox MB_YESNOCANCEL|MB_ICONQUESTION \
        "Ya se encuentra instalada la versión $0 de ${PRODUCT_NAME}.$\n$\n• Presiona [Sí] para REPARAR la instalación actual.$\n• Presiona [No] para DESINSTALAR el programa por completo.$\n• Presiona [Cancelar] para salir sin hacer cambios." \
        /SD IDYES IDYES doRepair IDNO doUninstall
      Quit
      doUninstall:
        ${if} $1 != ""
          ExecWait '$1 /S _?=$2' $3
        ${endif}
        Quit
      doRepair:
    ${else}
      MessageBox MB_OKCANCEL|MB_ICONQUESTION \
        "Se ha detectado una versión previa ($0) de ${PRODUCT_NAME}.$\n$\n¿Deseas actualizar a la versión ${VERSION}?$\n$\nPresiona [Aceptar] para continuar con la actualización o [Cancelar] para salir." \
        /SD IDOK IDOK doUpgrade
      Quit
      doUpgrade:
    ${endif}
  ${endif}
  Pop $3
  Pop $2
  Pop $1
  Pop $0
!macroend

!ifndef BUILD_UNINSTALLER
  # The packager's createDesktopShortcut option is disabled so this choice is made before the install
  # section creates the files. MUI pages are inserted after the directory page by the stock assisted
  # installer template.
  !macro customPageAfterChangeDir
    Page custom CreateDesktopShortcutPageCreate CreateDesktopShortcutPageLeave
  !macroend

  Function CreateDesktopShortcutPageCreate
    !insertmacro MUI_HEADER_TEXT "Acceso directo del escritorio" "Elige si quieres crearlo para esta cuenta."
    nsDialogs::Create 1018
    Pop $0
    ${if} $0 == error
      Abort
    ${endif}
    ${NSD_CreateLabel} 0 0 100% 28u "Elige si quieres un acceso directo de Project Engineering OS en el escritorio."
    Pop $desktopShortcutLabel
    ${NSD_CreateCheckbox} 0 36u 100% 14u "Crear acceso directo en el escritorio"
    Pop $desktopShortcutCheckbox
    ${if} $createDesktopShortcutChoice == "true"
      ${NSD_SetState} $desktopShortcutCheckbox 1
    ${else}
      ${NSD_SetState} $desktopShortcutCheckbox 0
    ${endif}
    nsDialogs::Show
  FunctionEnd

  Function CreateDesktopShortcutPageLeave
    ${NSD_GetState} $desktopShortcutCheckbox $0
    ${if} $0 == 1
      StrCpy $createDesktopShortcutChoice "true"
    ${else}
      StrCpy $createDesktopShortcutChoice "false"
    ${endif}
  FunctionEnd

  # The generated install section calls this hook after it has set the application and link variables.
  # It owns exactly the product link, while the Start-menu shortcut remains electron-builder's.
  !macro customInstall
    ${if} $createDesktopShortcutChoice == "true"
      CreateShortCut "$newDesktopLink" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
      WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"
    ${else}
      Delete "$oldDesktopLink"
      Delete "$newDesktopLink"
    ${endif}
  !macroend
!endif

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
