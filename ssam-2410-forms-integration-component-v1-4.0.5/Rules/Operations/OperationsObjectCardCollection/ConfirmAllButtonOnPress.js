import OperationsEntitySet from '../../../../SAPAssetManager/Rules/WorkOrders/Operations/OperationsEntitySet';
import { OperationConstants } from '../../../../SAPAssetManager/Rules/WorkOrders/Operations/WorkOrderOperationLibrary';
import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import libForms from '../../Forms/Library/FormsLibrary';
import WorkOrderOperationsConfirmNav from '../../../../SAPAssetManager/Rules/WorkOrders/Operations/WorkOrderOperationsConfirmNav';

/**
 * This SSAM rule was overridden to ensure that if an operation being confirmed
 * is "form-enabled", then the associated form exists and is "mobile complete"
 * before the operation can be confirmed.
 *
 * This function is called when the "Confirm All" button is pressed on the
 * work order details page. It loops through the operations checking for
 * any that are form-enabled, and if found, ensures the associated form
 * exists and is "mobile complete". If the associated form is not mobile
 * complete, it does not add the operation to the list of operations to
 * confirm and notifies the user why this is so.
 *
 * @param {IClientAPI} context - The client context object
 * @returns {Promise<void>} - The promise that resolves once all qualifying
 *    operations have been confirmed.
 */
export default async function ConfirmAllButtonOnPress(context) {
    const filterPlus = libCommon.isAppParameterEnabled(context, 'MOBILESTATUS', 'EnableOnLocalBusinessObjects') ? '' : " and not substringof('L', OperationNo)"; //Exclude locals if parameter restricts them
    const queryOptions = libCommon.attachFilterToQueryOptionsString(OperationConstants.OperationsObjectCardCollectionQueryOptions(context), OperationConstants.notFinallyConfirmedFilter() + filterPlus);
    const operations = await context.read('/SAPAssetManager/Services/AssetManager.service', OperationsEntitySet(context, context.getPageProxy().binding), [], queryOptions);

    // Loop through the operations checking for any that are form-enabled, and
    // if found, ensure the associated form exists and is mobile complete. If
    // the associated form is not mobile complete, do not add the operation to
    // the list of operations to confirm and notify the user why this is so.
    const operationsToConfirm = [];
    let operationsWithIncompleteForms = "";
    while (operations.length > 0) {
        const operation = operations.shift();
        if (!await libForms.isBusinessObjectFormEnabled(context, operation)) {
            // If the operation is not form-enabled, then add it to the list of
            // operations to confirm.
            operationsToConfirm.push(operation);
        } else if (await libForms.isLatestFormSubmissionMobileCompleteForOperation(context, operation)) {
            // If the operation is form-enabled and the associated form is
            // mobile complete, then add it to the list of operations to
            // confirm.
            operationsToConfirm.push(operation);
        } else {
            // If the operation is form-enabled and the associated form is
            // not mobile complete, then add it to the list of operations
            // that have incomplete forms.
            operationsWithIncompleteForms += operationsWithIncompleteForms ? `, ${operation.OperationNo}` : operation.OperationNo;
        }
    }

    if (operationsWithIncompleteForms) {
        // Display a dialog stating that form-enabled operations that have
        // an incomplete form will not be confirmed.
        await libForms.showWarningCompleteFormsBeforeConfirmAllOperations(context, operationsWithIncompleteForms);
    }

    if (operationsToConfirm.length > 0) {
        libCommon.setStateVariable(context, 'selectedOperations', operationsToConfirm.map(operation => ({binding: operation})));
        // Navigate to the work order operations confirmation page.
        return WorkOrderOperationsConfirmNav(context);
    } else {
        // None of the operations qualify to be confirmed. The user has already
        // been notified, so do nothing.
        return Promise.resolve();
    }
}
