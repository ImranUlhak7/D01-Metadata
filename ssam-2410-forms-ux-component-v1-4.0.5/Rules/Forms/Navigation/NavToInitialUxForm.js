import GetInitialUxForm from "../../../../MirataFormsCoreComponents/Rules/Forms/DataTables/GetInitialUxForm"
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Navigates to the initial UX form for a given business object type.
 * Retrieves the initial form ID from the SSAM UX Configuration data table
 * and navigates to that form using the Forms Extension Page.
 *
 * @param {IClientAPI} context - The MDK page context object
 * @param {string} busObjType - The type of SSAM business object, which must be
 *   a case-sensitive match for a key in the "SSAM UX Configuration" data table.
 * @returns {Promise<Object>} Promise that resolves to the navigation action result
 * @throws {Error} If form ID lookup fails or navigation fails
 */
export default async function NavToInitialUxForm(context, busObjType) {
  try {
    let pageProxy;
    if (typeof context.getPageProxy === "function") {
      pageProxy = context.getPageProxy();
    } else {
      pageProxy = context;
    }

    const initialFormId = await GetInitialUxForm(context, busObjType);

    // Add the parameters required by the Forms Extension Page to the binding
    // object. Use the inherited binding object, or create a new one if none
    // exists.

    // Note: an "initial" UX form typically utilizes a Mirata Forms list
    // control to present a list of business objects to the user. The data
    // presented by the list control is typically provided by an integration
    // data mapping rule that is invoked by the list control's "Initial Value"
    // property (as a calculation).
    const bindingObject = pageProxy.binding || {};
    bindingObject.FormId = initialFormId;
    // UX forms do not persist data, so do not generate submissions
    bindingObject.FormSubmissionQueryOptions = "";
    bindingObject.ContextData = `Display initial ${busObjType} UX form: ${initialFormId}`;

    pageProxy.setActionBinding(bindingObject);
    return pageProxy.executeAction("/MirataFormsUxComponents/Actions/Forms/Navigation/FormsExtensionPageNav.action");
  } catch (error) {
    const component = "Navigation";
    const errorInfo = `Error navigating to initial UX form ID '${initialFormId}'`;
    await LogError(context, error, { component, mdkInfo: { errorInfo } } );
    throw error;
  }
}
