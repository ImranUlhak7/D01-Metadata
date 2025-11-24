import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Retrieves the description of the functional location associated with an operation.
 *
 * The context passed is assumed to be bound to the target work order operation.
 *
 * Designed to be called by a Mirata Integration Data Mapping definition.
 *
 * @param {IClientAPI} context - The MDK page context
 * @returns {Promise<string|undefined>} The Functional Location description if
 *   found, undefined otherwise
 */
export default function GetOperationFuncLocDescription(context) {
  let FuncLocIdInternal = context.binding.OperationFunctionLocation;
  return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyFunctionalLocations', [],
    "$select=FuncLocDesc&$filter=FuncLocIdIntern eq '" + FuncLocIdInternal + "'").then( funcLocData => {
      if (funcLocData) {
        return funcLocData.getItem(0).FuncLocDesc;
      } else {
        return undefined;
      }
    }
  ).catch((error) => {
    const component = "Integration Data";
    const errorInfo = `Error obtaining description of Operation Functional Location with internal ID '${FuncLocIdInternal}'`;
    LogError(context, error, { component, mdkInfo: { errorInfo } });
    return undefined;
  })
}
