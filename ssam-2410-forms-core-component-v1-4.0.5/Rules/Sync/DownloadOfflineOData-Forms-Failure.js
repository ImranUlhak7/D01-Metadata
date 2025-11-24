import LogError from '../Forms/LogError';
import setSyncInProgressState from '../../../SAPAssetManager/Rules/Sync/SetSyncInProgressState';

export default async function DownloadOfflineODataFormsFailure(context) {
    try {
        setSyncInProgressState(context, false);
        return context.executeAction('/MirataFormsCoreComponents/Actions/OData/ODataDownloadFailureMessage-Forms.action');
    } catch (error) {
        const component = "Mirata synchronization"
        await LogError(clientAPI, error, { component })
        throw error
    }
}
