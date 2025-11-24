import WorkOrderOperationsListViewQueryOption from "../../../../../../SAPAssetManager/Rules/WorkOrders/Operations/WorkOrderOperationsListViewQueryOption"

/**
  * Returns a QueryBuilder instance configured to generate an OData query options
  * statement for querying the 'MyWorkOrderOperations' entity set. The query result
  * set produced will be identical to the one provided to the SSAM Work Order
  * Operations List View page.
  *
  * @note
  * The SSAM query options referenced here are the same as those used to populate
  * the SSAM Work Order Operations List View page, which utilizes an Object Cell
  * Table to display the list of operations. The query options dictate (among other
  * things) which entity set fields are returned in each row of the query result set.
  * This becomes the data context of each cell, which is then used as the data
  * binding context for the SSAM Work Order Operation Details page when a cell is
  * selected.
  *
  * @param {IClientAPI} context - The client context object
  * @returns {string} A string containing an OData query options statement for
  * querying the 'MyWorkOrderOperations' entity set.
  */
export default async function OperationQueryOptions(context, readLink) {
  // Clear the search string property to prevent additional (and unexpected)
  // work order operation filtering, but keep as empty string to avoid the
  // lack of null checks in some SSAM logic that computes query options.
  context.searchString = ""
  let queryOptions = WorkOrderOperationsListViewQueryOption(context)

  // When the SSAM assignment model is set to "2 - Operation/Task Level
  // Personnel Number Assignment", the queryOptions for the Operation context
  // will add a "$filter" clause that restricts the operations returned to
  // only those that are explicitly assigned to the current user. However,
  // since readLink used in this context will be configured to query a single
  // operation, the presence of the "$filter" clause will cause the read
  // operation to fail with the following error:
  //
  // "The $filter system query option can only be used when retrieving a
  // collection"
  //
  // Therefore, remove the "$filter" clause if it is present.
  //
  // Note: it appears that deleting a DataQueryBuilder filter clause once
  // it has been set is not possible. An additional filter statement can
  // be added to create a compound filter, but an existing filter cannot
  // be removed. That is why we are truncating the "$filter" clause (if it
  // is present) from the query options string as opposed to removing it by
  // reconfiguring the DataQueryBuilder instance it was built from.
  if (typeof queryOptions !== 'string') {
    if (typeof queryOptions.build === 'function') {
      queryOptions = await queryOptions.build()
    } else {
      throw new Error(`Error obtaining query options for '${readLink}'`)
    }
  }

  // The OData specification does not specify an order for query options.
  // Therefore, check for the filter clause occuring both at the start of the
  // query options string ("$filter") and also when embedded within the query
  // options string ("&$filter").
  let isFilterFirstOption = false;
  let filterIndex = queryOptions.indexOf('&$filter');

  if (filterIndex === -1) {
    // If "&$filter" is not found, check for "$filter" (it may be the first
    // option in the query options string).
    filterIndex = queryOptions.indexOf('$filter');
    isFilterFirstOption = true;
  }

  if (filterIndex !== -1) {
    // The filter clause exists in the query options string. Find the end of
    // the filter clause by looking for the start of the next parameter.
    let endIndex = queryOptions.indexOf('&$', filterIndex + 1);

    if (endIndex === -1) {
      // If no next parameter is found, remove the filter clause to the end
      // of the query options string.
      endIndex = queryOptions.length;
    } else if (isFilterFirstOption) {
      // If "$filter" is at the start of the string and there are other
      // options, we need to remove the "&" character of the next option to
      // maintain a valid query string format.
      endIndex += 1; // Include the "&" character in the removal
    }

    // Remove the filter clause
    queryOptions = queryOptions.substring(0, filterIndex) + queryOptions.substring(endIndex);
  }

  return queryOptions
}
