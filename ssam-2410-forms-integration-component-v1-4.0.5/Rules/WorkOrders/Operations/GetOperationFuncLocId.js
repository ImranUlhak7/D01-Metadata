import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Retrieves the (human readable) ID of the functional location associated with
 * the parent work order of an operation.
 *
 * The context passed is assumed to be bound to the target work order operation.
 *
 * Designed to be called by a Mirata Integration Data Mapping definition.
 *
 * @param {IClientAPI} context - The MDK page context
 * @returns {Promise<string|undefined>} The Functional Location ID if found,
 *   undefined otherwise
 */
export default function GetOperationFuncLocId(context) {
  let FuncLocIdInternal = context.binding.OperationFunctionLocation;
  return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyFunctionalLocations', [],
    "$select=FuncLocId&$filter=FuncLocIdIntern eq '" + FuncLocIdInternal + "'").then( funcLocData => {
      if (funcLocData) {
        return funcLocData.getItem(0).FuncLocId;
      } else {
        return undefined;
      }
    }
  ).catch((error) => {
    const component = "Integration Data";
    const errorInfo = `Error obtaining ID of Operation Functional Location internal ID '${FuncLocIdInternal}'`;
    LogError(context, error, { component, mdkInfo: { errorInfo } });
    return undefined;
  })
}
