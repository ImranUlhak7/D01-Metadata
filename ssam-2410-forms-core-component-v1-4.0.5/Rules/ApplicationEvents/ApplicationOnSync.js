import isSyncInProgress from '../../../SAPAssetManager/Rules/Sync/IsSyncInProgress';
import errorLibrary from '../../../SAPAssetManager/Rules/Common/Library/ErrorLibrary';
import NetworkLib from '../../../SAPAssetManager/Rules/Common/Library/NetworkMonitoringLibrary';
import IsESRINameUserAuthEnabled from '../../../SAPAssetManager/Rules/ESRI/IsESRINameUserAuthEnabled';
import EsriLibrary from '../../../SAPAssetManager/Rules/ESRI/EsriLibrary';
import LogError from '../Forms/LogError';

/**
 * Initiates the SSAM sync process, and when complete, initates the Mirata Forms sync process.
 *
 * This is an overrride of the SSAM "ApplicationOnSync.js" rule.
 *
 * @param {IClientAPI} clientAPI - The MDK client API context object
 * @returns {Promise<boolean|void>} Returns false if network is disconnected, otherwise returns the result of the sync action
 */
export default async function ApplicationOnSync(clientAPI) {
    // TODO: remove the workaround when MDK provides a solution (MDKBUG-1604)
    let pageProxy = clientAPI.getPageProxy();
    if (pageProxy && pageProxy.getGlobalSideDrawerControlProxy) {
        let sideDrawer = pageProxy.getGlobalSideDrawerControlProxy();
        if (sideDrawer) {
            // prevents a navigation history from being reset on the next navigation
            sideDrawer._control.blankItemSelected = false;
        }
    }

    if (!isSyncInProgress(clientAPI)) {
        if (!NetworkLib.isNetworkConnected(pageProxy)) {
            pageProxy.executeAction('/SAPAssetManager/Actions/SyncError/SyncErrorNoConnection.action');
            return false;
        }
        errorLibrary.clearError(clientAPI);
        //check if token expired for the ESRI Named User Authentication
        if (IsESRINameUserAuthEnabled(clientAPI)) {
            // Mirata note: passing the action that kicks off the SSAM sync process
            // to the ESRI authentication process was introduced in SSAM 2410.
            // Unfortunately, we cannot wrap the Mirata Forms sync action call in
            // a try/catch block (as is done below) when passing it to the ESRI
            // authentication process to be executed at the appropriate time.
            const actions = [
                '/SAPAssetManager/Actions/SyncInitializeProgressBannerMessage.action',
                '/MirataFormsCoreComponents/Actions/Sync/SyncInitializeProgressBannerMessage-Forms.action'
            ]
            return EsriLibrary.callESRIAuthenticate(clientAPI, actions, false, true);
        }
        await clientAPI.executeAction('/MirataFormsCoreComponents/Actions/Sync/SyncInitializeProgressBannerMessage-Forms.action')
        try {
            // Once the SSAM sync is complete, we can initiate the Mirata Forms sync
            return clientAPI.executeAction('/SAPAssetManager/Actions/SyncInitializeProgressBannerMessage.action');
        } catch (error) {
            const component = "Mirata synchronization"
            await LogError(clientAPI, error, { component })
            throw error
        }
    } else {
        return clientAPI.executeAction('/SAPAssetManager/Actions/SyncInProgress.action');
    }
}
