import FindKeyInObject from "../../../../../MirataFormsCoreComponents/Rules/Common/FindKeyInObject"
import IsSubOperationLevelAssigmentType from "../../../../../SAPAssetManager/Rules/WorkOrders/SubOperations/IsSubOperationLevelAssigmentType"
import LogError from "../../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
import OperationDataBinding from "./Binding/OperationDataBinding"
import OperationQueryOptions from "./Query/OperationQueryOptions"
import WorkOrderDataBinding from "./Binding/WorkOrderDataBinding"
import WorkOrderQueryOptions from "./Query/WorkOrderQueryOptions"

/**
  * Retrieves the context binding object for UX forms that require a work order
  * or operation data context.
  *
  * The work order number and optional operation number are passed either as
  * parameters to the function (when called by another rule) or via the Mirata
  * portion of the Client Data object (when invoked by the Mirata MDK Extension
  * Control).
  *
  * Required:
  * - Work Order ID: When passed via the Client Data object, any of these keys
  *   may be used (case-insensitive):
  *   - workorderid
  *   - workorder-id
  *   - work-order-id
  *
  * Optional:
  * - Operation ID: When passed via the Client Data object, either of the following
  *   keys may be used (case-insensitive):
  *   - operationid
  *   - operation-id
  *
  * If an operation ID is provided, an operation-centric binding object is returned.
  * Otherwise, a work order-centric binding object is returned.
  *
  * Functions are called to build the appropriate query option statements; see
  * these functions for details regarding the result set returned.
  *
  * Lastly, the result set is passed to the appropriate binding function, which
  * performs any additional data transformations required by the UX form to be
  * displayed.
  *
  * @param {IClientAPI} context - The client context object
  * @returns {Promise<object>} The work order or operation binding object
  * @throws {Error} If work order ID is missing from client data or if entity read fails
  */
export default async function WorkOrderOrOperationContextBinding(context, workOrderId = null, operationId = null) {
  try {
    if (IsSubOperationLevelAssigmentType(context)) {
      throw new Error("Suboperation assignment type is not supported")
    }
    // If no work order ID is passed in, then get it from the Client Data object.
    if (!workOrderId) {
      const clientData = context.getClientData()
      if (!clientData.MirataFormsData || !clientData.MirataFormsData.FormRuleInputData || Object.keys(clientData.MirataFormsData.FormRuleInputData).length === 0) {
        throw new Error("Mirata rule input data is not available in the Client Data object")
      }
      const ruleInputData = clientData.MirataFormsData.FormRuleInputData

      workOrderId = ruleInputData[FindKeyInObject(ruleInputData, ['workorderid', 'workorder-id', 'work-order-id'])]
      if (!workOrderId) {
        throw new Error("Work order ID is not available in the Client Data object")
      }

      // If the work order ID was passed via the Client Data object, then the
      // (optional) operation ID will be passed via the Client Data object as
      // well.
      operationId = ruleInputData[FindKeyInObject(ruleInputData, ['operationid', 'operation-id'])]
    }

    let queryOptions = null
    let readLink = null
    if (workOrderId) {
      if (operationId) {
        readLink = `MyWorkOrderOperations(OrderId='${workOrderId}',OperationNo='${operationId}')`
        queryOptions = await OperationQueryOptions(context, readLink)
      } else {
        readLink = `MyWorkOrderHeaders('${workOrderId}')`
        queryOptions = WorkOrderQueryOptions(context)
      }
    }

    // If the returned query options is not a string, then it should be
    // a DataQueryBuilder instance and the query options need to be built.
    if (typeof queryOptions !== 'string') {
      if (typeof queryOptions.build === 'function') {
        queryOptions = await queryOptions.build()
      } else {
        throw new Error(`Error obtaining query options for '${readLink}'`)
      }
    }

    // Obtain the data binding object.
    let binding = null
    const result = await context.read('/SAPAssetManager/Services/AssetManager.service', readLink, [], queryOptions)
    if (result && result.getItem(0)) {
      binding = result.getItem(0)
      if (operationId) {
        binding = await OperationDataBinding(context, binding)
      } else {
        binding = await WorkOrderDataBinding(context, binding)
      }
    } else {
      throw new Error(`Error obtaining ${operationId ? "operation" : "work order"} data context for UX form`)
    }
    return binding
  } catch (error) {
    const component = "UX Forms"
    const errorInfo = `Error obtaining ${operationId ? "operation" : "work order"} data context for UX form`
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
