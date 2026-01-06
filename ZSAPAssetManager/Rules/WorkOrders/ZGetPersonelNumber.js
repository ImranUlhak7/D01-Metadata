/**
 * Get personnel number.
 */
import libCom from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default async function ZGetPersonnelNumber(context) {
  return libCom.getPersonnelNumber(context);
}