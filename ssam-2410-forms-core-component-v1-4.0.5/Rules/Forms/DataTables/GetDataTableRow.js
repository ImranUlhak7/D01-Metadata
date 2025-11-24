/**
 * Retrieves a row from the specified data table using the row's UID key value.
 * @param {IClientAPI} context - The MDK client context object.
 * @param {string} dataTableName - The name of the data table to query.
 * @param {string} key - The UID of the row to retrieve the value from.
 * @returns {Promise<string|undefined>} The value associated with the key if found, undefined otherwise.
 * @throws {Error} If there's an error during the data table lookup process.
 */
export default async function GetDataTableRow(context, dataTableName, key) {
  try {
    // Get the data table master ID for the specified data table name.
    let filter = `$filter=name eq '${dataTableName}'`
    let result = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "DataTableMasters", ["id"], filter)
    if (!(result && result.getItem(0))) {
      throw new Error(`Error data table '${dataTableName}' was not found`)
      }
    const dataTableId = result.getItem(0).id
    // Get the row from the data table using the data table ID and the key value.
    filter = `$filter=dataTableId eq '${dataTableId}' and key eq '${key}'`
    result = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "DataTableData", ["value"], filter)
    if (!(result && result.getItem(0))) {
      return undefined
    }
    const row = JSON.parse(result.getItem(0).value)
    // Add the key value to the row object.
    row.Key = key
    return row
  } catch (error) {
    throw new Error(`Error getting row with key '${key}' from data table '${dataTableName}'`)
  }
}
