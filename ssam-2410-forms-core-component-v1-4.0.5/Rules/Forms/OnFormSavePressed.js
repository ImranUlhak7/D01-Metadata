export default async function OnFormSavePressed(context, confirm = true) {
  const control = context.getControl("FormExtensionControl")
  if (control) {
    try {
      // Send the "save form" command to the Mirata MDK extension control.
      // A new form submission record will be created only if the form data
      // has been modified since the last time it was saved.
      const command = confirm ? "save-form-confirm" : "save-form"
      const result = await control._control._executeCommand({ command })
      // Note: result.data.savePerformed (boolean) denotes if a new submission
      // was created

      // Now that the form was saved (if needed), allow the page navigation
      // to occur by returning boolean true
      return true
    } catch (error) {
      // Something went wrong attempting to save the form data. A LogInfo record
      // will contain the details.
      const dialogActionData = {
        Name: "/SAPAssetManager/Actions/Common/GenericErrorDialog.action",
        Properties: {
          Title: "Unable to save form!",
          Message: "\nAn error occurred attempting to save the form.",
          OKCaption: "OK",
        }
      }
      const result = await context.executeAction(dialogActionData)
      // Note: result.data (boolean) denotes which dialog button was pressed;
      // true = OK/Yes; false = Cancel/No
      return result.data
    }
  } else {
    // The page does not contain the Mirata MDK extension control, so allow the
    // back button press event to continue.
    return true
  }
}