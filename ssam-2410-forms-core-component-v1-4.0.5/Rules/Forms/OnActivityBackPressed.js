/**
 * Handles the Android back button press event when a Mirata Form is displayed by attempting
 * to save form data before allowing navigation. If the form save fails, prompts the user to
 * confirm whether they want to lose unsaved changes.
 *
 * @param {ClientAPI} context - The MDK rule context object
 * @returns {Promise<void>} Promise that resolves when the back button handling is complete
 *
 * @description
 * This rule is triggered when the Android back button is pressed on a page containing
 * a Mirata form extension control. It performs the following actions:
 *
 * 1. Attempts to save the current form data using the "save-form" command
 * 2. If save succeeds, allows normal page navigation to continue
 * 3. If save fails, shows a confirmation dialog asking if the user wants to
 *    lose unsaved changes
 * 4. If user chooses "No" in the dialog, cancels the back button event
 * 5. If no form extension control is present, allows normal navigation
 */
export default async function OnActivityBackPressed(context) {
  const control = context.getControl("FormExtensionControl")
  if (control) {
    try {
      // Send the "save form" command to the Mirata MDK extension control.
      // A new form submission record will be created only if the form data
      // has been modified since the last time it was saved.
      const result = await control._control._executeCommand({command: "save-form"})
      // result.result:  0 (execution error) or 1 (execution success)
      // result.data.savePerformed (boolean) denotes if a new submission was created
      if (!result.result) {
        throw new Error("Failed to save form data")
      }
      // Now that the form was saved (if needed), allow the page navigation
      // to occur by not cancelling it (i.e. - do nothing).
      return
    } catch (error) {
      // Something went wrong attempting to save the form data. A LogInfo record
      // will contain the details. Let the user decide if the page navigation
      // should continue.
      const dialogActionData = {
        Name: "/SAPAssetManager/Actions/Common/GenericErrorDialog.action",
        Properties: {
          Title: "Unable to save form!",
          Message: "\nReturning to the previous screen will result in the loss of form modifications made since the last save.\n\nContinue?",
          OKCaption: "Yes",
          CancelCaption: "No"
        }
      }
      const result = await context.executeAction(dialogActionData)
      // Note: result.data (boolean) denotes which dialog button was pressed;
      // true = OK/Yes; false = Cancel/No
      if (result.data === false) {
        // Cancel the activity back button press event
        const appEventData = context.getAppEventData()
        if (appEventData && appEventData.hasOwnProperty("cancel")) {
          appEventData.cancel = true
        }
      }
    }
  } else {
    // The page does not contain the Mirata MDK extension control, so allow the
    // back button press event to continue by not attempting to cancel it.
  }
}
