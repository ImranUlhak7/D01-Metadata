/**
 * Get Cause codes based on the equiment catalog profile
 */
export default async function ZEquipmentCauseList(context) {
    try {
    if(context.binding.Equipment){
      let catalogProfile = context.binding.Equipment.CatalogProfile;
      if(catalogProfile === ""){
        return [];
      }
      let queryOptions = "$filter=Catalog eq '5' and CatalogProfile eq '" + catalogProfile + "'&$orderby=Catalog,CatalogProfile,CodeGroup";
      const codeGroupList = await context.read('/SAPAssetManager/Services/AssetManager.service','PMCatalogProfiles',[], queryOptions);
      if (codeGroupList) {
        let queryOptions2 = "$filter=Catalog eq '5' and CodeGroup eq '" + codeGroupList.getItem(0).CodeGroup + "'";
        const causeList = await context.read('/SAPAssetManager/Services/AssetManager.service','PMCatalogCodes',[], queryOptions2);
        if (causeList) {
          return causeList;
        }
      }
    } else {
      let equipment =  await context.read('/SAPAssetManager/Services/AssetManager.service','PMCatalogProfiles',[], "$filter=EquipId eq '" + context.binding.HeaderEquipment + "'");
      let catalogProfile = equipment.getItem(0).CatalogProfile;
      if(catalogProfile === ""){
        return [];
      }
      let queryOptions = "$filter=Catalog eq '5' and CatalogProfile eq '" + catalogProfile + "'&$orderby=Catalog,CatalogProfile,CodeGroup";
      const codeGroupList = await context.read('/SAPAssetManager/Services/AssetManager.service','PMCatalogProfiles',[], queryOptions);
      if (codeGroupList) {
        let queryOptions2 = "$filter=Catalog eq '5' and CodeGroup eq '" + codeGroupList.getItem(0).CodeGroup + "'";
        const causeList = await context.read('/SAPAssetManager/Services/AssetManager.service','PMCatalogCodes',[], queryOptions2);
        if (causeList) {
          return causeList;
        }
      }
    }
  } catch (error) {
    return [];
  }
}