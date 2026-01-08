import NavToInitialUxForm from "../NavToInitialUxForm"

/**
 * Navigates to the initial UX form for work orders.
 * @param {IClientAPI} context - The client context object.
 */
export default async function NavToInitialMTFUxForm(context) {
    // The parameter passed is the "Record Key" column value of the row in the
    // "SSAM UX Configuration" data table for the specified SSAM business object.
    await NavToInitialUxForm(context, "Material Transfer");
}
