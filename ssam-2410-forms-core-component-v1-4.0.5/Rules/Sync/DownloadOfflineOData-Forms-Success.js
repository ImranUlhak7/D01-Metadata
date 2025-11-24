import LogError from '../Forms/LogError';
import setSyncInProgressState from '../../../SAPAssetManager/Rules/Sync/SetSyncInProgressState';

export default async function DownloadOfflineODataFormsSuccess(context) {
    try {
        setSyncInProgressState(context, false);
        return context.executeAction('/MirataFormsCoreComponents/Actions/Sync/SyncSuccessMessage-Forms.action');
    } catch (error) {
        const component = "Mirata synchronization"
        await LogError(clientAPI, error, { component })
        throw error
    }
}
