import LogError from "../LogError"
import GetDataTableRowValue from "./GetDataTableRowValue"
import GetDataTableOrgId from "./GetDataTableOrgId"

/**
 * Navigates to the initial UX form for a given business object type.
 * Retrieves the initial form ID from the SSAM UX Configuration data table
 * and navigates to that form using the Forms Extension Page.
 *
 * @param {IClientAPI} context - The MDK page context object
 * @param {string} busObjType - The type of SSAM business object, which must be
 *   a case-sensitive match for a key in the "SSAM UX Configuration" data table.
 * @returns {Promise<Object>} Promise that resolves to the navigation action result
 * @throws {Error} If form ID lookup fails or navigation fails
 */
export default async function GetInitialUxForm(context, busObjType) {
  let initialFormId;
  try {
    initialFormId = await GetDataTableRowValue(context, "SSAM UX Configuration", busObjType, "Initial");
    if (!initialFormId) {
      throw new Error(`Business object type '${busObjType}' not found in the "SSAM UX Configuration" data table`);
    }
    const orgId = await GetDataTableOrgId(context, "SSAM UX Configuration");
    // The form ID may be "abbreviated"; if so, add the prefix composed of the
    // organization ID and Mirata object type that is common to all forms
    // definitions.
    const formIdPrefix = `${orgId}.form.`;
    if (!initialFormId.startsWith(formIdPrefix)) {
      initialFormId = `${formIdPrefix}${initialFormId}`;
    }
    return initialFormId;
  } catch (error) {
    const component = "DataTables";
    const errorInfo = `Error retrieving initial UX form ID for business object type '${busObjType}'`;
    await LogError(context, error, { component, mdkInfo: { errorInfo } } );
    throw error;
  }
}
