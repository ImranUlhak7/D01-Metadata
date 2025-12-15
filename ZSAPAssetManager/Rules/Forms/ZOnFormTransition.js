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

  const START = libCommon.getAppParam(
   clientApi,
   'MOBILESTATUS',
   clientApi
    .getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global')
    .getValue()
  );

  const formParameters = ZGetFormParameters(formContext);

  const formStatus = formParameters.status;
  let newMobileStatus = {};
  switch (formStatus.toLowerCase()) {
   case 'started':
    newMobileStatus.MobileStatus = START;
    break;
   case 'hold':
    newMobileStatus.MobileStatus = HOLD;
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

  const bindingObject = formContext.binding || formContext.getBindingObject();
  workOrderId = bindingObject.OrderId;

  if (!workOrderId) {
   throw new Error('Could not retrieve OrderId or OperationNo from form context binding.');
  }


  if (typeof clientApi.executeAction !== 'function') {
   throw new Error('clientApi.executeAction is not available in this context. Cannot execute update action.');
  }

  const statusEntityReadLink = bindingObject.OrderMobileStatus_Nav['@odata.readLink'];
  const userGUID = libCommon.getUserGuid(clientApi);
  const userId = libCommon.getSapUserName(clientApi);

  let actionParams = {
   ReadLink: statusEntityReadLink,
   NewStatus: newMobileStatus.MobileStatus,
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
 