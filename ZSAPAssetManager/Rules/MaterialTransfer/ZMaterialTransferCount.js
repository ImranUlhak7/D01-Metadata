/**
 * ZMaterialTransfer count
 * Returns count of ZMaterialTransferFormHeaders entity set.
 *
 * @param {object} contexts
 * @returns {Promise<number>}
 */
export default function ZMaterialTransferCount(context) {
    return context.count('/SAPAssetManager/Services/AssetManager.service', 'ZMaterialTransferFormHeaders', '');
}