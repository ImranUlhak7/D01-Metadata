import WorkOrderOperationsListViewQueryOption from "../../../../../../SAPAssetManager/Rules/WorkOrders/Operations/WorkOrderOperationsListViewQueryOption"

/**
  * Returns a QueryBuilder instance configured to generate an OData query options
  * statement for querying the 'MyWorkOrderOperations' entity set. The query result
  * set produced will be identical to the one provided to the SSAM Work Order
  * Operations List View page.
  *
  * @param {IClientAPI} context - The client context object
  * @returns {DataQueryBuilder} DataQueryBuilder instance configured to generate
  * an OData query options statement for querying the 'MyWorkOrderOperations' entity
  * set.
  */
export default function OperationListQueryOptions(context) {
  // Clear the search string property to prevent additional (and unexpected)
  // work order operation filtering, but keep as empty string to avoid the
  // lack of null checks in some SSAM logic that computes query options.
  context.searchString = ""
  return WorkOrderOperationsListViewQueryOption(context)
}
