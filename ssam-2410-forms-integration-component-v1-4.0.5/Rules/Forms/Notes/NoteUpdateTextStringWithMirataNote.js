// This function is based the SAM 2210 version of
// SAPAssetManager/Rules/Notes/NoteUpdateTextString.js
import NewTextString from './NoteUpdateNewTextStringWithMirataNote';
import RemoteTextString from '../../../../SAPAssetManager/Rules/Notes/NoteRemoteTextString';
import {NoteLibrary as NoteLib} from '../../Notes/NoteLibrary';
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Appends the text from a Mirata form to the "remote" note text of the
 * business object in context (i.e.- the note text received during the previous
 * synchronization session).
 *
 * @param {IClientAPI} context - The client context object
 * @returns {string} The combined note text
 * @throws {Error} If an error occurs, it is logged and re-thrown
 */
export default function NoteUpdateTextStringWithMirataNote(context) {
    try {
      // Note: the prependNoteText() function actually appends the new text to the remote text
      return NoteLib.prependNoteText(RemoteTextString(context), NewTextString(context));
    } catch(error) {
      const component = "Add Mirata note text to existing 'remote' note text";
      LogError(context, error, { component });
      throw error;
    }
}
