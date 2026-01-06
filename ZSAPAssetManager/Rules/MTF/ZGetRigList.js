/**
 * Get Rig List.
 */
export default async function ZGetRigList(context) {

  try {
    let filter = "$filter=EquipType eq 'RIG'";
    const RigList = await context.read('/SAPAssetManager/Services/AssetManager.service','MyEquipments',[],filter);
    if (RigList) {
      return RigList;
    }
  } catch (error) {
    return [];
  }
}