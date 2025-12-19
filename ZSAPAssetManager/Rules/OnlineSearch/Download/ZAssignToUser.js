import libCom from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import Logger from '../../../../SAPAssetManager/Rules/Log/Logger';
import DownloadFailed from '../../../../SAPAssetManager/Rules/OnlineSearch/Download/DownloadFailed';
import { GlobalVar } from '../../../../SAPAssetManager/Rules/Common/Library/GlobalCommon';

export default function AssignToUser(context) {
    const pageProxy = context.getPageProxy();
    const binding = pageProxy.getActionBinding();
    const personnelNumber = libCom.getPersonnelNumber();
    const sap_userid = GlobalVar.getUserSystemInfo().get('SAP_USERID');
    context.setActionBinding({ ...binding, EmployeeTo: sap_userid, EmployeeFrom: binding.AssignedTo, OperationNo: binding.OperationNo || '', SubOperationNo: binding.SubOperationNo || '' });

    return context.executeAction('/SAPAssetManager/Actions/Supervisor/Assign/WorkOrderAssignOnline.action')
        .catch((error) => {
            Logger.error('AssignToUser', error);
            const sectionedTable = pageProxy.getControl('SectionedTable');
            if (sectionedTable) {
                sectionedTable.redraw();
            }
            return DownloadFailed(context);
        });
}
