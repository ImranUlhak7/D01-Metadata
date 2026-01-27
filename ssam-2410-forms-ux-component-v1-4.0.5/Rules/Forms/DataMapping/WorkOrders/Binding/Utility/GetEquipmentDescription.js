/**
 * Get the description of an equipment.
 * @param {IClientAPI} context - The client context object
 * @param {string} equipmentId - The equipment ID.
 * @returns {Promise<string>} The equipment record or an empty record.
 *   string if the equipment ID is not provided or if an error occurs.
 */
export default async function GetEquipmentDescription(context, equipmentId) {
  let emptyRecord = {
    EquipDesc: '',
    SuperiorEquip: ''
  }
  if (!equipmentId) {
    return emptyRecord;
  }
  try {
    const queryResult = await context.read(
      '/SAPAssetManager/Services/AssetManager.service',
      'MyEquipments',
      [],
      "$filter=EquipId eq '" + equipmentId + "'"
    )
    if (queryResult && queryResult.length !== 0) {
      return queryResult.getItem(0);
    } else {
      return emptyRecord;
    }
  } catch (error) {
    return emptyRecord
  }
}
 