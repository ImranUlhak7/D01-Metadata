import common from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary'
import generateGUID from '../../../SAPAssetManager/Rules/Common/guid'
import Logger from '../../../SAPAssetManager/Rules/Log/Logger'
import ODataDate from "../../../SAPAssetManager/Rules/Common/Date/ODataDate"
import IsAndroid from "../../../SAPAssetManager/Rules/Common/IsAndroid"
import IsIOS from "../../../SAPAssetManager/Rules/Common/IsIOS"

export default async function LogError(context, err, data) {
  try {
    // There are two ways this Rule may be called: 1) by another Rule or 2) by
    // the Mirata MDK Extension Control using the executeActionOrRule() method
    // (inherited from the IControl class the control extends). Rules can pass
    // multiple functional parameters when calling another Rule. However, when
    // called using the executeActionOrRule() method, only the (standard)
    // "context" parameter can (and will) be passed. In this latter scenario,
    // additional data can be made available to this Rule by the caller using
    // the "client data object" (accessible via the ClientAPI class's
    // getClientData() function).
    if (!err) {
      const clientData = context.getClientData()
      if (!clientData.MirataFormsData.LogInfo.error) {
        throw new Error("Mirata LogError() called with no error provided")
      }
      err = clientData.MirataFormsData.LogInfo.error
      data = clientData.MirataFormsData.LogInfo.data
    }

    const error = err instanceof Error
      ? err
      : typeof err === "string"
        ? new Error(err)
        : new Error(`Caught a non-error: ${JSON.stringify(err)}`)

    if (!data || typeof data !== "object") {
      data = {}
    }
    if (!data.mdkInfo) {
      data.mdkInfo = {}
    }
    data.mdkInfo.mdkPage = context.getPageProxy().currentPage.definition.path
    data.mdkInfo.sapUserId = common.getSapUserName(context)
    if (IsAndroid(context)) {
      data.mdkInfo.platform = "android"
    } else if (IsIOS(context)) {
      data.mdkInfo.platform = "iOS"
    } else {
      data.mdkInfo.platform = ""
    }

    const actionProperties = {
      id: generateGUID(),
      eventType: "error",
      message: error.message,
      statusCode: undefined,
      eventTime: new ODataDate().toDBDateTimeString(context),
      data: JSON.stringify(data),
      stack: error.stack,
      // If userId is undefined, the Mirata API obtains the user ID
      // from the authentication token that arrives with the API call
      userId: undefined
    }

    // If multiple calls to this function are made in a short period of time, a
    // race condition may result if "PageProxy.setActionBinding()" is used to
    // pass parameters to the "FormLogInfoCreate.action" call because
    // "ClientAPI.executeAction()" is an asynchronous function. A call to the
    // "LogError()" function may overwrite the data set by the immediately
    // previous "LogError()" call's call to "PageProxy.setActionBinding()"
    // before the previous call's call to "ClientAPI.executeAction()" has been
    // executed. To avoid this race condition, the "action override" method of
    // invoking an action is used here. Note that this action invocation method
    // is not documented in the online MDK API documentation, but a discussion
    // of it can be found here (or search for "mdk executing actions"):
    // https://help.sap.com/doc/f53c64b93e5140918d676b927a3cd65b/Cloud/en-US/docs-en/guides/getting-started/mdk/development/executing-actions.html
    context.executeAction({
      Name: "/MirataFormsCoreComponents/Actions/Forms/FormLogInfoCreate.action",
      Properties: {
        Properties: actionProperties,
        Headers: {
          "OfflineOData.RemoveAfterUpload": true,
          "OfflineOData.TransactionID": actionProperties.id
        }
      }
    })

    // Send the event to the MDK log manager.
    const message = `Error: ${error.message}; data: ${JSON.stringify(data)}`
    Logger.error("Mirata", message)
    // The "Logger.error()" outputs the message text using console.log() and
    // prefaces the text with a timestamp; that is, it looks very similar to
    // all the other SSAM progress messages. Make the message standout by
    // outputting it in red text and without the preceding timestamp.
    console.error(`[Mirata] ${message}`)
  } catch (err2) {
    // An error occurred processing a different error. Hopefully, this will
    // never happen. But if it does, report the error using the MDK log manager
    // but do not re-throw it.
    const error = err2 instanceof Error
    ? err2
    : typeof err2 === "string"
      ? new Error(err2)
      : new Error(`Caught a non-error: ${JSON.stringify(err2)}`);
    Logger.error("Mirata", `Error during LogError processing: ${error.message}; stack: ${error.stack}`)
    // Also output the error info to the console
    console.error(`[Mirata] Error during LogError processing: ${error.message}; stack: ${error.stack}`)
  }
}
