import {WorkOrderLibrary as libWo} from '../../../../../../SAPAssetManager/Rules/WorkOrders/WorkOrderLibrary';
import userFeaturesLib from '../../../../../../SAPAssetManager/Rules/UserFeatures/UserFeaturesLibrary';

/**
  * Returns an OData query options statement for the 'MyWorkOrderHeaders' entity set.
  * The query result set produced will be identical to the one provided to the SSAM
  * Work Order List View page.
  *
  * @description
  * - Based on the SSAM "Rules/Workorders/WorkOrderDetailsNav.js" rule
  * - Handles meter-related expansions when the Meter feature is enabled
  *
  * @note
  * When upgrading to support a new SSAM version, review "WorkOrderDetailsNav.js" for
  * query-related changes that need to be migrated here.
  *
  * @param {IClientAPI} context - The client context object
  * @returns {string} OData query options string for a work order data context
  */
export default function WorkOrderQueryOptions(context) {
    let queryOptions = libWo.getWorkOrderDetailsNavQueryOption(context);
    if (userFeaturesLib.isFeatureEnabled(context, context.getGlobalDefinition('/SAPAssetManager/Globals/Features/Meter.global').getValue())) {
        if (queryOptions.indexOf('$expand=') > 0) {
            let expandIndex = queryOptions.indexOf('$expand=');
            let beforeExpand = queryOptions.substring(0, expandIndex);
            let afterExpand = queryOptions.substring(expandIndex + 8);
            queryOptions = beforeExpand + '$expand=OrderISULinks/ConnectionObject_Nav/Premises_Nav,OrderISULinks/Installation_Nav,OrderISULinks/Premise_Nav,OrderISULinks/Device_Nav/RegisterGroup_Nav/Division_Nav,OrderISULinks/DeviceCategory_Nav/Material_Nav,OrderISULinks/Device_Nav/Equipment_Nav/ObjectStatus_Nav/SystemStatus_Nav,OrderISULinks/DeviceLocation_Nav/FuncLocation_Nav/Address/AddressCommunication,OrderISULinks/ConnectionObject_Nav/FuncLocation_Nav/Address/AddressCommunication,OrderISULinks/ConnectionObject_Nav/FuncLocation_Nav/ObjectStatus_Nav/SystemStatus_Nav,DisconnectActivity_Nav/DisconnectActivityType_Nav,DisconnectActivity_Nav/DisconnectActivityStatus_Nav,' + afterExpand;
        } else {
            queryOptions = queryOptions + 'OrderISULinks/ConnectionObject_Nav/Premises_Nav,OrderISULinks/Installation_Nav,OrderISULinks/Premise_Nav,OrderISULinks/Device_Nav/RegisterGroup_Nav/Division_Nav,OrderISULinks/DeviceCategory_Nav/Material_Nav,OrderISULinks/Device_Nav/Equipment_Nav/ObjectStatus_Nav/SystemStatus_Nav,OrderISULinks/DeviceLocation_Nav/FuncLocation_Nav/Address/AddressCommunication,OrderISULinks/ConnectionObject_Nav/FuncLocation_Nav/Address/AddressCommunication,OrderISULinks/ConnectionObject_Nav/FuncLocation_Nav/ObjectStatus_Nav/SystemStatus_Nav,DisconnectActivity_Nav/DisconnectActivityType_Nav,DisconnectActivity_Nav/DisconnectActivityStatus_Nav,';
        }
    }
    return queryOptions;
}
