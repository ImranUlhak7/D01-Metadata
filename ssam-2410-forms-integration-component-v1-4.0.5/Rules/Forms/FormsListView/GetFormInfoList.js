import FormsLibrary from "../Library/FormsLibrary";

/**
 * Retrieves a list of Mirata form information from the "notes" property of the
 * work order operation in context.
 *
 * @param {IClientAPI} context - The client context object
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of
 *    Mirata form information objects. Each object contains:
 *     - {string} id - Unique identifier for the form
 *     - {string} name - Name of the form
 *     - {string} description - Description of the form
 *     - {number} version - Version of the form
 */
export default async function GetFormInfoList(context) {
  return FormsLibrary.getFormInfoListForBusinessObject(context);
}
