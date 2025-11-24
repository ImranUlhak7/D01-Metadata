import LogError from '../Forms/LogError'
import setSyncInProgressState from '../../../SAPAssetManager/Rules/Sync/SetSyncInProgressState';

export default async function OnReInitializeOfflineODataFailure(context) {
    try {
        setSyncInProgressState(context, false);
        return context.executeAction('/MirataFormsCoreComponents/Actions/OData/InitializeOfflineODataCreateFailureMessage-Forms.action');
    } catch (error) {
        const component = "Mirata synchronization"
        await LogError(clientAPI, error, { component })
        throw error
    }
}
