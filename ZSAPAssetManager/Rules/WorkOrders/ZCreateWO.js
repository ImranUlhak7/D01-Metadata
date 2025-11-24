import FindKeyInObject from "../../../MirataFormsCoreComponents/Rules/Common/FindKeyInObject";
import libCommon from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import NavToInitialWorkOrderUxForm from "../../../MirataFormsUxComponents/Rules/Forms/Navigation/WorkOrders/NavToInitialWorkOrderUxForm.js"

/**
  * Creates a work order
  *
  *
  * @param {IClientAPI} context - The client context object
  * @returns {Promise<object>} The work order or operation binding object
  * @throws {Error} If work order ID is missing from client data or if entity read fails
  */
export default async function ZCreateWO(context) {
  try {
      const clientData = context.getClientData()
      if (!clientData.MirataFormsData || !clientData.MirataFormsData.FormRuleInputData || Object.keys(clientData.MirataFormsData.FormRuleInputData).length === 0) {
        throw new Error("Mirata rule input data is not available in the Client Data object")
      }
      const ruleInputData = clientData.MirataFormsData.FormRuleInputData;

      let EquipId = ruleInputData[FindKeyInObject(ruleInputData, ['EquipId'])]
      let FuncLocId = ruleInputData[FindKeyInObject(ruleInputData, ['FuncLocId'])]
      let MaintenanceActivityType = ruleInputData[FindKeyInObject(ruleInputData, ['MaintenanceActivityType'])]
      let MaintPlant = context.binding.MaintPlant
      let MaintWorkCenter = context.binding.MaintWorkCenter
      let CostCenter = ruleInputData[FindKeyInObject(ruleInputData, ['CostCenter'])]
      let OperationDescription = ruleInputData[FindKeyInObject(ruleInputData, ['OperationDescription'])]
      let OrderDescription = ruleInputData[FindKeyInObject(ruleInputData, ['OrderDescription'])]

      let woLinks = [];
      let equipLink = context.createLinkSpecifierProxy(
                'Equipment',
                'MyEquipments',
                `$filter=EquipId eq '${EquipId}'`,
            );
          woLinks.push(equipLink.getSpecifier());
      
      let fLocLink = context.createLinkSpecifierProxy(
                'FunctionalLocation',
                'MyFunctionalLocations',
                `$filter=FuncLocIdIntern eq '${FuncLocId}'`,
            );
          woLinks.push(fLocLink.getSpecifier());
    
    return context.executeAction({'Name': '/ZSAPAssetManager/Actions/WorkOrders/ZWorkOrderCreate.action', 'Properties': {
                            'Properties':
                            {
                                "OrderId": "/SAPAssetManager/Rules/WorkOrders/CreateUpdate/WorkOrderLocalID.js",
                                "OrderDescription": OrderDescription,
                                "PlanningPlant": MaintPlant,
                                "OrderType": "PM01",
                                "Priority": "1",
                                "HeaderFunctionLocation": FuncLocId,
                                "HeaderEquipment": EquipId,
                                "MainWorkCenterPlant": MaintPlant,
                                "MainWorkCenter": MaintWorkCenter,
                                "CreationDate": "/SAPAssetManager/Rules/DateTime/CurrentDateTime.js",
                                "CreationTime": "/SAPAssetManager/Rules/DateTime/CurrentTime.js",
                                "MaintenanceActivityType": MaintenanceActivityType
                            },
                            'CreateLinks': woLinks,
                        },
                    }).then(actionResult => {
        libCommon.setStateVariable(context, 'CreateWorkOrder', JSON.parse(actionResult.data));
        let workOrder = JSON.parse(actionResult.data).OrderId;
        let woReadLink = JSON.parse(actionResult.data)["@odata.readLink"];
        let oprLinks = [];
        let woLink = context.createLinkSpecifierProxy(
                              'Operations',
                              'MyWorkOrderHeaders',
                              '',
                              woReadLink,
                          );
            oprLinks.push(woLink.getSpecifier());
        let equipmentLink = context.createLinkSpecifierProxy(
                          'EquipmentOperation',
                          'MyEquipments',
                          `$filter=EquipId eq '${EquipId}'`,
                      );
            oprLinks.push(equipmentLink.getSpecifier());
        let funcLocLink = context.createLinkSpecifierProxy(
                          'FunctionalLocationOperation',
                          'MyFunctionalLocations',
                          `$filter=FuncLocIdIntern eq '${FuncLocId}'`,
                      );
          oprLinks.push(funcLocLink.getSpecifier());
        return context.executeAction({'Name': '/ZSAPAssetManager/Actions/WorkOrders/ZWorkOrderOperationCreate.action', 'Properties': {
                            'Properties':
                            {
                                "OperationNo": "/SAPAssetManager/Rules/WorkOrders/Operations/CreateUpdate/OperationLocalID.js",
                                "OperationShortText": OperationDescription,
                                "OperationEquipment": EquipId,
                                "OperationFunctionLocation": FuncLocId,
                                "MainWorkCenterPlant": MaintPlant,
                                "MainWorkCenter": MaintWorkCenter,
                                "PersonNum": "/SAPAssetManager/Rules/WorkOrders/Operations/WorkOrderOperationPersonNum.js"
                            },
                            "Headers": {
                                "OfflineOData.RemoveAfterUpload": "true",
                                "OfflineOData.TransactionID": workOrder
                            },
                            'ParentLink': woLink.getSpecifier(),
                        },
                    }).then(() => {
            let woPartnerLink = context.createLinkSpecifierProxy(
                              'WOPartners',
                              'MyWorkOrderHeaders',
                              '',
                              woReadLink,
                          );
            return context.executeAction({'Name': '/ZSAPAssetManager/Actions/WorkOrders/ZWorkOrderPartnerCreate.action', 'Properties': {
                            'Properties':
                            {
                             "OrderId": workOrder,
                                "Partner": "/SAPAssetManager/Rules/Common/Partner/PartnerPersonnelNumberForWO.js",
                                "PartnerFunction": "/SAPAssetManager/Rules/Common/Partner/PartnerFunction.js"
                            },
                            "Headers": {
                                "OfflineOData.RemoveAfterUpload": "true",
                                "OfflineOData.TransactionID": workOrder
                            },
                            'ParentLink': woPartnerLink.getSpecifier(),
                        },
                    }).then(() => {
                 return NavToInitialWorkOrderUxForm(context);
            });
        });
    });
  } catch (error) {
    const component = "UX Forms"
    const errorInfo = `Error obtaining ${operationId ? "operation" : "work order"} data context for UX form`
    await LogError(context, error, { component, mdkInfo: { errorInfo } } )
    throw error
  }
}
