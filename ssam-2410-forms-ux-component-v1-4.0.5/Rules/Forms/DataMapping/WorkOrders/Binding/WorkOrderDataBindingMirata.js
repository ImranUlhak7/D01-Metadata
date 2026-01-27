import GetCombinedDateAndTime from './Utility/GetCombinedDateAndTime';
import GetEquipmentDescription from './Utility/GetEquipmentDescription';
import GetFunctionalLocationDescription from './Utility/GetFunctionalLocationDescription';
import GetWorkOrderTypeDescription from './Utility/GetWorkOrderTypeDescription';

/**
  * Processes work order header data from SSAM format to Mirata format.
  *
  * This function performs several key transformations:
  * - Converts SSAM date formats to Mirata date formats (milliseconds since epoch)
  * - Retrieves and adds equipment and functional location descriptions
  * - Adds work order type descriptions
  * - Handles mobile status information from OrderMobileStatus_Nav
  * - Combines SSAM-formatted date and time fields where applicable
  *
  * The function intentionally avoids using spread operator to ensure only scalar
  * values are copied, maintaining data integrity and preventing potential issues
  * with nested objects.
  *
  * @param {IClientAPI} context - The client context object
  * @param {Object} workOrderHeaderSSAM - The work order header data object from SSAM
  *
  * @returns {Promise<Object>} A Mirata-formatted work order header object containing:
  *   - All scalar work order properties
  *   - Converted date fields in milliseconds since epoch
  *   - Equipment and functional location descriptions
  *   - Work order type description
  *   - Mobile status information
  */
  export default async function WorkOrderDataBindinMirata(context, workOrderHeaderSSAM) {
  // Purposely avoided using spread operator here to ensure that only object
  // properties with scalar values are copied.
  const mirataDataBinding = {}
  mirataDataBinding.AccountingIndicator = workOrderHeaderSSAM.AccountingIndicator
  mirataDataBinding.AddressNum = workOrderHeaderSSAM.AddressNum
  mirataDataBinding.Assembly = workOrderHeaderSSAM.Assembly
  mirataDataBinding.BusinessArea = workOrderHeaderSSAM.BusinessArea
  mirataDataBinding.ControllingArea = workOrderHeaderSSAM.ControllingArea
  mirataDataBinding.CostCenter = workOrderHeaderSSAM.CostCenter
  mirataDataBinding.CreationDate = workOrderHeaderSSAM.CreationDate ? Date.parse(GetCombinedDateAndTime(workOrderHeaderSSAM.CreationDate, workOrderHeaderSSAM.CreationTime)) : undefined
  mirataDataBinding.DueDate = workOrderHeaderSSAM.DueDate ? Date.parse(workOrderHeaderSSAM.DueDate) : undefined
  mirataDataBinding.HeaderEquipment = workOrderHeaderSSAM.HeaderEquipment
  mirataDataBinding.HeaderFunctionalLocation = workOrderHeaderSSAM.HeaderFunctionLocation
  mirataDataBinding.LAMObjectType = workOrderHeaderSSAM.LAMObjectType
  mirataDataBinding.LAMTableKey = workOrderHeaderSSAM.LAMTableKey
  mirataDataBinding.LastChangeTime = workOrderHeaderSSAM.LastChangeTime ? Date.parse(workOrderHeaderSSAM.LastChangeTime) : undefined
  mirataDataBinding.MaintenanceActivityType = workOrderHeaderSSAM.MaintenanceActivityType
  mirataDataBinding.MaintenancePlant = workOrderHeaderSSAM.MaintenancePlant
  mirataDataBinding.MainWorkCenter = workOrderHeaderSSAM.MainWorkCenter
  mirataDataBinding.MainWorkCenterPlant = workOrderHeaderSSAM.MainWorkCenterPlant
  // Skip the MarkedJob property with the Work Order Header assignment model.
  mirataDataBinding.NotificationNumber = workOrderHeaderSSAM.NotificationNumber
  mirataDataBinding.ObjectKey = workOrderHeaderSSAM.ObjectKey
  mirataDataBinding.ObjectNumber = workOrderHeaderSSAM.ObjectNumber
  mirataDataBinding.ObjectType = workOrderHeaderSSAM.ObjectType
  // Skip the Operations array property with the Work Order Header assignment model.
  mirataDataBinding.OrderCategory = workOrderHeaderSSAM.OrderCategory
  mirataDataBinding.OrderCurrency = workOrderHeaderSSAM.OrderCurrency
  mirataDataBinding.OrderDescription = workOrderHeaderSSAM.OrderDescription
  mirataDataBinding.OrderId = workOrderHeaderSSAM.OrderId

  // Obtain selected properties from the OrderMobileStatus_Nav object.
  if(workOrderHeaderSSAM.OrderMobileStatus_Nav){
    mirataDataBinding.OrderMobileStatus_CreateUserId = workOrderHeaderSSAM.OrderMobileStatus_Nav.CreateUserId
    mirataDataBinding.OrderMobileStatus_EffectiveTimestamp =  workOrderHeaderSSAM.OrderMobileStatus_Nav.EffectiveTimestamp ? Date.parse(workOrderHeaderSSAM.OrderMobileStatus_Nav.EffectiveTimestamp) : undefined
    mirataDataBinding.OrderMobileStatus_MobileStatus = workOrderHeaderSSAM.OrderMobileStatus_Nav.MobileStatus
    mirataDataBinding.OrderMobileStatus_Status = workOrderHeaderSSAM.OrderMobileStatus_Nav.Status
    mirataDataBinding.OrderMobileStatus_SystemStatus = workOrderHeaderSSAM.OrderMobileStatus_Nav.SystemStatus
    mirataDataBinding.OrderMobileStatus_SystemStatusCode = workOrderHeaderSSAM.OrderMobileStatus_Nav.SystemStatusCode
  }

  mirataDataBinding.OrderProcessingContext = workOrderHeaderSSAM.OrderProcessingContext
  mirataDataBinding.OrderType = workOrderHeaderSSAM.OrderType
  mirataDataBinding.Phase = workOrderHeaderSSAM.Phase
  mirataDataBinding.PlannerGroup = workOrderHeaderSSAM.PlannerGroup
  mirataDataBinding.PlanningPlant = workOrderHeaderSSAM.PlanningPlant
  mirataDataBinding.Priority = workOrderHeaderSSAM.Priority
  mirataDataBinding.PriorityType = workOrderHeaderSSAM.PriorityType
  mirataDataBinding.ReferenceOrder = workOrderHeaderSSAM.ReferenceOrder
  mirataDataBinding.RequestStartDate = workOrderHeaderSSAM.RequestStartDate ? Date.parse(GetCombinedDateAndTime(workOrderHeaderSSAM.RequestStartDate, workOrderHeaderSSAM.RequestStartTime)) : undefined
  mirataDataBinding.ScheduledEndDate = workOrderHeaderSSAM.ScheduledEndDate ? Date.parse(GetCombinedDateAndTime(workOrderHeaderSSAM.ScheduledEndDate, workOrderHeaderSSAM.ScheduledEndTime)) : undefined
  mirataDataBinding.ScheduledStartDate = workOrderHeaderSSAM.ScheduledStartDate ? Date.parse(GetCombinedDateAndTime(workOrderHeaderSSAM.ScheduledStartDate, workOrderHeaderSSAM.ScheduledStartTime)) : undefined
  mirataDataBinding.Subphase = workOrderHeaderSSAM.Subphase
  // Skip the UserTimeEntry_Nav array property with the Work Order Header assignment model.
  // Skip the WODocuments array property with the Work Order Header assignment model.
  // Skip the WOPartners array property with the Work Order Header assignment model.
  // Skip the WOPriority object property with the Work Order Header assignment model.
  mirataDataBinding.WorkCenterInternalId = workOrderHeaderSSAM.WorkCenterInternalId

  // Add the descriptions of the equipment and functional location
  let equipment = await GetEquipmentDescription(context, mirataDataBinding.HeaderEquipment)
  mirataDataBinding.HeaderEquipmentDesc = equipment.EquipDesc
  mirataDataBinding.HeaderEquipmentSuperiorEquip = equipment.SuperiorEquip
  mirataDataBinding.HeaderFunctionalLocationDesc = await GetFunctionalLocationDescription(context, mirataDataBinding.HeaderFunctionalLocation)
  // Add the description of the work order type
  mirataDataBinding.OrderTypeDesc = await GetWorkOrderTypeDescription(context, mirataDataBinding.PlanningPlant, mirataDataBinding.OrderType)

  //PTEN
  mirataDataBinding.Operations = workOrderHeaderSSAM.Operations
  //PTEN

  return mirataDataBinding
}
 