import GetCombinedDateAndTime from './Utility/GetCombinedDateAndTime';
import GetEquipmentDescription from './Utility/GetEquipmentDescription';
import GetFunctionalLocationDescription from './Utility/GetFunctionalLocationDescription';
import IsOperationLevelAssigmentType from '../../../../../../SAPAssetManager/Rules/WorkOrders/Operations/IsOperationLevelAssigmentType'
/**
  * Processes operation data from SSAM format to Mirata format.
  *
  * This function performs several key transformations:
  * - Converts SSAM date formats to Mirata date formats (milliseconds since epoch)
  * - Retrieves and adds equipment and functional location descriptions
  * - Handles operation-specific properties (prefixed with "Op")
  * - For operation-level assignments, includes:
  *   - Employee information from Employee_Nav
  *   - Mobile status information from OperationMobileStatus_Nav
  *
  * @param {IClientAPI} context - The client context object
  * @param {Object} operationSSAM - The operation data object from SSAM
  *
  * @returns {Promise<Object>} A Mirata-formatted operation object containing:
  *   - Operation-specific properties (prefixed with "Op")
  *   - Converted date fields in milliseconds since epoch
  *   - Equipment and functional location descriptions
  *   - Employee information (for operation-level assignments)
  *   - Mobile status information (for operation-level assignments)
  */
  export default async function OperationDataBindingMirata(context, operationSSAM) {
  // Purposely avoided using spread operator here to ensure that only object
  // properties with scalar values are copied.
  const mirataDataBinding = {}
  mirataDataBinding.OpActivityType = operationSSAM.ActivityType
  mirataDataBinding.OpAssembly = operationSSAM.Assembly
  mirataDataBinding.OpChecklistType = operationSSAM.ChecklistType
  mirataDataBinding.OpControlKey = operationSSAM.ControlKey
  mirataDataBinding.OpDuration = operationSSAM.Duration
  mirataDataBinding.OpDurationUOM = operationSSAM.DurationUOM
  if (IsOperationLevelAssigmentType(context)) {
    // Add selected properties from the Employee_Nav object that is only available with the operation assignment model.
    mirataDataBinding.OpEmployee_ControllingArea = operationSSAM.Employee_Nav.ControllingArea
    mirataDataBinding.OpEmployee_EmployeeName = operationSSAM.Employee_Nav.EmployeeName
    mirataDataBinding.OpEmployee_EndDate = operationSSAM.Employee_Nav.EndDate ? Date.parse(operationSSAM.Employee_Nav.EndDate) : undefined
    mirataDataBinding.OpEmployee_FirstName = operationSSAM.Employee_Nav.FirstName
    mirataDataBinding.OpEmployee_LastName = operationSSAM.Employee_Nav.LastName
    mirataDataBinding.OpEmployee_PartnerNumber = operationSSAM.Employee_Nav.PartnerNumber
    mirataDataBinding.OpEmployee_PersonnelArea = operationSSAM.Employee_Nav.PersonnelArea
    mirataDataBinding.OpEmployee_PersonnelNumber = operationSSAM.Employee_Nav.PersonnelNumber
    mirataDataBinding.OpEmployee_StartDate = operationSSAM.Employee_Nav.StartDate ? Date.parse(operationSSAM.Employee_Nav.StartDate) : undefined
    mirataDataBinding.OpEmployee_UserID = operationSSAM.Employee_Nav.UserID
  }
  mirataDataBinding.OpLAMObjectType = operationSSAM.LAMObjectType
  mirataDataBinding.OpLAMTableKey = operationSSAM.LAMTableKey
  mirataDataBinding.OpMaintenancePlant = operationSSAM.MaintenancePlant
  mirataDataBinding.OpMainWorkCenter = operationSSAM.MainWorkCenter
  mirataDataBinding.OpMainWorkCenterPlant = operationSSAM.MainWorkCenterPlant
  mirataDataBinding.OpNotifNum = operationSSAM.NotifNum
  mirataDataBinding.OpNumberOfCapacitites = operationSSAM.NumberOfCapacities
  mirataDataBinding.OpObjectKey = operationSSAM.ObjectKey
  mirataDataBinding.OpObjectNumber = operationSSAM.ObjectNumber
  mirataDataBinding.OpObjectType = operationSSAM.ObjectType
  mirataDataBinding.OpOperationCategory = operationSSAM.OperationCategory
  mirataDataBinding.OpOperationEquipment = operationSSAM.OperationEquipment
  mirataDataBinding.OpOperationFunctionalLocation = operationSSAM.OperationFunctionLocation
  if (IsOperationLevelAssigmentType(context)) {
    // Add selected properties from the OperationMobileStatus_Nav object that is only available with the operation assignment model.
    mirataDataBinding.OpMobileStatus_CreateUserId = operationSSAM.OperationMobileStatus_Nav.CreateUserId
    mirataDataBinding.OpMobileStatus_EffectiveTimestamp = operationSSAM.OperationMobileStatus_Nav.EffectiveTimestamp ? Date.parse(operationSSAM.OperationMobileStatus_Nav.EffectiveTimestamp) : undefined
    mirataDataBinding.OpMobileStatus_MobileStatus = operationSSAM.OperationMobileStatus_Nav.MobileStatus
    mirataDataBinding.OpMobileStatus_Status = operationSSAM.OperationMobileStatus_Nav.Status
    mirataDataBinding.OpMobileStatus_SystemStatus = operationSSAM.OperationMobileStatus_Nav.SystemStatus
    mirataDataBinding.OpMobileStatus_SystemStatusCode = operationSSAM.OperationMobileStatus_Nav.SystemStatusCode
  }
  mirataDataBinding.OpOperationNo = operationSSAM.OperationNo
  mirataDataBinding.OpOperationDescription = operationSSAM.OperationShortText
  mirataDataBinding.OpOrderId = operationSSAM.OrderId
  mirataDataBinding.OpPersonNum = operationSSAM.PersonNum
  mirataDataBinding.OpPhase = operationSSAM.Phase
  mirataDataBinding.OpSchedEarliestEndDate = operationSSAM.SchedEarliestEndDate ? Date.parse(operationSSAM.SchedEarliestEndDate) : undefined
  mirataDataBinding.OpSchedEarliestStartDate = operationSSAM.SchedEarliestStartDate ? Date.parse(GetCombinedDateAndTime(operationSSAM.SchedEarliestStartDate, operationSSAM.SchedEarliestStartTime)) : undefined
  mirataDataBinding.OpSchedLatestEndDate = operationSSAM.SchedLatestEndDate ? Date.parse(GetCombinedDateAndTime(operationSSAM.SchedLatestEndDate, operationSSAM.SchedLatestEndTime)) : undefined
  mirataDataBinding.OpSchedLatestStartDate = operationSSAM.SchedLatestStartDate ? Date.parse(operationSSAM.SchedLatestStartDate) : undefined
  // Skip the SubOperations array property
  mirataDataBinding.OpSubphase = operationSSAM.Subphase
  mirataDataBinding.OpWork = operationSSAM.Work
  mirataDataBinding.OpWorkCenterInternalId = operationSSAM.WorkCenterInternalId
  mirataDataBinding.OpWorkUnit = operationSSAM.OpWorkUnit

  // Add the descriptions of the equipment and functional location
  mirataDataBinding.OpOperationEquipmentDesc = await GetEquipmentDescription(context, operationSSAM.OperationEquipment)
  mirataDataBinding.OpOperationFunctionalLocationDesc = await GetFunctionalLocationDescription(context, operationSSAM.OperationFunctionLocation)

  return mirataDataBinding
}
