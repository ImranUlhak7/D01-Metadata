/**
 * Get the form Input Parameters that are passed from the Integration Action
 * in the Mirata Forms UX.
 *
 * @param {Object} formContext - The context object containing the operation details.
 *                              
 * @returns {Object} An object containing the form parameters.
 */
export default function ZGetFormParameters(formContext) {
	const clientData = formContext.getClientData();
    if (!clientData) {
        throw new Error('Client data is not available in the form context.');
    }

    const formParameters = clientData.MirataFormsData.FormRuleInputData;
    if (!formParameters) {
        throw new Error('Form parameters are not available in the client data.');
    }

    return formParameters;
}