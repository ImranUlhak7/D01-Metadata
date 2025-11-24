import { NoteLibrary as NoteLib } from '../../Notes/NoteLibrary';
import ComLib from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import Constants from '../../../../SAPAssetManager/Rules/Common/Library/ConstantsLibrary';
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Adds text to the notes (i.e. - "long text") property of the work order
 * operation currently in context.
 *
 * The SSAM "note management" logic is quite complex. The logic in this rule
 * "shortcuts" the process to a degree, as the forms-based logic does not
 * require a UI to obtain the text to add from the user.
 *
 * The logic in this rule is based on the following SSAM 2005 logic...
 *   - Rules/Notes/NotesViewNav.js
 *   - Rules/Notes/NoteCreateNav.js
 *   - Rules/Notes/NoteCreateOnCommit.js
 *
 * The other Forms-specific custom logic that is (indirectly) invoked by this
 * Rule's logic includes...
 *   - Actions/Forms/Notes/NotesCreateOnWOOperationForMirataForm.action
 *   - Actions/Forms/Notes/NotesUpdateOnWOOperationForMirataForm.action
 *   - Rules/Forms/Notes/NoteCreateFromFormOnSuccess.js
 *   - Rules/Forms/Notes/NoteUpdateNewTextStringWithMirataNote.js
 *   - Rules/Forms/Notes/NoteUpdateTextStringWithMirataNote.js
 *
 * @param {IClientAPI} context - The client context object
 * @param {string} textToAdd - The text to add to the notes property of the
 *   work order operation currently in context
 * @returns {Promise<void>} Promise that resolves after the text has been added
 * @throws {Error} If an error occurs, the error is logged and re-thrown
 */
export default async function AddOperationNoteText(context, textToAdd) {
  try {
    if (!textToAdd) {
      return;
    }

    // NOTE: The following was obtained from SSAM 2005 "NotesViewNav.js" (up to the
    // next "NOTE:" comment)

    // Handling for the (virtual) page 'WorkOrderOperationMirataForm' (that does
    // not actually exist) was added to (the overridden version of) NoteLibrary.js.
    // This virtual page reference, in turn, provides a value to the "type" object
    // returned by the "NoteLib.getNoteTypeTransactionFlag()" call below
    if (NoteLib.didSetNoteTypeTransactionFlagForPage(context, 'WorkOrderOperationMirataForm')) {

      // NOTE: The following was obtained from SSAM 2005 "NoteCreateNav.js" (up to
      // the next "NOTE:" comment)

      // Set the global TransactionType variable to CREATE
      ComLib.setOnCreateUpdateFlag(context, 'CREATE');
      // Set the CHANGSET flag to false
      ComLib.setOnChangesetFlag(context, false);

      await NoteLib.noteDownload(context);

      // NOTE: The following was obtained from SSAM 2005 "NoteCreateOnCommit.js"
      let type = NoteLib.getNoteTypeTransactionFlag(context);
      if (type) {
        let note = ComLib.getStateVariable(context, Constants.noteStateVariable);
        // "Insert" the note text to add into the action binding object. Albeit
        // an "unconventional" maneuver, it is the easiest thing to do given how
        // we are "injecting" into the complex SAM note creation logic without
        // the use of a SAM-based UI component.
        context.binding["MirataNoteText"] = textToAdd;
        if (note) {
          if (type.noteUpdateAction) {
            ComLib.setStateVariable(context, Constants.stripNoteNewTextKey, false);
            await context.executeAction(type.noteUpdateAction);
            ComLib.setOnCreateUpdateFlag(context, '');
          }
        } else if (type.noteCreateAction) {
            await context.executeAction(type.noteCreateAction);
            ComLib.setOnCreateUpdateFlag(context, '');
        }
      }
    }
  } catch (error) {
    const component = "Add Mirata note to Operation";
    await LogError(context, error, { component });
    throw error;
  }
}