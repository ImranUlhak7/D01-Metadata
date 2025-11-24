import WorkOrdersListViewQueryOption from "../../../../../../SAPAssetManager/Rules/WorkOrders/ListView/WorkOrdersListViewQueryOption"

/**
  * Returns a QueryBuilder instance configured to generate an OData query options
  * statement for querying the 'MyWorkOrderHeaders' entity set. The query result
  * set produced will be identical to the one provided to the SSAM Work Order List
  * View page.
  *
  * @param {IClientAPI} context - The client context object
  * @returns {DataQueryBuilder} DataQueryBuilder instance configured to generate
  * an OData query options statement for querying the 'MyWorkOrderHeaders' entity
  * set.
  */
export default function WorkOrderListQueryOptions(context) {
  // Clear the search string property to prevent additional (and unexpected)
  // work order filtering, but keep as empty string to avoid the lack of null
  // checks in some SSAM logic that computes query options.
  context.searchString = ""
  return WorkOrdersListViewQueryOption(context)
}
