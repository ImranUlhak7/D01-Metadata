import LogError from "../../Forms/LogError"

/**
 * Deletes all entities present in the Mirata "SubmissionImagesClient" entity
 * set
 * @param {ClientAPI} context
 * @returns {Promise<void>}
 */
export default async function ClearSubmissionImagesClient(context) {
  let component
  try {
    // Notes:
    //
    // The "SubmissionImagesClient" entity set is (purposely) not synchronized
    // because its "create entity" action has no "upload category" defined. To
    // delete entities that are created on the mobile device, but have not yet
    // been synchronized to Mobile Services, the "UndoPendingChanges" action is
    // used.
    //
    // The "SubmissionImages" entity set is synchronized, as entities in this
    // entity set are received from the Mirata backend (but are never modified
    // by the SSAM + Forms application). For entity sets that are synchronized,
    // the MDK architecture's OData implementation auto-magically removes
    // entities from the local entity set that are no longer part of the set of
    // entities received from the backend during the most recent synchonization
    // session. Therefore no clean-up of (possibly) "orphaned" entities are
    // required for the "SubmissionImages" entity set.
    const promiseList = []
    const service = "/MirataFormsCoreComponents/Services/MirataAPI.service"
    const entitySet = "SubmissionImagesClient"
    const entities = await context.read(service, entitySet, [])
    if (entities?.length) {
      entities.forEach(entity => {
        const editLink = entity["@odata.editLink"]
        const actionData = {
          Name: "/MirataFormsCoreComponents/Actions/OData/UndoPendingChanges.action",
          Properties: {
            Target: {
              EntitySet: entitySet,
              EditLink: editLink,
              Service: service
            }
          }
        }
        promiseList.push(context.executeAction(actionData))
      })
    }
    await Promise.all(promiseList)
  } catch (error) {
    const component = "Clear SubmissionImagesClient entities"
    LogError(context, error, { component })
    throw error
  }
}