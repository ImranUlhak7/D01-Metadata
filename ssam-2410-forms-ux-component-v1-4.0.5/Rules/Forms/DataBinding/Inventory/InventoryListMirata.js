import LogError from "../../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
/**
  * Retrieves and processes Inventory data.
  *
  *
  * Functions are called to build the appropriate query option statements; see these functions for details
  * regarding the result set returned.
  *
  *
  * @param {IClientAPI} context - The client context object
  *
  * @returns {Promise<Array<Object>>} An array of Inventory
  *
  * @throws {Error} If there's an error reading or processing the Inventory data
  * @throws {Error} If suboperation assignment type is used (not yet supported)
  */
export default async function InventoryListMirata(context) {
  try {
    let listArray = [];
    let queryOptions = '$expand=ZWorkOrderInventoryCountDetail_Nav&$orderby=OrderID';
    // Get the list of assigned work orders.
    listArray = await context.read("/SAPAssetManager/Services/AssetManager.service", "ZWorkOrderInventoryCountHeaders", [], queryOptions)
    // Return the work order or operation data.
    return listArray
  } catch (error) {
    const component = "IntegrationDataMapping"
    const errorInfo = "Error compiling Inventory List array"
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
