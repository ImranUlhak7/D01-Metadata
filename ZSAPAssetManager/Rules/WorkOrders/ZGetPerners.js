/**
 * Get personel numbers List.
 */
export default async function ZGetPerners(context) {
  
  
  let MainWorkCenter = context.binding.MainWorkCenter;
  let queryOptions = "$filter=contains(ZWorkCenter, '" + MainWorkCenter + "')";
  try {
    const Employees = await context.read('/SAPAssetManager/Services/AssetManager.service','Employees',[],queryOptions);
    if (Employees) {
      return Employees;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}