import LogError from './LogError';
/**
 * This is the default error notification function for the Mirata MDK Extension Control.
 * Input parameter data is passed via the MDK "Client Data" object, and specifically,
 * via the object key path "<Client Data object>.MirataFormsData.ErrorInfo" whose value
 * itself is an object that meets the following interface specification:
 *
 * interface ErrorInfo {
 *   title?: string             // Title bar text
 *   message: string            // Dialog body text
 *   okButtonText?: string      // OK (right) button text
 *   cancelButtonText?: string  // Cancel (left) button text
 *   fatal?: boolean            // Fatal error indicator
 * }
 *
 * If the "title" key's value is not defined, "Mirata Forms Error" is used.
 *
 * If the "okButtonText" key's value is not defined or empty string, the "ok" (or right)
 * dialog button text defaults to "OK". If the "cancelButtonText" key is not defined or
 * its value is empty string, the "cancel" (or left) dialog button is not displayed.
 *
 * The "fatal" key specifies if a fatal-class error has occurred. When set to true, the
 * "ok" (or right) dialog button text is set to "< Back", and if pressed, the page
 * containing the Mirata MDK Extension Control is closed. The "cancel" (or right)
 * dialog button is not displayed.
 *
 * If the "ok" (or right) dialog button is pressed, Boolean true is returned. If the
 * "cancel" (or left) button is displayed and pressed, Boolean false is returned. Both
 * values are returned via a Promise.
 *
 * @param {*} context the current MDK context
 * @returns Promise<boolean>
 *    true - the "ok" (or right) button was pressed
 *    false - the "cancel" (or left) button was pressed
 *    undefined - an error occurred presenting the dialog
 */
export default async function displayError(context) {
  try {
    const clientData = context.getClientData()
    if (!clientData.MirataFormsData.ErrorInfo || !clientData.MirataFormsData.ErrorInfo.message) {
      throw new Error("Mirata MDK Extension Control 'displayError()' called with no error information provided")
    }

    const {fatal, ...errorInfo} = clientData.MirataFormsData.ErrorInfo

    if (!errorInfo.title) {
      errorInfo.title = "Mirata Forms Error"
    }
    if (fatal === true) {
      errorInfo.okButtonText = "< Back"
      errorInfo.cancelButtonText = undefined
    } else if (!errorInfo.okButtonText) {
      errorInfo.okButtonText = "OK"
    }

    // Result is Boolean true when the "ok" button is pressed, and false when
    // the "cancel" button is pressed.
    const result = await context.nativescript.uiDialogsModule.confirm(errorInfo)
    if (fatal) {
      await context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action');
    }
    return result
  } catch (error) {
    const component = "User Interface"
    const errorInfo = "Issue presenting Mirata error message"
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    return undefined
  }
}
