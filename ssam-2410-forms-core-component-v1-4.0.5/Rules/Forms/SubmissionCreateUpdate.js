import LogError from "./LogError"
import ODataDate from "../../../SAPAssetManager/Rules/Common/Date/ODataDate"

/**
 * Creates a new, or updates an existing, Mirata Forms submission entity in
 * the "Submissions" entity set.
 *
 * @param {ControlProxy} context - the ClientAPI data context object
 */
export default async function SubmissionCreateUpdate(context) {
  // NOTES:
  //
  // The following are important facts that were considered and/or incurred
  // when implementing the solution below for passing form submission-related
  // data to the "FormSubmissionCreate.action" or "FormSubmissionUpdate.action"
  // invoked to create or update (respectively) a Mirata Form submission entity...
  //
  // 1) The context.getPageProxy().setActionBinding() function was initially
  // used and "worked" (for the purpose of making submission data available to
  // the action). However, doing so has the negative side effect of modifying
  // the existing bound data context (which is set to the data context of a work
  // order or work order operation) after the submission create/update action
  // completed. The bound data context must be persisted in its original form
  // because integration data mappings and/or integration actions (of type
  // embedded integration event) executed by the form may depend on accessing
  // integration data values via the initially bound data context.
  //
  // 2) The "action data" (aka "action override") method of providing data to
  // an action (i.e.- using an object with "Name" and "Properties" keys) was
  // tried, but failed because the MDK architecture interpreted "stringified"
  // object values as "object binding" syntax (see https://help.sap.com/doc/...
  // ...f53c64b93e5140918d676b927a3cd65b/Cloud/en-US/docs-en/guides/...
  // ...getting-started/mdk/development/property-binding/object-binding.html).
  // Depending on the stringified object's data, the corresponding value was
  // either left unmodified or was (apparenetly) considered to be "invalid" and
  // was not provided to the action. In this latter case however, no exception
  // was thrown - unless the affected submission property had its OData
  // "nullable" attribute set to false in the "Submissions" entity set definition.
  //
  // 3) Next, passing data to the submission create/update action using the
  // "client data object" approach was tried (i.e.- using the ClientAPI.getClientData()
  // function here in the rule to access the "client data object", and using the
  // "#ClientData" target path in the action to do the same). At first, this
  // approach didn't work until, that is, the ClientAPI.getPageProxy() function
  // was used to 1) gain access to the "client data object" and 2) to execute the
  // submission create/update action. Note that this fact appears to contradict
  // MDK documentation that states the following regarding getting access to the
  // "client data object" via ClientAPI.getClientData()... "Can only be accessed
  // by the IClientAPI instances associated with a UI element". Given that this
  // rule is solely called by Mirata Forms Extension Control (which is a UI
  // control that resides on an MDK Page), the context parameter passed to
  // this function is of type "ControlProxy" (a subclass of ClientAPI - as is
  // PageProxy). Yet, calling the getClientData() and executeAction() API
  // functions via the ControlProxy instance does not allow the submission
  // create/update action to access the submission data via the "client data
  // object".

  // If an error occurs, the errorContextData object needs to be accessible
  // by the catch block logic.
  let errorContextData

  try {
    const clientData = context.getClientData()
    const definition = clientData.MirataFormsData.Definition
    const formUser = clientData.MirataFormsData.FormUser
    const formSubmissionData = clientData.MirataFormsData.FormSubmissionData
    const submissionQueryOptions = clientData.MirataFormsData.SubmissionQueryOptions

    errorContextData  = {
      component: "MDK 'Create/Update' Submission",
      definition: definition.id,
      definitionVersion: definition.version,
      submissionId: undefined,
      submissionVersion: undefined
    }

    let isCreate = false
    let submissionAction
    const currentDateTime = new ODataDate().toDBDateTimeString(context)
    const submissionActionData = {}

    // Determine if a previous version of this form submission exists
    const queryResult = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "Submissions", [], submissionQueryOptions)

    if (queryResult?.getItem(0)) {
      // A previous submission exists, so will update it by creating a new version
      const previousSubmission = queryResult.getItem(0)
      errorContextData.component = "MDK Update Submission"
      errorContextData.submissionId = previousSubmission.id
      errorContextData.submissionVersion = previousSubmission.version + 1
      const assignmentChanged = didAssignmentChange(JSON.parse(previousSubmission.assignedTo), formSubmissionData.apiFormInstanceMetadata.assignedTo)

      submissionAction = "/MirataFormsCoreComponents/Actions/Forms/FormSubmissionUpdate.action"
      submissionActionData.readLink = previousSubmission["@odata.readLink"]
      submissionActionData.id = previousSubmission.id
      submissionActionData.version = previousSubmission.version + 1
      submissionActionData.baseVersion = previousSubmission.baseVersion
      submissionActionData.organizationId = previousSubmission.organizationId
      submissionActionData.definitionId = previousSubmission.definitionId
      submissionActionData.definitionVersion = definition.version
      submissionActionData.formType = definition.formType
      submissionActionData.assignedBy = assignmentChanged ? formUser.id : previousSubmission.assignedBy
      submissionActionData.assignedTo = assignmentChanged ? JSON.stringify(formSubmissionData.apiFormInstanceMetadata.assignedTo) : previousSubmission.assignedTo
      submissionActionData.assignedAt = assignmentChanged ? currentDateTime : previousSubmission.assignedAt
      submissionActionData.createdBy = previousSubmission.createdBy
      submissionActionData.createdAt = previousSubmission.createdAt
      submissionActionData.status = formSubmissionData.apiFormInstanceMetadata.status
      submissionActionData.headerInfo = JSON.stringify(formSubmissionData.apiFormInstanceMetadata.headerInfo)
      submissionActionData.responseData = JSON.stringify(formSubmissionData.apiFormInstanceMetadata.responseData)
      submissionActionData.backendUpdateList = JSON.stringify(formSubmissionData.apiFormInstanceMetadata.backendUpdateList)
      submissionActionData.transitionLogEntry = formSubmissionData.apiFormInstanceMetadata.transitionLogEntry ? JSON.stringify(formSubmissionData.apiFormInstanceMetadata.transitionLogEntry) : "[]"
      submissionActionData.submittedBy = formUser.id
      submissionActionData.submittedAt = currentDateTime
      submissionActionData.dependencies = formSubmissionData.apiFormInstanceMetadata.dependencies ? JSON.stringify(formSubmissionData.apiFormInstanceMetadata.dependencies) : "[]"
      submissionActionData.images = formSubmissionData.apiFormInstanceMetadata.images ? JSON.stringify(formSubmissionData.apiFormInstanceMetadata.images) : "[]"
      submissionActionData.submission = JSON.stringify(formSubmissionData.formData)
    } else {
      // A previous submission does not exist, so create the initial version
      isCreate = true
      errorContextData.component = "MDK Create Submission"
      errorContextData.submissionId = formSubmissionData.apiFormInstanceMetadata.id
      errorContextData.submissionVersion = 1
      let assignment = formSubmissionData.apiFormInstanceMetadata.assignedTo
      if (!assignment || (Object.keys(assignment).length === 0 && assignment.constructor === Object)) {
        assignment = { groupIdList: [], userIdList: [formUser.id] }
      }

      submissionAction = "/MirataFormsCoreComponents/Actions/Forms/FormSubmissionCreate.action"
      submissionActionData.id = formSubmissionData.apiFormInstanceMetadata.id
      submissionActionData.version = 1
      submissionActionData.baseVersion = 0
      submissionActionData.organizationId = definition.organizationId
      submissionActionData.definitionId = definition.id
      submissionActionData.definitionVersion = definition.version
      submissionActionData.formType = definition.formType
      submissionActionData.assignedBy = formUser.id
      submissionActionData.assignedTo = JSON.stringify(assignment)
      submissionActionData.assignedAt = currentDateTime
      submissionActionData.createdBy = formUser.id
      submissionActionData.createdAt = currentDateTime
      submissionActionData.status = formSubmissionData.apiFormInstanceMetadata.status
      submissionActionData.headerInfo = JSON.stringify(formSubmissionData.apiFormInstanceMetadata.headerInfo)
      submissionActionData.responseData = JSON.stringify(formSubmissionData.apiFormInstanceMetadata.responseData)
      submissionActionData.backendUpdateList = JSON.stringify(formSubmissionData.apiFormInstanceMetadata.backendUpdateList)
      submissionActionData.transitionLogEntry = formSubmissionData.apiFormInstanceMetadata.transitionLogEntry ? JSON.stringify(formSubmissionData.apiFormInstanceMetadata.transitionLogEntry) : "[]"
      submissionActionData.submittedBy = formUser.id
      submissionActionData.submittedAt = currentDateTime
      submissionActionData.dependencies = formSubmissionData.apiFormInstanceMetadata.dependencies ? JSON.stringify(formSubmissionData.apiFormInstanceMetadata.dependencies) : "[]"
      submissionActionData.images = formSubmissionData.apiFormInstanceMetadata.images ? JSON.stringify(formSubmissionData.apiFormInstanceMetadata.images) : "[]"
      submissionActionData.submission = JSON.stringify(formSubmissionData.formData)
    }
    // Use the "client data" object to pass the form submission data to the action
    context.getPageProxy().getClientData().SubmissionActionData = submissionActionData
    // Execute the action that creates or updates the form submission entity
    await context.getPageProxy().executeAction(submissionAction)
    // Process submission images (if any)
    const images = formSubmissionData.apiFormInstanceMetadata.images
    if (images?.length) {
      await processSubmissionImages(context, images, submissionActionData.id, errorContextData)
    }
  } catch (error) {
    LogError(context, error, errorContextData)
    throw error
  }
}

/**
 * Stores Base64-encoded submission image data in the "SubmissionImagesClient"
 * entity set. If a form instance is redisplayed, the existing submission image
 * data will be requested by the Mirata Forms engine and can be retrieved from
 * the this entity set. Data in the "SubmissionImagesClient" is transitory and
 * is not synchonized with Mobile Services. Rather, all entities are deleted
 * during each synchronization session.
 *
 * @param {ControlProxy} context - the ClientAPI data context object
 * @param {String[]} images - an array of Base64-encoded images
 * @param {string} submissionId - the UID of the form submission the images are
 *    associated with
 * @param {object} errorContextData - an object that holds context-specific data
 *    that will be referenced should an exception occur
 */
async function processSubmissionImages(context, images, submissionId, errorContextData) {
  errorContextData.component += " Image Processing"
  for (const image of images) {
    try {
      errorContextData.imageId = image.id
      // Check if a "local" Base64-encoded version of this submission image
      // already exists.
      let isSubmissionImageCreate = true
      // NOTE: if a read link is used here and no entity exists that matches
      // the read link, an error is thrown (which we do not want here). This
      // does not happen when a basic entity set reference and a filter
      // statement are used.
      const queryResult = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service",
        "SubmissionImagesClient",
        [],
        `$filter=submissionId eq '${submissionId}' and imageId eq '${image.id}'`)
      if (queryResult?.length) {
        isSubmissionImageCreate = false
      }
      errorContextData.component = `MDK ${isSubmissionImageCreate ? 'Create' : 'Update'} Submission Image`

      // Parse the image data URL to get the image MIME type and encoding
      const match = image.image.match(/data:(?<mime>[\w\/\-\.]+);(?<encoding>\w+),.+/m)
      if (!match?.groups.mime) {
        throw new Error("Unable to determine submission image MIME type")
      }
      if (!match?.groups.encoding) {
        throw new Error("Unable to determine submission image encoding")
      }
      if (match?.groups.encoding !== "base64") {
        throw new Error(`Unexpected submission image encoding: '${match.groups.encoding}'; expected 'base64'`)
      }
      // Store the base64-encoded data in the SubmissionImagesClient entity set
      let Name
      const Properties = {}
      if (isSubmissionImageCreate) {
        Properties.submissionId = submissionId
        Properties.imageId = image.id
        Properties.contentType = match.groups.mime
        Properties.encoding = match.groups.encoding
        Properties.dataURL = image.image
        Name = "/MirataFormsCoreComponents/Actions/Forms/FormSubmissionImagesClientCreate.action"
      } else {
        Properties.readLink = `SubmissionImages(submissionId='${submissionId}',imageId='${image.id}')`
        Properties.contentType = match.groups.mime
        Properties.encoding = match.groups.encoding
        Properties.dataURL = image.image
        Name = "/MirataFormsCoreComponents/Actions/Forms/FormSubmissionImagesClientUpdate.action"
      }
      const actionData = {
        Name,
        Properties: {
          Properties
        }
      }

      await context.executeAction(actionData)
    } catch (error) {
      LogError(context, error, errorContextData)
      throw error
    }
  }
}

/**
 * Mirata assignments are objects that contain two keys ('groupIdList' and
 * 'userIdList'), with the value of both keys being an array of strings.
 * This function compares the contents of the like-named arrays of the two
 * objects passed and returns boolean true if any differences are detected;
 * otherwise, boolean false is returned.
 *
 * @param {object} previousAssignment the Mirata assignment object from
 *   the previous submission version
 * @param {object} currentAssignment the Mirata assignment object from
 *   the latest form transition data
 */
function didAssignmentChange(previousAssignment, currentAssignment) {
  // Assignment data exists in the previous submission, but none exists in the current
  // transition event data.  This implies that when the event data associated with the
  // previous submission was received, it also did not any assignment data; and as a
  // result, a "default" assignment object was created based on the current form user.
  // In this scenario, return false so that the assignment data from the previous
  // subnission is used.
  if (previousAssignment && !currentAssignment) {
    return false
  }
  // The assignment changed if the length of the groupIdList array changed between submissions
  if (previousAssignment.groupIdList.length !== currentAssignment.groupIdList.length) {
    return true
  }
  // The assignment changed if the length of the userIdList array changed between submissions
  if (previousAssignment.userIdList.length !== currentAssignment.userIdList.length) {
    return true
  }
  // The assignment changed if an entry in the groupIdList array from the previous submission
  // is not present in the groupIdList of the current submission
  if (previousAssignment.groupIdList.length > 0) {
    for (let i = 0; i < previousAssignment.groupIdList.length; i++) {
      if (!currentAssignment.groupIdList.includes(previousAssignment.groupIdList[i])) {
        return true
      }
    }
  }
  // The assignment changed if an entry in the userIdList array from the previous submission
  // is not present in the userIdList of the current submission
  if (previousAssignment.userIdList.length > 0) {
    for (let i = 0; i < previousAssignment.userIdList.length; i++) {
      if (!currentAssignment.userIdList.includes(previousAssignment.userIdList[i])) {
        return true
      }
    }
  }
  // If all the previous comparisions did not detect any differences, then the assignment
  // did not change between the previous and current submissions
  return false
}

