import FindKeyInObject from "../../../../../MirataFormsCoreComponents/Rules/Common/FindKeyInObject"
import LogError from "../../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
  * Retrieves the context binding object for UX forms that require a MTF.
 
  *
  * @param {IClientAPI} context - The client context object
  * @returns {Promise<object>} MTF binding object
  */
export default async function ZMTFContextBinding(context) {
  try {
    
    // If order ID is passed in, then get it from the Client Data object.
      const clientData = context.getClientData()
      if (!clientData.MirataFormsData || !clientData.MirataFormsData.FormRuleInputData || Object.keys(clientData.MirataFormsData.FormRuleInputData).length === 0) {
        throw new Error("Mirata rule input data is not available in the Client Data object")
      }
      const ruleInputData = clientData.MirataFormsData.FormRuleInputData

    let MaterialDocumentNumber = ruleInputData[FindKeyInObject(ruleInputData, ['MaterialDocumentNumber'])]
      
    let result = [];
    let queryOptions = "$filter=MaterialDocumentNumber eq '" + MaterialDocumentNumber + "'&$expand=ZMaterialTransferFormDetail_Nav&$orderby=MaterialDocumentNumber";

    // Obtain the data binding object.
    let binding = null
    result = await context.read("/SAPAssetManager/Services/AssetManager.service", "ZMaterialTransferFormHeaders", [], queryOptions)
    if (result && result.getItem(0)) {
      binding = result.getItem(0)
    } else {
      throw new Error(`Error obtaining ${MaterialDocumentNumber} data context for UX form`)
    }
    return binding
  } catch (error) {
    const component = "UX Forms"
    const errorInfo = `Error obtaining  ${MaterialDocumentNumber} data context for UX form`
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
