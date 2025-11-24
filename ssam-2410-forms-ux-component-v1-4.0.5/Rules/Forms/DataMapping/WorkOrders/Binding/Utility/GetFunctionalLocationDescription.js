/**
 * Get the description of a functional location.
 * @param {IClientAPI} context - The client context object
 * @param {string} functionalLocationId - The functional location ID.
 * @returns {Promise<string>} The description of the functional location or an
 *   empty string if the functional location ID is not provided or if an error
 *   occurs.
 */
export default async function GetFunctionalLocationDescription(context, functionalLocationId) {
  if (!functionalLocationId) {
    return ""
  }
  try {
    const queryResult = await context.read(
      '/SAPAssetManager/Services/AssetManager.service',
      'MyFunctionalLocations',
      [],
      "$select=FuncLocDesc&$filter=FuncLocIdIntern eq '" + functionalLocationId + "'"
    )
    if (queryResult) {
      return queryResult.getItem(0).FuncLocDesc
    }
  } catch (error) {
    return ""
  }
}
