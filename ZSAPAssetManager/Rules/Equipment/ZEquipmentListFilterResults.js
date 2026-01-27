import { createNewWorkCenterFilterCriteria } from '../../../SAPAssetManager/Rules/FastFilters/WorkCenterFastFilter';

/** @param {IClientAPI} context  */
export default async function EquipmentListFilterResults(context) {
    const fcContainer = context.getControls().find(c => c.getType() === 'Control.Type.FormCellContainer');
    const [sortFilter, statusFilter] = ['SortFilter', 'StatusFilter'].map(n => fcContainer.getControl(n).getValue());
    const newWcFilter = await createNewWorkCenterFilterCriteria(context, fcContainer.getControl('WorkCenterFilter').getFilterValue(), 'MaintWorkCenter');
    const newSeFilter = fcContainer.getControl('SuperiorEquipmentFilter').getFilterValue();
    const newFlFilter = fcContainer.getControl('FunctionalLocationFilter').getFilterValue();
    const newMnFilter = fcContainer.getControl('ModelNumberFilter').getFilterValue();
    const newMsnFilter = fcContainer.getControl('ManufacturerSerialNumberFilter').getFilterValue();
    const newEtFilter = fcContainer.getControl('EquipmentTypeFilter').getFilterValue();
    const newEdFilter = fcContainer.getControl('EquipmentDescriptionFilter').getFilterValue();
    
    return [sortFilter, statusFilter, newWcFilter, newSeFilter, newFlFilter, newMnFilter, newMsnFilter, newEtFilter, newEdFilter].filter(i=> !!i);
}
