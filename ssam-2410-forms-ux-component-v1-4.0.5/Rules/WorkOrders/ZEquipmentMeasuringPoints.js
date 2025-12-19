/**
 * Get Measurement Points List from equipment.
 */
export default async function ZEquipmentMeasuringPoints(context) {
  
  let resultList = [];
  let equipment = context.binding.HeaderEquipment;
  let queryOptions = "$filter=EquipId eq '" + equipment + "'";
  try {
    const measurementPointsList = await context.read('/SAPAssetManager/Services/AssetManager.service','MeasuringPoints',[],queryOptions);
    if (measurementPointsList) {
      let codeQueryOptions = "$filter=Catalog eq 'V'";
      const CodeList = await context.read('/SAPAssetManager/Services/AssetManager.service','PMCatalogCodes',[],codeQueryOptions);
      for (let index = 0; index < measurementPointsList.length; index++) {
        let point = measurementPointsList.getItem(index);
        if(point.CodeGroup !== "") {
          point.Codes = CodeList.filter(codeItem => codeItem.CodeGroup === point.CodeGroup);
        } else {
          point.Codes = [];
        }
        resultList.push(point);
      }
      return resultList;
    }
  } catch (error) {
    return [];
  }
}