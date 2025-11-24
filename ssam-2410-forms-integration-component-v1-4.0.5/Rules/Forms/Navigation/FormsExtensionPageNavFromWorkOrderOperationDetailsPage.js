import FormsLibrary from "../Library/FormsLibrary";
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Navigates to the Forms Extension page from the Work Order Operation Details Page.
 * Sets up the data required by the Forms Extension page and passes it as data
 * bound to the Forms Extension page's navigation action.
 *
 * @param {IClientAPI} context - The client context object
 * @param {string} formId - (optional) the ID of the form to display. If not
 *   provided, the form ID will be retrieved from the notes property of the
 *   work order operation in context.
 * @returns {Promise<IActionResult>} Promise that returns the result of the
 *   navigation action
 * @throws {Error} If navigation fails
 */
export default async function FormsExtensionPageNavFromWorkOrderOperationDetailsPage(context, formId) {
  try {
    let pageProxy;
    if (typeof context.getPageProxy === "function") {
      pageProxy = context.getPageProxy();
    } else {
      pageProxy = context;
    }

    if (!formId) {
      // If no form ID is provided, retrieve the form ID from the notes property
      // of the work order operation.
      formId = await FormsLibrary.getFormIdForBusinessObject(context);
    }

    const bindingObject = pageProxy.binding || {};
    bindingObject.FormId = formId;
    // Retrieve the form submission query options used to determine if a form
    // submission exists for the form-enabled work order operation.
    bindingObject.FormSubmissionQueryOptions = await FormsLibrary.getFormSubmissionQueryOptionsForFormEnabledOperation(context);
    // Retrieve the data that will help identify the functional context if an
    // error occurs.
    bindingObject.ContextData = FormsLibrary.getContextDataForWorkorderOperation(context);

    pageProxy.setActionBinding(bindingObject);
    return pageProxy.executeAction("/MirataFormsIntegrationComponents/Actions/Forms/Navigation/FormsExtensionPageNav.action");
  } catch (error) {
    const component = "Navigation";
    const errorInfo = "Error navigating to page containing the Mirata MDK extension control";
    await LogError(context, error, { component, mdkInfo: { errorInfo } });
    throw error;
  }
}
