import IsOperationLevelAssigmentType from '../../../../../SAPAssetManager/Rules/WorkOrders/Operations/IsOperationLevelAssigmentType'
import IsSubOperationLevelAssigmentType from '../../../../../SAPAssetManager/Rules/WorkOrders/SubOperations/IsSubOperationLevelAssigmentType'
import LogError from "../../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
import OperationDataBindingMirata from "./Binding/OperationDataBindingMirata"
import OperationListQueryOptions from "./Query/OperationListQueryOptions"
import WorkOrderDataBindingMirata from "./Binding/WorkOrderDataBindingMirata"
import WorkOrderListQueryOptions from "./Query/WorkOrderListQueryOptions"
/**
  * Retrieves and processes operation and/or work order data based on assignment type.
  *
  * This function handles two different assignment types:
  * 1. Operation-level assignment: Retrieves each assigned operation and adds the work order header information.
  * 2. Work order-level assignment: Retrieves header information for each assigned work order
  *
  * Functions are called to build the appropriate query option statements; see these functions for details
  * regarding the result set returned.
  *
  * Lastly, the result set is passed to the appropriate binding function, which performs any additional data
  * transformations required by the UX form to be displayed, including:
  * - Converts SSAM date formats to Mirata date formats (milliseconds since epoch)
  * - Retrieves and adds equipment, functional location and work order type descriptions
  * - Adds mobile status information
  * - Combines SSAM-formatted date and time fields where applicable
  *
  * @param {IClientAPI} context - The client context object
  *
  * @returns {Promise<Array<Object>>} An array of work order or operation objects, where each object contains:
  *   - For operation-level assignments: Operation-specific data merged with work order header information
  *   - For work order-level assignments: Work order header information
  *
  * @throws {Error} If there's an error reading or processing the work order data
  * @throws {Error} If suboperation assignment type is used (not yet supported)
  */
export default async function WorkOrderOrOperationListMirata(context) {
  if (IsSubOperationLevelAssigmentType(context)) {
    throw new Error("Suboperation assignment type is not yet supported")
  }
  try {
    const listArray = []
    if (IsOperationLevelAssigmentType(context)) {
      // Get the query options for obtaining the list of operations. Even though
      // the default function called does not return a promise, await is used
      // in case the function is overridden with an async function.
      let queryOptions = await OperationListQueryOptions(context)
      // If the returned query options is not a string, then it should be a
      // DataQueryBuilder instance with the query options needing to be built.
      if (typeof queryOptions !== 'string') {
        if (typeof queryOptions.build === 'function') {
          queryOptions = await queryOptions.build()
        } else {
          throw new Error(`Error obtaining query options for work order list`)
        }
      }
      // Get the list of assigned work order operations.
      const operationsQueryResult = await context.read("/SAPAssetManager/Services/AssetManager.service", "MyWorkOrderOperations", [], queryOptions)

      let operationSSAM
      while ((operationSSAM = operationsQueryResult.shift())) {
        // Get the work order header data.
        const mirataBinding = await WorkOrderDataBindingMirata(context, operationSSAM.WOHeader)
        // Get the operation data.
        const operationBinding = await OperationDataBindingMirata(context, operationSSAM)
        // Merge the operation data into the work order header data.
        Object.assign(mirataBinding, operationBinding)
        // Add the object with the combined operation and work order header data
        // to the array to be returned.
        listArray.push(mirataBinding)
      }
    } else {
      // Get the query options for obtaining the list of work orders. Even though
      // the default function called does not return a promise, await is used
      // in case the function is overridden with an async function.
      let queryOptions = await WorkOrderListQueryOptions(context)
      // If the returned query options is not a string, then it should be a
      // DataQueryBuilder instance with the query options needing to be built.
      if (typeof queryOptions !== 'string') {
        if (typeof queryOptions.build === 'function') {
          queryOptions = await queryOptions.build()
        } else {
          throw new Error(`Error obtaining query options for work order list`)
        }
      }
      // Get the list of assigned work orders.
      const workOrderQueryResult = await context.read("/SAPAssetManager/Services/AssetManager.service", "MyWorkOrderHeaders", [], queryOptions)

      let workOrderSSAM
      while ((workOrderSSAM = workOrderQueryResult.shift())) {
        // Get the work order header data.
        const mirataBinding = await WorkOrderDataBindingMirata(context, workOrderSSAM)
        // Add the object with the work order header data to the array to be returned.
        listArray.push(mirataBinding)
      }
    }
    // Return the work order or operation data.
    return listArray
  } catch (error) {
    const component = "IntegrationDataMapping"
    const errorInfo = "Error compiling Work Order List array"
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
