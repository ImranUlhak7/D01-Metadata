import clearSubmissionImagesClient from "../OData/Upload/ClearSubmissionImagesClient";
import errorLibrary from "../../../SAPAssetManager/Rules/Common/Library/ErrorLibrary";
import libCom from "../../../SAPAssetManager/Rules/Common/Library/CommonLibrary";
import LogError from '../Forms/LogError';
import setSyncInProgressState from "../../../SAPAssetManager/Rules/Sync/SetSyncInProgressState";

/**
 * Handles the Mirata Forms synchronization process, managing both initial and routine syncs.
 *
 * This function executes the necessary sync actions for forms data, including
 * re-initialization of offline OData, upload of offline data, and download of new data.
 * For initial syncs, it only performs the defining request download.
 *
 * @param {IClientAPI} clientAPI - The MDK client API context object
 * @returns {Promise<void>} Promise that resolves when sync is complete
 * @throws {Error} If synchronization fails, the error is logged and re-thrown
 */
export default async function SyncDataForms(clientAPI) {
  clientAPI.getClientData().Error = ""
  setSyncInProgressState(clientAPI, true)
  const isInitialSync = libCom.isInitialSync(clientAPI)
  try {
    await clientAPI.executeAction("/MirataFormsCoreComponents/Actions/Sync/SyncIntializeMessage-Forms.action")
    if (!isInitialSync) {
      // MDK's solution to issue https://sapjira.wdf.sap.corp/browse/ICMTANGOAMF10-9879
      errorLibrary.clearError(clientAPI)
      await clientAPI.executeAction("/MirataFormsCoreComponents/Actions/OData/ReInitializeOfflineODataWithActivityIndicator-Forms.action")
      await clientAPI.executeAction("/MirataFormsCoreComponents/Actions/OData/UploadOfflineData-Forms.action")
      await clientAPI.executeAction("/MirataFormsCoreComponents/Actions/OData/DownloadOfflineOData-Forms.action")
      return await clearSubmissionImagesClient(clientAPI)
    } else {
      return await clientAPI.getDefinitionValue("/SAPAssetManager/Rules/OData/Download/DownloadDefiningRequest.js")
    }
  } catch (error) {
    setSyncInProgressState(clientAPI, false)
    const component = "Mirata synchronization"
    const errorInfo = `Exception during Mirata Forms ${isInitialSync ? "initial" : "routine"} synchronization`
    await LogError(clientAPI, error, { component, mdkInfo: { errorInfo } })
    throw error
  }
}
