export default async function OnFormUnlockPressed(context, confirm = false) {
  const control = context.getControl("FormExtensionControl")
  if (control) {
    try {
      // Send the "unlock form" command to the Mirata MDK extension control.
      const result = await control._control._executeCommand({ command: "unlock-form" })
    } catch (error) {
      // Something went wrong attempting to save the form data. A LogInfo record
      // will contain the details. Let the user decide if the page navigation
      // should continue.
      const dialogActionData = {
        Name: "/SAPAssetManager/Actions/Common/GenericErrorDialog.action",
        Properties: {
          Title: "Unable to unlock form!",
          Message: "\nThe form will remmain in read-only mode",
          OKCaption: "OK"
        }
      }
      const result = await context.executeAction(dialogActionData)
    }
  }
}
