import { createNewWorkCenterFilterCriteria } from '../../../SAPAssetManager/Rules/FastFilters/WorkCenterFastFilter';

/** @param {IClientAPI} context  */
export default async function EquipmentListFilterResults(context) {
    const fcContainer = context.getControls().find(c => c.getType() === 'Control.Type.FormCellContainer');
    const [sortFilter, statusFilter] = ['SortFilter', 'StatusFilter'].map(n => fcContainer.getControl(n).getValue());
    const newWcFilter = await createNewWorkCenterFilterCriteria(context, fcContainer.getControl('WorkCenterFilter').getFilterValue(), 'MaintWorkCenter');
    const newSeFilter = fcContainer.getControl('SuperiorEquipmentFilter').getFilterValue();
    return [sortFilter, statusFilter, newWcFilter, newSeFilter].filter(i=> !!i);
}
