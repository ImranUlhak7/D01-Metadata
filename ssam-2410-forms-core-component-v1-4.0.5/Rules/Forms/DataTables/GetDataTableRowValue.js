import GetDataTableRow from "./GetDataTableRow"
/**
 * Retrieves the value of a specified column from a row specified by its key value
 * from a data table specified by its name.
 * @param {IClientAPI} context - The MDK client context object.
 * @param {string} dataTableName - The name of the data table to query.
 * @param {string} key - The UID of the row to retrieve the value from.
 * @param {string} columnName - The name of the column to retrieve the value from.
 * @returns {Promise<string|undefined>} The value associated with the column name
 * if found, undefined otherwise.
 * @throws {Error} If there's an error during the data table lookup process.
 */
export default async function GetDataTableRowValue(context, dataTableName, key, columnName) {
  try {
    const dataTableRow = await GetDataTableRow(context, dataTableName, key)
    if (!dataTableRow) {
      return undefined
    }
    return dataTableRow[columnName]
  } catch (error) {
    throw new Error(`Error getting value of column '${columnName}' in row with key '${key}' from data table '${dataTableName}'`)
  }
}
