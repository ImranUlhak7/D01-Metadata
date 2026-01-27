import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
import ZGetPlantRigList from "../../../../ZSAPAssetManager/Rules/MTF/ZGetPlantRigList"
import libCom from "../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary"

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
export default async function ZCreateMTFForm(context) {
  try {
    
    let pageProxy;
    if (typeof context.getPageProxy === "function") {
      pageProxy = context.getPageProxy();
    } else {
      pageProxy = context;
    }
    
    const bindingObject = {};

    let formId = "pten-dev.form.inventory-transfer-template";

    bindingObject.FormId = formId;

    let zdate = (new Date()).toISOString().replace(/[:\-]/g, '').split('.')[0];

    bindingObject.FormSubmissionQueryOptions = "$filter=" +
        `(substringof('"MaterialDocumentNumber":"${zdate}"',headerInfo))` +
        "&$orderby=version desc&$top=1"

    bindingObject.ContextData = `MaterialDocumentNumber#: ${zdate}`;
    bindingObject.MaterialDocumentNumber = zdate

    bindingObject.DefaultPlant = libCom.getUserDefaultPlant();
    const plantRigList = await ZGetPlantRigList(context);
    bindingObject.PlantRigList = plantRigList;

    pageProxy.setActionBinding(bindingObject);
    return pageProxy.executeAction("/MirataFormsIntegrationComponents/Actions/Forms/Navigation/FormsExtensionPageNav.action");

  } catch (error) {
    const component = "Navigation";
    const errorInfo = "Error navigating to page containing the Mirata MDK extension control";
    await LogError(context, error, { component, mdkInfo: { errorInfo } } );
    throw error;
  }
}
 