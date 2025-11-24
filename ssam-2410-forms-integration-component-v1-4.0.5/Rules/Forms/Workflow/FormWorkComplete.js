import addOperationNoteText from "../Notes/AddOperationNoteText"
import libCommon from "../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary"

/**
 * Adds text to the notes property of the work order operation in context
 * recording when the mobile user completed a form. The note includes the date,
 * time, and SAP username of the mobile user.
 *
 * The page displaying the Mirata form is closed after the note text is added.
 *
 * @param {IClientAPI} context - The client context object
 * @returns {Promise<void>} A promise that resolves when the note has been completed
 */
export default async function FormWorkComplete(context) {
  const timestamp = new Date();
  const note =
    `${timestamp.toLocaleDateString("en-US")} ` +
    `${timestamp.toLocaleTimeString("en-US")}: ` +
    'Form completed by user ' +
    `'${libCommon.getSapUserName(context)}'\n`;
  //PTEN Modification
  // await addOperationNoteText(context, note);
  //PTEN Modification
  return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action');
}
