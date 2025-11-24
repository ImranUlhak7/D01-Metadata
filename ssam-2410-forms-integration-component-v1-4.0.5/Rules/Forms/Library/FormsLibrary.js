import { NoteLibrary as libNote } from "../../Notes/NoteLibrary"
import LogError from "../../../../MirataFormsCoreComponents/Rules/Forms/LogError"

/**
 * FormsLibrary class provides utilities for managing Mirata forms integration
 * with SAP Service and Asset Manager.
 */
export default class {

  static component = "Mirata Forms library"

  /**
   * Determines if a Mirata form definition exists in the Mirata offline OData
   * entity sets.
   *
   * @param {IClientAPI} context - The client context object
   * @param {string} formId - The ID of the form to check
   * @returns {Promise<boolean>} - True if the form exists, false otherwise
   */
  static async isFormIdValid(context, formId) {
    try {
      // Using the form ID, query the Mirata "Definitions" entity set for the
      // requested form's definition
      const filter = `$filter=id eq '${formId}'&$orderby=version desc&$top=1`
      const definitionQueryResult = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "Definitions", [], filter)
      if (!definitionQueryResult || definitionQueryResult.length === 0) {
        return false
      }
      return true
    } catch (error) {
      const errorInfo = `Exception determining if Form ID '${formId}' exists in the 'Definitions' entity set`
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      throw error
    }
  }

  /**
   * Retrieves the form ID associated with, or assigned to, the specified
   * business object.
   *
   * For this implementation, the approach used is simplistic: define the
   * assigned form ID in the note (i.e. - long text) of each "form-enabled"
   * business object using the following rules:
   * 1) Preface the form ID with the text string "form:"
   * 2) "form:" must occur at the beginning of a long text line
   * 3) Whitespace may be placed between "form:" and the form ID
   *
   * "Production" implementations will likely have the form ID defined as
   * a property/field of the business object, or may involve a cross-reference
   * table implemented as an OData entity set.
   *
   * If the context passed to this function is not bound to the target business
   * object, a custom binding object can be passed as a parameter, which must
   * have the following properties:
   * - @odata.type: The OData entity type of the business object (string)
   * - @odata.id: The OData ID of the business object's entity (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<string|undefined>} - The form ID if found, undefined otherwise
   */
  static async getFormIdForBusinessObject(context, customBinding = null) {
    try {
      let note
      if (customBinding) {
        note = await libNote.noteDownloadValueByCustomBinding(context.getPageProxy(), customBinding)
      } else {
        note = await libNote.noteDownloadValue(context.getPageProxy())
      }
      // If the Notes property of the entity in context contains the text
      // "form: <form id>" (starting at the beginning of a line, case
      // insensitive and with or without whitespace preceding the <form id>),
      // returns the <form id>.
      if (note) {
        const match = note.match(/^form:\s*(\S+)/im)
        return match ? match[1] : undefined
      }
      return undefined
    } catch (error) {
      const errorInfo = "Exception attempting to obtain Form ID from business object note text"
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      return undefined
    }
  }

  /**
   * Retrieves a list of form IDs associated with the business object in context.
   *
   * This implementation uses a simplistic approach: define a list of form IDs
   * in the note (i.e.- long text) of a "form-enabled" business object using the
   * following rules:
   *
   * 1) Preface the list of form IDs with the text string "forms:" (case
   *    insensitive) which must occur at the beginning of a long text line
   * 2) Whitespace may be placed between "forms:" and the first form ID
   * 3) Form IDs *must* be comma-delimited
   * 4) The last form ID in the list *must* be terminated with a semicolon (;)
   * 5) Whitespace (including newlines) may be placed between the comma-delimited
   *    form IDs in the list
   * 6) A form ID that does not fit on a single long text line may be continued
   *    on the next long text line
   *
   * "Production" implementations will likely have the form ID list defined as
   * a property/field of the business object, or may involve a cross-reference
   * table implemented as an OData entity set.
   *
   * If the context passed to this function is not bound to the target business
   * object, a custom binding object can be passed as a parameter, which must
   * have the following properties:
   * - @odata.type: The OData entity type of the business object (string)
   * - @odata.id: The OData ID of the business object's entity (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<Array<string>|undefined>} - The list of form IDs if found,
   *    otherwise undefined
   * @throws {Error} - If there is an error retrieving the form ID list
   */
  static async getFormIdListForBusinessObject(context, customBinding = null) {
    try {
      let note
      if (customBinding) {
        note = await libNote.noteDownloadValueByCustomBinding(context.getPageProxy(), customBinding)
      } else {
        note = await libNote.noteDownloadValue(context.getPageProxy())
      }
      // Obtains the "Notes" property of the business object in context, matches
      // "forms:<anything that not ;>;", isolates the <anything that not ;> text,
      // removes all whitespace/newlines from the text, then splits the text on
      // the comma character and returns the resulting list array.
      //
      // Note: this function does not perform any validation on the returned list
      // of strings - each of which is assumed to be a valid Mirata form ID.
      if (note) {
        const match = note.match(/^forms:([^;]+);/im)
        if (match && match[1]) {
          match[1] = match[1].replace(/\s/gm,"")
          return match[1].split(",")
        }
        return undefined
      }
      return undefined
    } catch (error) {
      const errorInfo = "Exception attempting to obtain Form ID from business object note text"
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      return undefined
    }
  }

  /**
   * Given a business object that has a list of form IDs associated with it,
   * (see function getFormIdListForBusinessObject() above), this function returns
   * an array of objects, with each object containing a form ID from the list,
   * and the corresponding form's name, description and version attributes. Only
   * the latest available version of each form is returned. The objects in the
   * returned array are sorted by the form name attribute in each object.
   *
   * Note: if one or more IDs in the list of form IDs are not defined in the
   * "Definitions" entity set, an exception is *not* be thrown by this function.
   * The corresponding form's information will simply not be included in the
   * returned object array.
   *
   * If the context passed to this function is not bound to the target business
   * object, a custom binding object can be passed as a parameter, which must
   * have the following properties:
   * - @odata.type: The OData entity type of the business object (string)
   * - @odata.id: The OData ID of the business object's entity (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<Array<Object>>} - A promise that resolves to an array of
   *    Mirata form information objects. Each object contains:
   *     - {string} id - Unique identifier for the form
   *     - {string} name - Name of the form
   *     - {string} description - Description of the form
   *     - {number} version - Version of the form
   */
  static async getFormInfoListForBusinessObject(context, customBinding = null) {
    const formInfoList = []
    const formIds = await this.getFormIdListForBusinessObject(context, customBinding)
    if (!formIds) {
      return formInfoList
    }
    // In this scenario, only present the latest version of each form to the user
    for (const formId of formIds) {
      const filter = `$filter=id eq '${formId}'&$orderby=version desc&$top=1`
      const queryResult = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "Definitions", ["id", "name", "description", "version"], filter)
      if (queryResult && queryResult.length) {
        formInfoList.push(queryResult.getItem(0))
      }
    }
    return formInfoList.sort((a, b) => ('' + a.name).localeCompare(b.name))
  }

  /**
   * Determines if the business object (work order or operation) currently in
   * context has an association with one or more form IDs.
   *
   * If the context passed to this function is not bound to the target business
   * object, a custom binding object can be passed as a parameter, which must
   * have the following properties:
   * - @odata.type: The OData entity type of the business object (string)
   * - @odata.id: The OData ID of the business object's entity (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<boolean>} - True if the business object in context has an
   *    associated form ID or form ID list, false otherwise
   */
  static async isBusinessObjectFormEnabled(context, customBinding = null) {
    const formId = await this.getFormIdForBusinessObject(context, customBinding)
    const formIds = await this.getFormIdListForBusinessObject(context, customBinding)
    return (!!formId || !!formIds)
  }

  /**
   * Determines if the business object (work order or operation) currently in
   * context has an association with a list of form IDs (as opposed to a
   * single form ID).
   *
   * If the context passed to this function is not bound to the target business
   * object, a custom binding object can be passed as a parameter, which must
   * have the following properties:
   * - @odata.type: The OData entity type of the business object (string)
   * - @odata.id: The OData ID of the business object's entity (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<boolean>} - True if the business object in context has an
   *    associated form ID list, false otherwise
   */
  static async isBusinessObjectFormListEnabled(context, customBinding = null) {
    const formIds = await this.getFormIdListForBusinessObject(context, customBinding)
    return !!formIds
  }

  /**
   * Displays a warning dialog when attempting to complete a form-enabled
   * operation before completing its associated form.
   *
   * @param {IClientAPI} context - The client context object
   * @returns {Promise<void>}
   */
  static async showWarningCompleteFormBeforeCompleteOperation(context) {
    return this.showWarningCompleteFormOperation(context, "Complete")
  }

  /**
   * Displays a warning dialog when attempting to confirm a form-enabled
   * operation before completing its associated form.
   *
   * @param {IClientAPI} context - The client context object
   * @returns {Promise<void>}
   */
  static async showWarningCompleteFormBeforeConfirmOperation(context) {
    return this.showWarningCompleteFormOperation(context, "Confirm")
  }

  /**
   * Displays a warning dialog when attempting to complete or confirm a
   * form-enabled operation before completing its associated form.
   *
   * @param {IClientAPI} context - The client context object
   * @param {string} operationEvent - The type of operation event being
   *   attempted ("Complete" or "Confirm")
   * @returns {Promise<void>}
   * @throws {Error} - If there is an error displaying the dialog
   */
  static async showWarningCompleteFormOperation(context, operationEvent) {
    try {
      await context.nativescript.uiDialogsModule.alert({
        title: `Cannot ${operationEvent} Operation`,
        message: "\nThe form associated with this operation must first be completed.",
        okButtonText: "OK",
        cancelable: false
      })
    } catch (error) {
      const errorInfo = "Error attempting to display warning dialog"
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      throw error
    }
  }

  /**
   * Displays a warning dialog when attempting to confirm all operations of a
   * work order, but at least one operation is form-enabled and its associated
   * form has not been completed.
   *
   * @param {IClientAPI} context - The client context object
   * @param {string} operationsWithIncompleteForms - A comma-delimited list of
   *    operation numbers that have not completed their associated form
   * @returns {Promise<void>}
   */
  static async showWarningCompleteFormsBeforeConfirmAllOperations(context, operationsWithIncompleteForms) {
    if (!operationsWithIncompleteForms) {
      throw new Error("No operation number(s) provided");
    }
    const s = operationsWithIncompleteForms.split(",").length - 1 ? "s" : "";
    try {
      await context.nativescript.uiDialogsModule.alert({
        title: `Cannot Confirm Operation${s}`,
        message: `\nThe form${s} associated with the following operation${s} must first be completed:\n\n${operationsWithIncompleteForms}`,
        okButtonText: "OK",
        cancelable: false
      })
    } catch (error) {
      const errorInfo = "Error attempting to display warning dialog"
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      throw error
    }
  }

  /**
   * Returns a string containing identifying information about the work order operation
   * in the current SSAM context.
   *
   * It is assumed that the context passed to this function is bound to a work
   * order operation.
   *
   * @param {IClientAPI} context - The client context object
   * @returns {string} A string containing the work order ID and operation number
   */
  static getContextDataForWorkorderOperation(context) {
    return `Workorder#: ${context.binding.OrderId}; Operation#: ${context.binding.OperationNo}`
  }

  /**
   * This function has been deprecated. It was was "renamed" for naming consistency.
   * It is effectively "aliased" here in case any "early adopters" call it.
   *
   * Use function getFormSubmissionQueryOptionsForFormEnabledOperation() instead
   *
   * @deprecated
   */
  static async getSubmissionQueryOptionsForFormEnabledOperation(context) {
    return getFormSubmissionQueryOptionsForFormEnabledOperation(context)
  }

  /**
   * Generates OData query options to retrieve the latest form submission for a
   * work order operation. The query filters submissions based on the work
   * order ID and operation number found in various possible case-insensitive
   * JSON key formats within the submission's "headerInfo" field.
   *
   * If the context passed to this function is not bound to the target work
   * order operation, a custom binding object can be passed to this function
   * as a parameter, which must have the following properties:
   * - OrderId: The work order ID (string)
   * - OperationNo: The operation number (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<string>} - OData query options string for filtering submissions
   * @throws {Error} - If there is an error generating the query options
   */
  static async getFormSubmissionQueryOptionsForFormEnabledOperation(context, customBinding = null) {
    try {
      // Implementation note: When the call to this function originates from
      // the "Confirm" button on the Operation Details page, the object bound
      // to the context passed to this function (context.binding) reflects the
      // operation "in context".
      //
      // When the call to this function originates from the "Confirm" button
      // on an operation "object tile" displayed on the work order details page
      // (introduced in SSAM 2405), the object bound to the context passed to
      // this function (context.binding) is the work order in context, with the
      // target operation's data passed as "action binding" data
      // (context.getPageProxy().getActionBinding()). In this scenario, retrieve
      // the target operation's data from the "action binding" data.
      const workOrderId = customBinding?.OrderId ?? context.binding.OrderId
      const operationId = customBinding?.OperationNo ?? context.binding.OperationNo
      //PTEN
      // if (!workOrderId || !operationId) {
      //   throw new Error(`'OrderId' (${workOrderId}) or 'OperationNo' (${operationId}) not found in data binding`);
      // }
      if (!workOrderId) {
        throw new Error(`'OrderId' (${workOrderId}) not found in data binding`);
      }
      //PTEN
      // Generate the OData query options string to filter submissions based on the
      // work order ID and operation number found in various possible case-insensitive
      // JSON key formats within the submission's "headerInfo" field.
      //PTEN
      const submissionQueryOptions =
        "$filter=" +
        `((substringof('"workorderid":"${workOrderId}"',tolower(headerInfo)) or ` +
        `substringof('"workorder-id":"${workOrderId}"',tolower(headerInfo)) or ` +
        `substringof('"work-order-id":"${workOrderId}"',tolower(headerInfo)) or ` +
        `substringof('"workorder_id":"${workOrderId}"',tolower(headerInfo)) or ` +
        `substringof('"work_order_id":"${workOrderId}"',tolower(headerInfo)))` +
        // `substringof('"work_order_id":"${workOrderId}"',tolower(headerInfo))) and ` +
        // `(substringof('"operationid":"${operationId}"',tolower(headerInfo)) or ` +
        // `substringof('"operation-id":"${operationId}"',tolower(headerInfo)) or ` +
        // `substringof('"operation_id":"${operationId}"',tolower(headerInfo))))` +
        "&$orderby=version desc&$top=1"
      //PTEN
      return submissionQueryOptions;
    } catch (error) {
      const errorInfo = "Exception attempting to display NativeScript-based dialog"
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      throw error
    }
  }

  /**
   * Retrieves the latest form submission data associated with a form-enabled
   * operation.
   *
   * If the context passed to this function is not bound to the target work
   * order operation, a custom binding object can be passed to this function
   * as a parameter, which must have the following properties:
   * - OrderId: The work order ID (string)
   * - OperationNo: The operation number (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<Object|undefined>} - The latest form submission data if
   *    found, otherwise undefined
   * @throws {Error} - If there is an error retrieving the form submission data
   */
  static async getLatestFormSubmissionForOperation(context, customBinding = null) {
    try {
      const submissionQueryOptions = await this.getFormSubmissionQueryOptionsForFormEnabledOperation(context, customBinding)
      const queryResult = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "Submissions", [], submissionQueryOptions)
      if (queryResult && queryResult.getItem(0)) {
        // Form submission data is stored as a string in the OData data source
        return JSON.parse(queryResult.getItem(0)["submission"])
      }
      return undefined
    } catch (error) {
      const errorInfo = "Exception querying latest submission for operation from entity set"
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      throw error
    }
  }

  /**
   * Retrieves the latest form submission entity for a form-enabled operation.
   *
   * If the context passed to this function is not bound to the target work
   * order operation, a custom binding object can be passed to this function
   * as a parameter, which must have the following properties:
   * - OrderId: The work order ID (string)
   * - OperationNo: The operation number (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<Object|undefined>} - The latest form submission entity if
   *    found, otherwise undefined
   * @throws {Error} - If there is an error retrieving the form submission entity
   */
  static async getLatestFormSubmissionEntityForOperation(context, customBinding = null) {
    try {
      const submissionQueryOptions = await this.getFormSubmissionQueryOptionsForFormEnabledOperation(context, customBinding);
      const queryResult = await context.read("/MirataFormsCoreComponents/Services/MirataAPI.service", "Submissions", [], submissionQueryOptions)
      if (queryResult && queryResult.getItem(0)) {
        return queryResult.getItem(0)
      }
      return undefined;
    } catch (error) {
      const errorInfo = "Exception querying latest submission for operation from entity set"
      await LogError(context, error, { component: this.component, mdkInfo: { errorInfo } } )
      throw error
    }
  }

  /**
   * Retrieves the status of the latest form submission for a form-enabled
   * operation.
   *
   * If the context passed to this function is not bound to the target work
   * order operation, a custom binding object can be passed to this function
   * as a parameter, which must have the following properties:
   * - OrderId: The work order ID (string)
   * - OperationNo: The operation number (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<string|undefined>} - The status of the latest form
   *    submission if found, otherwise undefined
   * @throws {Error} - If there is an error retrieving the form submission status
   */
  static async getLatestFormSubmissionStatusForOperation(context, customBinding = null) {
    const submission = await this.getLatestFormSubmissionForOperation(context, customBinding)
    if (submission) {
      return submission.status
    }
    return undefined;
  }

  /**
   * Determines if the latest form submission for a form-enabled operation is
   * marked as "mobile complete".
   *
   * If the context passed to this function is not bound to the target work
   * order operation, a custom binding object can be passed to this function
   * as a parameter, which must have the following properties:
   * - OrderId: The work order ID (string)
   * - OperationNo: The operation number (string)
   *
   * @param {IClientAPI} context - The client context object
   * @param {Object} customBinding - (Optional) The custom binding object to use
   *    instead of the context binding
   * @returns {Promise<boolean>} - True if the latest form submission is marked as
   *    "mobile complete", false otherwise
   * @throws {Error} - If there is an error retrieving the form submission
   */
  static async isLatestFormSubmissionMobileCompleteForOperation(context, customBinding = null) {
    const submission = await this.getLatestFormSubmissionForOperation(context, customBinding);
    if (submission) {
      const isMobileComplete = submission["mobile-complete"]
      return (isMobileComplete === true);
    }
    return false;
  }
}
