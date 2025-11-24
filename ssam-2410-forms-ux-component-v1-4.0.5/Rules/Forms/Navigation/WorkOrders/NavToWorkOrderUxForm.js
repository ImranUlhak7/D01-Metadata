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
 * - workOrderId = <ID of target Work Order> (optional)
 * - operationId = <ID of target Work Order Operation> (conditionally optional)
 *
 * @note
 * The "formId" parameter name can be any case-insensitive variation of the following:
 * - formid
 * - form-id
 * @note
 * The "workOrderId" parameter name can be any case-insensitive variation of the following:
 * - workorderid
 * - workorder-id
 * - work-order-id
 * @note
 * The "operationId" parameter name can be any case-insensitive variation of the following:
 * - operationid
 * - operation-id
 * @note
 * If the "operationId" parameter is provided, the "workOrderId" parameter is required.
 * @note
 * If a "UX" form is being displayed that does not require a specific data context,
 * providing the "workOrderId" and "operationId" parameters is optional.
 *
 * @param {Object} context - The MDK page context object
 * @returns {Promise<Object>} Promise that resolves to the navigation action result
 * @throws {Error} If required form data is missing or navigation fails
 */
export default async function NavToWorkOrderUxForm(context) {
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
    const workOrderId = ruleInputData[FindKeyInObject(ruleInputData, ['workorderid', 'workorder-id', 'work-order-id'])]
    const operationId = ruleInputData[FindKeyInObject(ruleInputData, ['operationid', 'operation-id'])]
    // If the form to be displayed is a "UX" form, the submission query options
    // is not required because UX forms do not generate submissions.
    let submissionQueryOptions = ""

    if (workOrderId) {
      // The submission query logic used here is the same as that used in the
      // "Integration" component, where the work order number, or the work order
      // number and operation number, are stored in the "HeaderInfo" property of
      // the Mirata Forms Submission entity.
       //PTEN
      // if (operationId) {
      //   // Form ID is required only if it is possible for a work order operation
      //   // to have multiple forms associated with it. Otherwise, querying for the
      //   // form ID is superfluous but innocuous.
      //   submissionQueryOptions =
      //     "$filter=" +
      //     `definitionId eq '${formId}' and ` +
      //     `((substringof('"workorderid":"${workOrderId}"',tolower(headerInfo)) or ` +
      //     `substringof('"workorder-id":"${workOrderId}"',tolower(headerInfo)) or ` +
      //     `substringof('"work-order-id":"${workOrderId}"',tolower(headerInfo)) or ` +
      //     `substringof('"workorder_id":"${workOrderId}"',tolower(headerInfo)) or ` +
      //     `substringof('"work_order_id":"${workOrderId}"',tolower(headerInfo))) and ` +
      //     `(substringof('"operationid":"${operationId}"',tolower(headerInfo)) or ` +
      //     `substringof('"operation-id":"${operationId}"',tolower(headerInfo)) or ` +
      //     `substringof('"operation_id":"${operationId}"',tolower(headerInfo))))` +
      //     "&$orderby=version desc&$top=1"
      // } else {
         //PTEN
        // Form ID is required only if it is possible for a work order operation
        // to have multiple forms associated with it. Otherwise, querying for the
        // form ID is superfluous but innocuous.
        submissionQueryOptions =
          "$filter=" +
          `definitionId eq '${formId}' and ` +
          `(substringof('"workorderid":"${workOrderId}"',tolower(headerInfo)) or ` +
          `substringof('"workorder-id":"${workOrderId}"',tolower(headerInfo)) or ` +
          `substringof('"work-order-id":"${workOrderId}"',tolower(headerInfo)) or ` +
          `substringof('"workorder_id":"${workOrderId}"',tolower(headerInfo)) or ` +
          `substringof('"work_order_id":"${workOrderId}"',tolower(headerInfo)))` +
          "&$orderby=version desc&$top=1"
      // }//PTEN
    }

    // The following are referenced by the Forms Extention Page (ExtensionProperties)
    binding.FormId = formId
    binding.FormSubmissionQueryOptions = submissionQueryOptions
    binding.ContextData = operationId ? `Workorder#: ${workOrderId}; Operation#: ${operationId}` : `Workorder#: ${workOrderId}`

    pageProxy.setActionBinding(binding)
    return pageProxy.executeAction("/MirataFormsUxComponents/Actions/Forms/Navigation/FormsExtensionPageNav.action")
  } catch (error) {
    const component = "Navigation"
    const errorInfo = "Error navigating to page containing the Mirata MDK extension control"
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
