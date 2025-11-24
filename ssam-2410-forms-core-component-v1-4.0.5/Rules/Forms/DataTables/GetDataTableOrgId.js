/**
 * Retrieves the organization ID for the specified data table.
 * @param {IClientAPI} context - The MDK client context object.
 * @param {string} dataTableName - The name of the data table to query.
 * @returns {Promise<string|undefined>} The organization ID if found, undefined otherwise.
 * @throws {Error} If there's an error during the data table lookup process.
 */
export default async function GetDataTableOrgId(context, dataTableName) {
  try {
    let filter = `$filter=name eq '${dataTableName}'`
    let result = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "DataTableMasters", ["organizationId"], filter)
    if (!(result && result.getItem(0))) {
      throw new Error(`Error data table '${dataTableName}' was not found`)
    }
    return result.getItem(0).organizationId
  } catch (error) {
    throw new Error(`Error getting organization ID for data table '${dataTableName}'`)
  }
}
