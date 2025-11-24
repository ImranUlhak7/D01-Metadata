import FormsLibrary from "../Library/FormsLibrary";
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
import NavToForm from "./FormsExtensionPageNavFromWorkOrderOperationDetailsPage"

/**
 * Handles the press event for the Mirata Forms toolbar icon on the Work Order
 * Operation Details page. If the work order operation in context is form list-
 * enabled and a corresponding form submission does not already exist, navigation
 * to the Forms List View page is performed. Otherwise, navigation to the Forms
 * Extension page is performed.
 *
 * @param {IClientAPI} context - The MDK page context
 * @returns {Promise<void>} Promise that resolves after navigation is complete
 * @throws {Error} If navigation fails, the error is logged and re-thrown
 */
export default async function FormsToolbarIconPressEventHandler(context) {
  try {
    const isBusinessObjectFormListEnabled = await FormsLibrary.isBusinessObjectFormListEnabled(context);
    if (isBusinessObjectFormListEnabled) {
      const submissionEntity = await FormsLibrary.getLatestFormSubmissionEntityForOperation(context);
      if (submissionEntity) {
        return NavToForm(context, submissionEntity.definitionId);
      }
      return context.executeAction("/MirataFormsIntegrationComponents/Actions/Forms/Navigation/FormsListViewPageNav.action");
    }
    return NavToForm(context);
  } catch (error) {
    const component = "Navigation";
    const errorInfo = "Error navigating to page containing the Mirata MDK extension control";
    await LogError(context, error, { component, mdkInfo: { errorInfo } } );
    throw error;
  }
}
