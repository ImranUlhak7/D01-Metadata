/**
 * Overrides the default SSAM enable/disable logic for the "Edit" (i.e.- pencil)
 * toolbar icon displayed on the Work Order Details screen.
 *
 * If the Mirata "M" toolbar icon is displayed, then hide the SSAM Edit icon.
 * Otherwise, call the default SSAM enable/disable function for the "Edit"
 * toolbar icon.
 *
 * @param {IClientAPI} context
 * @returns {Promise<boolean>} returns true if the toolbar icon should be
 *      displayed; otherwise, returns false if the toolbar icon should be
 *      hidden
 */
import EnableWorkOrderEdit_SSAM from "../../../../SAPAssetManager/Rules/UserAuthorizations/WorkOrders/EnableWorkOrderEdit";
import EnableMirataToolbarIcon from "../../WorkOrders/Operations/EnableMirataToolbarIcon";

export default async function EnableWorkOrderOperationEdit(context) {
  const isMirataToolbarIconEnabled = await EnableMirataToolbarIcon(context);
  if (isMirataToolbarIconEnabled) {
    return Promise.resolve(false);
  }
  return EnableWorkOrderEdit_SSAM(context);
}
