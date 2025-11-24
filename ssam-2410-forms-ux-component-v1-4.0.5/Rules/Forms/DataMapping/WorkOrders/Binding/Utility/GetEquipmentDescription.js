/**
 * Get the description of an equipment.
 * @param {IClientAPI} context - The client context object
 * @param {string} equipmentId - The equipment ID.
 * @returns {Promise<string>} The description of the equipment or an empty
 *   string if the equipment ID is not provided or if an error occurs.
 */
export default async function GetEquipmentDescription(context, equipmentId) {
  if (!equipmentId) {
    return ""
  }
  try {
    const queryResult = await context.read(
      '/SAPAssetManager/Services/AssetManager.service',
      'MyEquipments',
      [],
      "$select=EquipDesc&$filter=EquipId eq '" + equipmentId + "'"
    )
    if (queryResult) {
      return queryResult.getItem(0).EquipDesc
    }
  } catch (error) {
    return ""
  }
}
