import allSyncronizationGroups from '../../../../SAPAssetManager/Rules/OData/DefiningRequests/AllSyncronizationGroups';
import allSynchronizationGroupsForms from '../DefiningRequests/AllSynchronizationGroupsForms';
import libCom from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import ApplicationSettings from '../../../../SAPAssetManager/Rules/Common/Library/ApplicationSettings';
import ApplicationOnUserSwitch from '../../../../SAPAssetManager/Rules/ApplicationEvents/ApplicationOnUserSwitch';
import IsGISEnabled from '../../../../SAPAssetManager/Rules/Maps/IsGISEnabled';
import IsESRINameUserAuthEnabled from '../../../../SAPAssetManager/Rules/ESRI/IsESRINameUserAuthEnabled';
import EsriLibrary from '../../../../SAPAssetManager/Rules/ESRI/EsriLibrary';

/**
 * Returns an array of rules and actions to be executed during the synchronization process.
 * The synchronization of the Mirata Forms OData entity sets is performed immediately after
 * the SSAM OData entity sets are synchronized.
 *
 * This is an overrride of the SSAM "DownloadActionsOrRulesSequence.js" rule.
 *
 * @param {IClientAPI} clientAPI - The MDK client API context object
 * @returns {Array<Object>} Returns an array of rules and actions to be executed during the synchronization process
 */
export default function DownloadActionsOrRulesSequence(context) {
    let initializeAction = '/SAPAssetManager/Actions/OData/InitializeOfflineOData.action';
    const initializeActionForms = '/MirataFormsCoreComponents/Actions/OData/InitializeOfflineOData-Forms.action';
    let errorAction = '/SAPAssetManager/Actions/OData/InitializeOfflineODataFailureMessage.action';
    let initialSync = libCom.isInitialSync(context);
    let userSwitchDeltaCompleted =  ApplicationSettings.getBoolean(context, 'didUserSwitchDeltaCompleted', null);
    libCom.setApplicationLaunch(context, false);
    if ( userSwitchDeltaCompleted !== null && !userSwitchDeltaCompleted) { // dont do any download if user switch delta is in progress
        return ApplicationOnUserSwitch(context);
    }
    if (!initialSync) {
        return [
        {
            'Rule': '/SAPAssetManager/Rules/Persona/LoadPersonaOverviewAllowSkip.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Inventory/Common/GetIMPersonaEntityLinks.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/UserFeatures/ReloadUserFeatures.js',
            'Caption': '',
        },
        {
            'Action': initializeAction,
            'Properties': {
                'DefiningRequests': allSyncronizationGroups(context),
                'OnFailure': errorAction,
            },
            'Caption': context.localizeText('application_initialization'),
        },
        {
            'Action': initializeActionForms,
            'Properties': {
                'DefiningRequests': allSynchronizationGroupsForms(context),
                'OnFailure': errorAction,
            },
            'Caption': context.localizeText('zforms_loading'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/Common/InitializeGlobalStates.js',
            'Caption': context.localizeText('Initializing_globals'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/EPD/FetchEPDVisualizations.js',
            'Caption': 'Fetching visualizations',
        },
        {
            'Rule': '/SAPAssetManager/Rules/OverviewPage/OverviewOnPageReload.js',
            'Caption': '',
        },
        {
            'Action': '/SAPAssetManager/Actions/ApplicationStartupMessage.action',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Extensions/Scanner/ScannerInit.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Common/SetAppLaunchFinished.js',
            'Caption': '',
        },
        ];
    }

    return getInitialSyncRules(context);
}

function getInitialSyncRules(context) {
    if (IsGISEnabled(context) && IsESRINameUserAuthEnabled(context)) {
        if (EsriLibrary.isESRILoginCompleted(context)) {
            return PostEsriAuthenticationRules(context);
        } else if (EsriLibrary.isESRILoginHasError(context)) {
            return PostEsriAuthenticationRules(context);
        }
        return PreEsriAuthenticationRules(context);
    }

    return PreEsriAuthenticationRules(context).concat(PostEsriAuthenticationRules(context));
}

function PreEsriAuthenticationRules(context) {
    return [
        {
            'Rule': '/SAPAssetManager/Rules/Persona/GetUserPersonas.js',
            'Caption': context.localizeText('initializing_personas'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/UserFeatures/ReadingOnlineUserFeatures.js',
            'Caption': context.localizeText('online_user_features'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/ESRI/ESRIUserLogin.js',
            'Caption': context.localizeText('check_map_authentication'),
        },
    ];
}

function PostEsriAuthenticationRules(context) {
    let initializeAction = '/SAPAssetManager/Actions/OData/InitializeOfflineOData.action';
    const initializeActionForms = '/MirataFormsCoreComponents/Actions/OData/InitializeOfflineOData-Forms.action';
    let errorAction = '/SAPAssetManager/Actions/OData/InitializeOfflineODataFailureMessage.action';
    return [
        {
            'Rule': '/SAPAssetManager/Rules/UserPreferences/SetUpDefaultHomeScreen.js',
            'Caption': context.localizeText('set_default_home_screen_preference'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/Persona/ReloadPersonaOverview.js',
            'Caption': context.localizeText('loading_persona'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/Inventory/Common/GetIMPersonaEntityLinks.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Forms/SDF/InitialTransmit.js',
            'Caption': '',
        },
        {
            'Action': initializeAction,
            'Properties': {
                'DefiningRequests': allSyncronizationGroups(context),
                'OnFailure': errorAction,
            },
            'Caption': context.localizeText('application_initialization'),
        },
        {
            'Action': initializeActionForms,
            'Properties': {
                'DefiningRequests': allSynchronizationGroupsForms(context),
                'OnFailure': errorAction,
            },
            'Caption': context.localizeText('zforms_loading'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/Documents/DownloadHTMLTemplate.js',
            'Caption': context.localizeText('downloading_html_template'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/UserFeatures/ReloadUserFeatures.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Common/InitializeGlobalStates.js',
            'Caption': context.localizeText('Initializing_globals'),
        },
        {
            'Rule': '/SAPAssetManager/Rules/OverviewPage/OverviewOnPageReload.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/EPD/FetchEPDVisualizations.js',
            'Caption': 'Fetching visualizations',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Persona/UpdatePersonaOverview.js',
            'Caption': context.localizeText('update_persona_overview_page'),
        },
        {
            'Action': '/SAPAssetManager/Actions/ApplicationStartupMessage.action',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/UserPreferences/ShowHomeScreenInfoMessage.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Extensions/Scanner/ScannerInit.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Common/SaveMetadataAfterInitialSync.js',
            'Caption': '',
        },
        {
            'Rule': '/SAPAssetManager/Rules/Common/SetAppLaunchFinished.js',
            'Caption': '',
        },
    ];
}
