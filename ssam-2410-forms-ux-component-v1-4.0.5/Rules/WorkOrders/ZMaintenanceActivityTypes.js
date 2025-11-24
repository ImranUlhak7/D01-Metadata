/**
 * Get Maintenance Activity Types List.
 */
export default async function ZMaintenanceActivityTypes(context) {
  
  try {
    const measurementPointsList = await context.read('/SAPAssetManager/Services/AssetManager.service','OrderActivityTypes',[],'');
    if (measurementPointsList) {
      return measurementPointsList;
    }
  } catch (error) {
    return [];
  }
}