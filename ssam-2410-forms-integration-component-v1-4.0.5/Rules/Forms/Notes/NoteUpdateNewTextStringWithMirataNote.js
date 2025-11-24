// This function is based the SAM 2210 version of
// SAPAssetManager/Rules/Notes/NoteUpdateNewTextString.js
import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import Constants from '../../../../SAPAssetManager/Rules/Common/Library/ConstantsLibrary';
import {NoteLibrary as NoteLib} from '../../Notes/NoteLibrary';
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Obtains the text from a Mirata form to be added to the business object in
 * context. Then, based on SSAM configuration settings, either appends the
 * text to existing "new" note text (if any) that may have been added to the
 * business object since the last synchronization session was performed, or
 * uses the text to replace any existing "new" note text.
 *
 * @param {IClientAPI} context - The client context object
 * @returns {string} The note text to add to the business object in context
 * @throws {Error} If an error occurs, it is logged and re-thrown
 */
export default function NoteUpdateNewTextStringWithMirataNote(context) {
    try {
        let updatedLocalNote = context.evaluateTargetPath('#Property:MirataNoteText');
        let newTextString = updatedLocalNote.trim();

        if (!libCommon.getStateVariable(context, Constants.stripNoteNewTextKey)) {
            // Should not strip previous text
            let note = libCommon.getStateVariable(context, Constants.noteStateVariable);
            //SAP Note 3042530 - the check between note.NewTextString and newTextString is needed to eliminate duplicates notes in some instances
            if (note && note.NewTextString && !(note.NewTextString === newTextString)) {
                // Note: the prependNoteText() function actually appends the new text to the existing text
                newTextString = NoteLib.prependNoteText(note.NewTextString, newTextString);
            }
        }
        return newTextString;
    } catch (error) {
        const component = "Add Mirata note text to existing 'new' note text";
        LogError(context, error, { component });
        throw error;
    }
}
