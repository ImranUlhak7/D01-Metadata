/**
 * ZInventoryCount
 * Returns count of ZWorkOrderInventoryCountHeaders entity set.
 *
 * @param {object} contexts
 * @returns {Promise<number>}
 */
export default function ZInventoryCount(context) {
    return context.count('/SAPAssetManager/Services/AssetManager.service', 'ZWorkOrderInventoryCountHeaders', '');
}