/**
 * Get Measurement Points List.
 */
export default async function ZMeasurementPoints(context) {
  
  
  let workOrder = context.binding.OrderId;
  let queryOptions = "$filter=OrderId eq '" + workOrder + "'&$expand=WOToolLongText_Nav";
  try {
    const measurementPointsList = await context.read('/SAPAssetManager/Services/AssetManager.service','MyWorkOrderTools',[],queryOptions);
    if (measurementPointsList) {
      return measurementPointsList;
    }
  } catch (error) {
    return [];
  }
}