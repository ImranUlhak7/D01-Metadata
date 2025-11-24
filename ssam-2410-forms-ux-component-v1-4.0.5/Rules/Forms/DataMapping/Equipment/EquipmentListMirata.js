import IsSubOperationLevelAssigmentType from '../../../../../SAPAssetManager/Rules/WorkOrders/SubOperations/IsSubOperationLevelAssigmentType'
import LogError from "../../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
/**
  * Retrieves and processes EDquipment data.
  *
  *
  * Functions are called to build the appropriate query option statements; see these functions for details
  * regarding the result set returned.
  *
  *
  * @param {IClientAPI} context - The client context object
  *
  * @returns {Promise<Array<Object>>} An array of Equipments
  *
  * @throws {Error} If there's an error reading or processing the Equipment data
  * @throws {Error} If suboperation assignment type is used (not yet supported)
  */
export default async function WorkOrderOrOperationListMirata(context) {
  if (IsSubOperationLevelAssigmentType(context)) {
    throw new Error("Suboperation assignment type is not yet supported")
  }
  try {
    const listArray = []
    let queryOptions = '$select=*,MeasuringPoints/Point,ObjectStatus_Nav/SystemStatus_Nav/StatusText,WorkOrderHeader/OrderId' +
            '&$orderby=EquipId' +
            '&$expand=MeasuringPoints,ObjectStatus_Nav/SystemStatus_Nav,EquipDocuments,EquipDocuments/Document,WorkOrderHeader,WorkCenter_Main_Nav';
    // Get the list of assigned work orders.
    listArray = await context.read("/SAPAssetManager/Services/AssetManager.service", "MyEquipments", [], queryOptions)
    // Return the work order or operation data.
    return listArray
  } catch (error) {
    const component = "IntegrationDataMapping"
    const errorInfo = "Error compiling Work Order List array"
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
