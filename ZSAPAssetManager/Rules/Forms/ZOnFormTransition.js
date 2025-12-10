import libCommon from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import LogError from '../../../MirataFormsCoreComponents/Rules/Forms/LogError';
import ZGetFormParameters from './ZGetFormParameters';
//import ZUpdateMobileStatus from './ZUpdateMobileStatus';
//import LocationUpdate from '../../../SAPAssetManager/Rules/MobileStatus/LocationUpdate';

/**
 * Handles the Mirata form transition event. This will fire when a user
 * changed Form Status (Enroute, Arrived, Hold, Complete) and will update
 * the operation accordingly and fire off the appropriate sync.
 *
 * When the status changes, trigger the minimal amount of sync as possible.
 * Enroute and Arrived have to Post Immediatly while online.
 *
 *
 * @module ZSAPAssetManager/Rules/Mirata/ZOnFormTransition
 *
 * @param {Object} formContext - This is the context sent from the Mirata Form to the application.
 */
export default async function ZOnFormTransition(formContext) {
	let workOrderId;
	const component = 'UX Forms';
	const clientApi = formContext.getPageProxy();

	try {
		console.log('ZOnFormTransition - Mirata Form Transition Triggered');


		const HOLD = libCommon.getAppParam(
			clientApi,
			'MOBILESTATUS',
			clientApi
				.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global')
				.getValue()
		);
		const COMPLETE = libCommon.getAppParam(
			clientApi,
			'MOBILESTATUS',
			clientApi
				.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global')
				.getValue()
		);

		const TRAVEL = libCommon.getAppParam(
			clientApi,
			'MOBILESTATUS',
			clientApi
				.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TravelParameterName.global')
				.getValue()
		);

		const ONSITE = libCommon.getAppParam(
			clientApi,
			'MOBILESTATUS',
			clientApi
				.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/OnsiteParameterName.global')
				.getValue()
		);

		const REJECTED = libCommon.getAppParam(
			clientApi,
			'MOBILESTATUS',
			clientApi
				.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/RejectedParameterName.global')
				.getValue()
		);

		// Reset the bulk operation state variable
		// This is to ensure that we are not in bulk mode for this operation
		// This is important to ensure that the next operation does not mistakenly think it is in bulk mode
		// after a bulk operation has completed.
		// libCommon.setStateVariable(clientApi, 'BulkOperationSync', {
		// 	bulkMode: false,F
		// 	isComplete: false
		// });

		const formParameters = ZGetFormParameters(formContext);

		const formStatus = formParameters.status;
		let newMobileStatus = {};
		switch (formStatus.toLowerCase()) {
			case 'travel':
				newMobileStatus.MobileStatus = TRAVEL;
				break;
			case 'onsite':
				newMobileStatus.MobileStatus = ONSITE;
				break;
			case 'hold':
				newMobileStatus.MobileStatus = HOLD;
				break;
			case 'rejected':
				newMobileStatus.MobileStatus = REJECTED;
				break;	
			case 'complete':
			case 'completed':
				newMobileStatus.MobileStatus = COMPLETE;
				break;
		}



		if (!newMobileStatus.MobileStatus) {
			throw new Error(`No mobile status defined for form status: GET_MIRATA_FORM_STATUS`);
		}

		newMobileStatus.Status = `WORKORDER: ${newMobileStatus.MobileStatus}`

		const bindingObject = formContext.getBindingObject();
		workOrderId = bindingObject.OrderId;

		if (!workOrderId) {
			throw new Error('Could not retrieve OrderId or OperationNo from form context binding.');
		}

		// Create time entry for 'arrived', 'hold', and 'complete' statuses
		// let startTime = formParameters.startTime;
		// let endTime = formParameters.endTime;

		// if (startTime && endTime && startTime < endTime) {
		// 	await ZCreateTimeEntry(
		// 		clientApi,
		// 		operation,
		// 		workOrderId,
		// 		newMobileStatus,
		// 		new Date(startTime),
		// 		new Date(endTime)
		// 	);
		// }


		if (typeof clientApi.executeAction !== 'function') {
			throw new Error('clientApi.executeAction is not available in this context. Cannot execute update action.');
		}

		// let actionParams = {
		// 	NewStatus: newMobileStatus,
		// 	bulkLoad: false
		// };

		const statusEntityReadLink = bindingObject.OrderMobileStatus_Nav['@odata.readLink'];
		const userGUID = libCommon.getUserGuid(clientApi);
		const userId = libCommon.getSapUserName(clientApi);

		let actionParams = {
			ReadLink: statusEntityReadLink,
			NewStatus: newMobileStatus,
			UserGUID: userGUID,
			UserId: userId,
			WOReadLink: bindingObject['@odata.readLink']
		};

		clientApi.setActionBinding(actionParams);
		//LocationUpdate(clientApi);
		await clientApi.executeAction({
			Name: '/ZSAPAssetManager/Actions/Forms/ZUpdateWOMobileStatus.action',
			Properties: actionParams
		});

		console.log(`Successfully updated MobileStatus for WorkOrder ${workOrderId} to ${newMobileStatus}`);
	} catch (error) {
		console.error('Error in ZOnFormTransition: ', error);
		const errorInfo = `Error processing form transition for work order ${workOrderId}. Details: ${error.message}`;
		await LogError(clientApi, error, { component, mdkInfo: { errorInfo } });
		console.error(`Logging Error - Component: ${component}, Info: ${errorInfo}`);
	}
}
