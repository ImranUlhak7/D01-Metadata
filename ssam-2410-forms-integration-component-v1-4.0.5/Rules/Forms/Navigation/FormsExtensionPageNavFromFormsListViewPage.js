import FormsExtensionPageNav from "./FormsExtensionPageNavFromWorkOrderOperationDetailsPage"

/**
 * Navigates from the Forms List View page to the Forms Extension page and
 * closes the Forms List View page when doing so.
 *
 * @param {IClientAPI} context - The page context object
 * @returns {Promise<void>} A promise that resolves when navigation is complete
 * @throws {Error} If navigation fails
 */
export default async function FormsExtensionPageNavFromFormsListViewPage(context) {
  try {
    // The action binding includes the form information object associated with
    // the row that was selected on the Forms List View page.
    const actionBinding = context.getPageProxy().getActionBinding();
    // Close the Forms List View page.
    await context.executeAction("/SAPAssetManager/Actions/Page/CancelPage.action");
    // Navigate to the Forms Extension page.
    FormsExtensionPageNav(context, actionBinding.id);
  } catch (error) {
    const component = "Navigation";
    const errorInfo = "Error navigating from the Forms List View page to the Forms Extension page";
    await LogError(context, error, { component, mdkInfo: { errorInfo } } );
    throw error;
  }
}
