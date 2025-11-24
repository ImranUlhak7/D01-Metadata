import libOpMobile from './OperationMobileStatusLibrary';

/**
 * Confirm operation from details page.
 *
 * This SSAM rule was overridden so that it can reference the overriden
 * "OperationMobileStatusLibrary" class where logic was added to ensure that
 * if the operation is "form-enabled", then the associated form is "mobile
 * complete" before the operation can be completed.
 *
 * @param {IClientAPI} context - The client context object
 * @returns {Promise<void>} - The promise that resolves once the operation
 *    has been confirmed.
 */
export default function OperationConfirmStatus(context) {
    context.dismissActivityIndicator(); // RunMobileStatusUpdateSequence triggers showActivityIndicator which may result in infinite loading when CheckRequiredFields action is executed.
    return libOpMobile.completeOperation(context);
}
