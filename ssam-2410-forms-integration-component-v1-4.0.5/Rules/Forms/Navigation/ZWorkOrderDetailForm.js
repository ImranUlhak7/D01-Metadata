import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

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
export default async function ZWorkOrderDetailForm(context) {
  try {
    
    let pageProxy;
    if (typeof context.getPageProxy === "function") {
      pageProxy = context.getPageProxy();
    } else {
      pageProxy = context;
    }
    
    const bindingObject = context.getPageProxy().getActionBinding() || context.binding || context.getActionBinding() || {};

    let formId = "pten-dev.form.mp-test-engine-waukesha-technical-level-annual";
    if(bindingObject.OrderType === 'PM01'){
      formId = "pten-dev.form.engine-waukesha-cwo";
    }

    bindingObject.FormId = formId;
    bindingObject.ContextData = {};
    
    pageProxy.setActionBinding(bindingObject);
    return pageProxy.executeAction("/MirataFormsIntegrationComponents/Actions/Forms/Navigation/FormsExtensionPageNav.action");

  } catch (error) {
    const component = "Navigation";
    const errorInfo = "Error navigating to page containing the Mirata MDK extension control";
    await LogError(context, error, { component, mdkInfo: { errorInfo } } );
    throw error;
  }
}
