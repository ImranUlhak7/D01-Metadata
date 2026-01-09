import LogError from "../../../../../MirataFormsCoreComponents/Rules/Forms/LogError"
/**
  * Retrieves and processes MTF data.
  *
  *
  * Functions are called to build the appropriate query option statements; see these functions for details
  * regarding the result set returned.
  *
  *
  * @param {IClientAPI} context - The client context object
  *
  * @returns {Promise<Array<Object>>} An array of MTF
  *
  * @throws {Error} If there's an error reading or processing the MTF data
  * @throws {Error} If suboperation assignment type is used (not yet supported)
  */
export default async function MTFListMirata(context) {
  try {
    let listArray = [];
    let queryOptions = '$expand=ZMaterialTransferFormDetail_Nav&$orderby=MaterialDocumentNumber';
    
    listArray = await context.read("/SAPAssetManager/Services/AssetManager.service", "ZMaterialTransferFormHeaders", [], queryOptions)
    
    return listArray
  } catch (error) {
    const component = "IntegrationDataMapping"
    const errorInfo = "Error compiling MTF List array"
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
