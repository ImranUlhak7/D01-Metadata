import Logger from '../../../SAPAssetManager/Rules/Log/Logger'

export default async function LogInfo(context, info, data) {
  /*
   * NOTE: The Mirata logging facility is not currently configured to process
   * "info" events. Once enabled, this function's functionality will be nearly
   * identical to the LogError() function's - which returns a Promise. For now,
   * this function only calls the MDK logging facility, which is not an async
   * function call. However, this function currently returns a Promise so that
   * existing calls to it will not require modification once the Mirata logging
   * facility accepts "info" events.
   */
  return new Promise((resolve, reject) => {
    // There are two ways this Rule may be called: 1) by another Rule or 2) by
    // the Mirata MDK Extension Control using the executeActionOrRule() method
    // (inherited from the IControl class the control extends). Rules can pass
    // multiple functional parameters when calling another Rule. However, when
    // called using the executeActionOrRule() method, only the (standard)
    // "context" parameter can (and will) be passed. In this latter scenario,
    // additional data can be made available to this Rule by the caller using
    // the "client data object" (accessible via the ClientAPI class's
    // getClientData() function).
    if (!info) {
      const clientData = context.getClientData()
      if (!clientData.MirataFormsData.LogInfo || !clientData.MirataFormsData.LogInfo.info) {
        reject("Mirata LogInfo() called with no information provided")
      }
      info = clientData.MirataFormsData.LogInfo.info
      data = clientData.MirataFormsData.LogInfo.data
    }
    const isData = data ? `Data: ${data};` : ""
    Logger.info("Mirata", `${info}; ${isData} Page: ${context.getPageProxy().currentPage.id}`)
    resolve()
  })
}
