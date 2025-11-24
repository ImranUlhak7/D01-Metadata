import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary'
import libMobile from '../../../../SAPAssetManager/Rules/MobileStatus/MobileStatusLibrary'
import libForms from '../../Forms/Library/FormsLibrary'
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
import { NoteLibrary as NoteLib} from '../../Notes/NoteLibrary'

/**
 * Determines if the Mirata toolbar icon should be enabled based on the current
 * SSAM assignment type, the status of the current business object and if
 * the business object is form-enabled.
 *
 * @param {IClientAPI} context - The MDK page context
 * @returns {Promise<boolean>} A promise that resolves to:
 *   - true if:
 *     - The business object is form-enabled AND
 *     - For header-level assignments: Work Order is started and operation is not confirmed
 *     - For operation-level assignments: Operation is started
 *   - false otherwise
 * @throws {Error} If unable to determine page name or note component
 */
export default async function EnableMirataToolbarIcon(context) {
  try {
    const page = context?.getPageProxy?.()?._page?._definition?.getName?.() ?? context?.getPageProxy?.()?._page?._definition?.name ?? context?._page?._definition?.getName?.();
    if (!page) {
      throw new Error("Unable to determine page name");
    }
    // Getting the note component for the current page sets the "note type
    // transaction flag which is used to determine if the business object is
    // Mirata form-enabled. This logic was copied from the SSAM rule
    // "/SAPAssetManagerRules/Notes/NotesCount.js.
    const noteComponent = NoteLib.getNoteComponentForPage(context, page);
    if (!noteComponent) {
      throw new Error("Unable to determine note component");
    }
    const isBusinessObjectFormEnabled = await libForms.isBusinessObjectFormEnabled(context);
    if (isBusinessObjectFormEnabled) {
      // Get the "started" mobile status value
      const started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
      // Get the "assignment level"
      const assignmentLevel = libCommon.getWorkOrderAssnTypeLevel(context);
      if (assignmentLevel === "Header") {
        // Assignments are at the Work Order Header level
        // Return true if Work Order has "started" mobile status and the
        // Operation has not been "confirmed"; otherwise, return false
        let woHeaderMobileStatus;
        if (context.binding.ObjectType === "OVG") {
          woHeaderMobileStatus = libMobile.getMobileStatus(context.binding.WOHeader, context);
        } else {
          woHeaderMobileStatus = libMobile.getMobileStatus(context.binding, context);
        }
        if (woHeaderMobileStatus === started) {
          return libMobile.isMobileStatusConfirmed(context).then( (isMobileStatusConfirmed) => {
            return (isMobileStatusConfirmed === false);
          })
        } else {
          // The Work Order does not have "started" mobile status
          return false;
        }
      } else if (assignmentLevel === "Operation") {
        // Assignments are at the Operation level
        // Return true if the Operation has "started" mobile status
        const operationMobileStatus = libMobile.getMobileStatus(context.binding, context);
        return (operationMobileStatus === started);
      } else if (assignmentLevel === "SubOperation") {
        // Assignments are at the SubOperation level
        // This assignment model is not yet supported
        return false;
      } else {
        // Should never get here
        return false;
      }
    } else {
      // Operation is not "form enabled"
      return false;
    }
  } catch (error) {
    const component = "User Interface";
    const errorInfo = "Error determining enabled status of Mirata toolbar icon";
    LogError(context, error, { component, mdkInfo: { errorInfo } });
    return false;
  }
}
