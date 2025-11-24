import IsWONotificationVisible from '../../../../SAPAssetManager/Rules/WorkOrders/Complete/Notification/IsWONotificationVisible';
import WorkOrderCompletionLibrary from '../../../../SAPAssetManager/Rules/WorkOrders/Complete/WorkOrderCompletionLibrary';
import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import {ChecklistLibrary as libChecklist} from '../../../../SAPAssetManager/Rules/Checklists/ChecklistLibrary';
import SmartFormsCompletionLibrary from '../../../../SAPAssetManager/Rules/Forms/SmartFormsCompletionLibrary';
import libOpMobile from '../../Operations/MobileStatus/OperationMobileStatusLibrary';

// This rule is overridden to check if the operation if Mirata form-enabled, and
// if so, if the form has been completed before allowing the operation to be
// completed/confirmed. This function is called when the Operation assignment
// model is active and is the initial entry point of the Operation confirmation
// process.
export default function NavOnCompleteOperationPage(context, actionBinding) {
    let binding = actionBinding || context.getPageProxy().getActionBinding() || libCommon.getBindingObject(context);
    return libOpMobile.completeOperationFormsCheck(context, binding).then((isMirataFormCompeted) => {
        if (!isMirataFormCompeted) {
            return Promise.reject('Mirata form has not been completed');
        }

        const equipment = binding.OperationEquipment;
        const functionalLocation = binding.OperationFunctionLocation;

        let expandOperationAction = Promise.resolve();
        if (binding && binding['@odata.type'] === '#sap_mobile.MyWorkOrderOperation' && !binding.WOHeader) {
            expandOperationAction = context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.editLink'], [], '$expand=WOHeader');
        }

        return expandOperationAction.then(function(result) {
            if (result && result.length > 0) {
                binding.WOHeader = result.getItem(0).WOHeader;
            }
            //Check for non-complete checklists and ask for confirmation
            return libChecklist.allowWorkOrderComplete(context, equipment, functionalLocation).then(async results => {
                if (results === true) {
                    WorkOrderCompletionLibrary.getInstance().setCompletionFlow('operation');
                    await WorkOrderCompletionLibrary.getInstance().initSteps(context);
                    WorkOrderCompletionLibrary.getInstance().setBinding(context, binding);

                    return IsWONotificationVisible(context, binding.WOHeader, 'Notification').then((notification) => {
                        if (notification) {
                            WorkOrderCompletionLibrary.updateStepState(context, 'notification', {
                                visible: true,
                                data: JSON.stringify(notification),
                                link: notification['@odata.editLink'],
                                initialData: JSON.stringify(notification),
                            });
                        } else {
                            WorkOrderCompletionLibrary.updateStepState(context, 'notification', {
                                visible: false,
                            });
                        }

                        return SmartFormsCompletionLibrary.updateSmartformStep(context).then(() => {
                            WorkOrderCompletionLibrary.getInstance().setCompleteFlag(context, true);
                            return WorkOrderCompletionLibrary.getInstance().openMainPage(context, false);
                        });
                    });
                }
                return Promise.resolve();
            });
        });
    });
}
