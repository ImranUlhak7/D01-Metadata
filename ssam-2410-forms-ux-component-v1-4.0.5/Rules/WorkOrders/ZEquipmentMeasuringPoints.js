/**
 * Get Measurement Points List from equipment.
 */
export default async function ZEquipmentMeasuringPoints(context) {
  
  
  let equipment = context.binding.HeaderEquipment;
  let queryOptions = "$filter=EquipId eq '" + equipment + "'";
  try {
    const measurementPointsList = await context.read('/SAPAssetManager/Services/AssetManager.service','MeasuringPoints',[],queryOptions);
    if (measurementPointsList) {
      return measurementPointsList;
    }
  } catch (error) {
    return [];
  }
}