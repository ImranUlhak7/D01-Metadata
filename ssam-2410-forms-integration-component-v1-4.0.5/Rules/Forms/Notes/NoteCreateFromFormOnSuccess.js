import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Performs required post-processing after text has been added to the note
 * property of an SAP business object initiated from a Mirata form.
 *
 * This rule is based on SSAM 2110 Rule "/Rules/Notes/NoteCreateOnSuccess.js".
 * However, this version does not close the currently displayed page if
 * 'onChangeSet' is true, and does not present a toast-style success message
 * to the user when 'onChangeSet' is false.
 *
 * @param {IClientAPI} context - The client context object
 * @returns {void}
 * @throws {Error} If an error occurs, the error is logged and re-thrown
 */
export default function NoteCreateFromFormOnSuccess(context) {
    try {
        if (!libCommon.isOnWOChangeset(context)) {
            let onChangeSet = libCommon.isOnChangeset(context);

            if (onChangeSet) {
                libCommon.incrementChangeSetActionCounter(context);
            }
        }
    } catch (error) {
        const component = "Add Mirata note to Operation post-processing";
        LogError(context, error, { component });
        throw error;
    }
}
