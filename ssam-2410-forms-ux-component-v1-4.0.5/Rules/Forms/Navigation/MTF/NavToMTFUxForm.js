import FindKeyInObject from "../../../../../MirataFormsCoreComponents/Rules/Common/FindKeyInObject"
import LogError from "../../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Navigates from a Mirata form to another Mirata form that...
 * - requires a work order data context, or
 * - requires a work order operation data context, or
 * - is a "UX" form that does not require a specific data context
 *
 * This rule is designed to be referenced in the "request" definition of a Mirata
 * "Integration Action" of type "Embedded Integration Event" that takes the following
 * input parameters:
 * - formId = <ID of target Mirata Form> (required)
 * - OrderID = <ID of target Work Order> (optional)
 *
 * @note
 * The "formId" parameter name can be any case-insensitive variation of the following:
 * - formid
 * - form-id
 * @note
 * The "OrderID" parameter name can be any case-insensitive variation of the following:
 * @note
 * If a "UX" form is being displayed that does not require a specific data context,
 * providing the "workOrderId" and "operationId" parameters is optional.
 *
 * @param {Object} context - The MDK page context object
 * @returns {Promise<Object>} Promise that resolves to the navigation action result
 * @throws {Error} If required form data is missing or navigation fails
 */
export default async function NavToMTFUxForm(context) {
  try {
    let binding = context.binding || {}
    const clientData = context.getClientData()
    const pageProxy = context.getPageProxy()

    if (!clientData.MirataFormsData || !clientData.MirataFormsData.FormRuleInputData || Object.keys(clientData.MirataFormsData.FormRuleInputData).length === 0) {
      throw new Error("Mirata rule input data is not available in the Client Data object")
    }

    const ruleInputData = clientData.MirataFormsData.FormRuleInputData

    const formId = ruleInputData[FindKeyInObject(ruleInputData, ['formid', 'form-id'])]
    if (!formId) {
      throw new Error("ID of Form to display is not available in the Mirata Rule Data object")
    }

    // If the form to be displayed is a "UX" form, an associated work order ID
    // and operation ID may not be present.
    const MaterialDocumentNumber = ruleInputData[FindKeyInObject(ruleInputData, ['MaterialDocumentNumber'])]
    // If the form to be displayed is a "UX" form, the submission query options
    // is not required because UX forms do not generate submissions.
    let submissionQueryOptions = ""

    if (MaterialDocumentNumber) {
        submissionQueryOptions =
          "$filter=" +
          `definitionId eq '${formId}' and ` +
          `(substringof('"MaterialDocumentNumber":"${MaterialDocumentNumber}"',headerInfo))` +
          "&$orderby=version desc&$top=1"
    }

    // The following are referenced by the Forms Extention Page (ExtensionProperties)
    binding.FormId = formId
    binding.FormSubmissionQueryOptions = submissionQueryOptions
    //binding.ContextData = operationId ? `Workorder#: ${workOrderId}; Operation#: ${operationId}` : `Workorder#: ${workOrderId}`

    pageProxy.setActionBinding(binding)
    return pageProxy.executeAction("/MirataFormsUxComponents/Actions/Forms/Navigation/FormsExtensionPageNav.action")
  } catch (error) {
    const component = "Navigation"
    const errorInfo = "Error navigating to page containing the Mirata MDK extension control"
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
