/**
 * Handles back button press events when a Mirata Form is displayed by attempting
 * to save form data before allowing navigation. If the form save fails, prompts the user
 * to confirm whether they want to lose unsaved changes.
 *
 * @param {ClientAPI} context - The MDK rule context object
 * @param {boolean} [confirm=false] - Whether to use the "save-form-confirm" command instead of "save-form"
 * @returns {Promise<boolean>} Promise that resolves to true if navigation should continue, false otherwise
 *
 * @description
 * This rule is triggered when a back button is pressed on a page containing
 * a Mirata form extension control. It performs the following actions:
 *
 * 1. Attempts to save the current form data using either "save-form" or "save-form-confirm" command
 * 2. If save succeeds and data was saved, allows navigation to continue (returns true)
 * 3. If save fails or no data was saved, throws an error to trigger error handling
 * 4. In error cases, shows a confirmation dialog asking if the user wants to
 *    lose unsaved changes
 * 5. Returns the user's choice from the dialog (true = continue, false = cancel)
 * 6. If no form extension control is present, allows normal navigation (returns true)
 */
export default async function OnBackButtonPressed(context, confirm = false) {
  const control = context.getControl("FormExtensionControl")
  if (control) {
    try {
      // Send the "save form" command to the Mirata MDK extension control.
      // A new form submission record will be created only if the form data
      // has been modified since the last time it was saved.
      const command = confirm ? "save-form-confirm" : "save-form"
      const result = await control._control._executeCommand({ command })
      // result.result:  0 (execution error) or 1 (execution success)
      // result.data.savePerformed (boolean) denotes if a new submission was created
      if (!result.result) {
        throw new Error("Failed to save form data")
      }
      // Now that the form was saved (if needed), allow the page navigation
      // to occur by returning boolean true
      return true
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
      return result.data
    }
  } else {
    // The page does not contain the Mirata MDK extension control, so allow the
    // back button press event to continue.
    return true
  }
}
