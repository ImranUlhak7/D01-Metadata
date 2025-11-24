import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * Retrieves the description of the equipment associated with an operation.
 *
 * The context passed is assumed to be bound to the target work order operation.
 *
 * Designed to be called by a Mirata Integration Data Mapping definition.
 *
 * @param {IClientAPI} context - The MDK page context
 * @returns {Promise<string|undefined>} A promise that resolves to the equipment
 *   description if found, undefined otherwise
 */
export default function GetOperationEquipmentDescription(context) {
  let equipmentID = context.binding.OperationEquipment;
  return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyEquipments', [],
    "$select=EquipDesc&$filter=EquipId eq '" + equipmentID + "'").then( equipmentData => {
      if (equipmentData) {
        return equipmentData.getItem(0).EquipDesc;
      } else {
        return undefined;
      }
    }
  ).catch((error) => {
    const component = "Integration Data";
    const errorInfo = `Error obtaining description of Operation Equipment with ID '${equipmentID}'`;
    LogError(context, error, { component, mdkInfo: { errorInfo } } );
    return undefined;
  })
}
