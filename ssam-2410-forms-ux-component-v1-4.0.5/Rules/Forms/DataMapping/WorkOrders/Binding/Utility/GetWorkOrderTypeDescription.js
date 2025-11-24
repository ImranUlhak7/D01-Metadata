/**
 * Get the description of a work order type.
 * @param {IClientAPI} context - The client context object
 * @param {string} planningPlant - The planning plant.
 * @param {string} orderType - The work order type.
 * @returns {Promise<string>} The description of the work order type or an
 *   empty string if the planning plant or order type is not provided or if an
 *   error occurs.
 */
export default async function GetWorkOrderTypeDescription(context, planningPlant, orderType) {
  if (!planningPlant || !orderType) {
    return ""
  }
  try {
    const queryResult = await context.read(
      '/SAPAssetManager/Services/AssetManager.service',
      'OrderTypes',
      [],
      "$select=OrderTypeDesc&$filter=PlanningPlant eq '" + planningPlant + "' and OrderType eq '" + orderType + "'"
          )
    if (queryResult) {
      return queryResult.getItem(0).OrderTypeDesc
    }
  } catch (error) {
    return ""
  }
}
