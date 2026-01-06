/**
 * Get Equipment Details.
 */
import FindKeyInObject from "../../../MirataFormsCoreComponents/Rules/Common/FindKeyInObject";

export default async function ZGetEqipmentDetails(context) {

  let EquipmentRecord = {};
  let dummyEquipmentRecord = {
          EquipId: '',
          EquipDesc: '',
          ModelNum: '',
          Manufacturer: '',
          ManufSerialNo: ''
        };

  try {

    const clientData = context.getClientData()
      if (!clientData.MirataFormsData || !clientData.MirataFormsData.FormRuleInputData || Object.keys(clientData.MirataFormsData.FormRuleInputData).length === 0) {
        throw new Error("Mirata rule input data is not available in the Client Data object")
      }

    const ruleInputData = clientData.MirataFormsData.FormRuleInputData
    let EquipId = ruleInputData[FindKeyInObject(ruleInputData, ['EQUNR'])]
    let queryOptions = "$filter=EquipId eq '" + EquipId + "'";

    const EquipmentDetails = await context.read('/SAPAssetManager/Services/AssetManager.service','MyEquipments',[],queryOptions);
    if (EquipmentDetails && EquipmentDetails.length > 0) {
      EquipmentRecord = EquipmentDetails.getItem(0);
      context.binding.EquipmentRecord = [EquipmentRecord]
      return EquipmentRecord;
    } else {
        context.binding.EquipmentRecord = [dummyEquipmentRecord];
        return EquipmentRecord;
    }
  } catch (error) {
    context.binding.EquipmentRecord = [dummyEquipmentRecord];
    return EquipmentRecord;
  }
}