import libOprMobile from './OperationMobileStatusLibrary';
import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import PDFGenerateDuringCompletion from '../../../../SAPAssetManager/Rules/PDF/PDFGenerateDuringCompletion';
import ExpensesVisible from '../../../../SAPAssetManager/Rules/ServiceOrders/Expenses/ExpensesVisible';
import MileageIsEnabled from '../../../../SAPAssetManager/Rules/ServiceOrders/Mileage/MileageIsEnabled';
import mileageAddNav from '../../../../SAPAssetManager/Rules/ServiceOrders/Mileage/MileageAddNav';
import expenseCreateNav from '../../../../SAPAssetManager/Rules/Expense/CreateUpdate/ExpenseCreateNav';

/**
 * Complete an operation.
 *
 * This SSAM rule was overridden so that it can reference the overriden
 * "OperationMobileStatusLibrary" class where logic was added to ensure that
 * if the operation is "form-enabled", then the associated form is "mobile
 * complete" before the operation can be completed.
 *
 * @param {IClientAPI} context - The client context object
 * @returns {Promise<void>} - The promise that resolves once the operation
 *    has been completed.
 */
export default function OperationCompleteStatus(context) {
    //Save the name of the page where user swipped the context menu from. It's used in other code to check if a context menu swipe was done.
    libCommon.setStateVariable(context, 'contextMenuSwipePage', libCommon.getPageName(context));

    //Save the operation binding object. Coming from a context menu swipe does not allow us to get binding object using context.binding.
    libCommon.setBindingObject(context);

    //Set ChangeStatus property to 'Completed'.
    //ChangeStatus is used by OperationMobileStatusFailureMessage.action & OperationMobileStatusSuccessMessage.action
    context.getPageProxy().getClientData().ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());

    context.showActivityIndicator('');
    return libOprMobile.completeOperation(context).then(() => {
        let executeExpense = false;
        let executeMilage = false;
        if (ExpensesVisible(context)) {
            libCommon.setStateVariable(context, 'IsWOCompletion', true);
            executeExpense = true;
        }
        if (MileageIsEnabled(context)) {
            libCommon.setStateVariable(context, 'IsOperationCompletion', true);
            executeMilage = true;
        }
        libCommon.setStateVariable(context, 'IsExecuteExpense', executeExpense);
        libCommon.setStateVariable(context, 'IsExecuteMilage', executeMilage);

        // IsPDFGenerate variable handles the generation after the mileage or expense creation
        libCommon.setStateVariable(context, 'IsPDFGenerate', executeExpense || executeMilage);
        let binding = libCommon.getBindingObject(context);
        if (executeExpense) {
            context.getPageProxy().setActionBinding(binding);
            return expenseCreateNav(context);
        } else if (executeMilage) {
            context.getPageProxy().setActionBinding(binding);
            return mileageAddNav(context);
        } else {
            return PDFGenerateDuringCompletion(context);
        }
    }).finally(() => {
        libCommon.removeBindingObject(context);
        libCommon.removeStateVariable(context, 'contextMenuSwipePage');
        delete context.getPageProxy().getClientData().ChangeStatus;
        context.getPageProxy().getClientData().didShowSignControl = false;
    });
}
