/**
 * Get Plant and Rig  List.
 */
export default async function ZGetPlantRigList(context) {

  try {
    const PlantRigList = await context.read('/SAPAssetManager/Services/AssetManager.service','ZMTFRigPlants',[],'');
    if (PlantRigList) {
      return PlantRigList;
    }
  } catch (error) {
    return [];
  }
}