import ODataDate from '../../../SAPAssetManager/Rules/Common/Date/ODataDate';
import LogError from "../../../MirataFormsCoreComponents/Rules/Forms/LogError";

/**
 * Provides an example of a rule that returns an array of objects that can be
 * called by a Mirata Integration Data Mapping definition to populate an
 * array-type field in a Mirata Form that has an array row definition
 * composed of multiple form fields.
 *
 * Notes:
 * - The rule must return an array of objects.
 * - Each object in the array will be bound to a row in the array-type form field.
 * - To map a returned object value to a form field, the corresponding object key
 *   must match the target form field's name.
 * - Returned object values must be of the correct data type for the target form
 *   field.
 * - Returned key/value pairs that cannot be mapped to a form field are ignored.
 *
 * @param {IClientAPI} context - The MDK page context
 * @returns {Promise<Object>} An object containing the sorted operations array under the "Operations" key
 * @throws {Error} If there's an error processing the operations
 */
export default async function ReturnWorkOrderOperationsArray(context) {
  try {
    // The array-based MDK data source can be anything.  For this rule, the "Operations"
    // array that is part of the binding object associated with the context of the
    // "WorkOrderDetailsPage" is used.  This logic will manipulate some of the array's
    // values and return the modified array data.
    const operations = context.binding.Operations;
    const operationNumbers = [];

    for (const operation of operations) {
      // Replace the internal functional location ID with the human-readable version of the ID
      const funcLocData = await context.read('/SAPAssetManager/Services/AssetManager.service','MyFunctionalLocations', [], "$select=FuncLocId&$filter=FuncLocIdIntern eq '" + operation.OperationFunctionLocation + "'");
      operation.OperationFunctionLocation = funcLocData.getItem(0).FuncLocId;
      // Replace the OData-formatted date string with a more familiar date format
      const schedStartDate = new ODataDate(operation.SchedEarliestStartDate).date();
      operation.SchedEarliestStartDate = schedStartDate.toLocaleDateString('en-us', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      // Copy the operation number for upcoming sorting
      operationNumbers.push(operation.OperationNo);
    }

    // Lexicographically sort the operation numbers, then using the results to create a sorted
    // copy of the operations array retrieved from the context binding object.
    operationNumbers.sort();
    const operationsSorted = [];
    for (const operationNumber of operationNumbers) {
      operationsSorted.push(operations.find(operation => operation.OperationNo === operationNumber));
    }

    // Return the array of objects.
    return operationsSorted;
  } catch(error) {
    const component = "Integration Data"
    const errorInfo = "Error creating Work Order Operation array for Mirata Integration Data Mapping"
    LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
