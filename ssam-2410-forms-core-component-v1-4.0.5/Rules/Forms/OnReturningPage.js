import OnResumePage from "./OnResumePage"

/**
 * Handles MDK Page OnReturning events when a Mirata Form is redisplayed by executing
 * the form's refresh transition to update form data that may have changed while
 * the app was in the background.
 *
 * @param {ClientAPI} context - The MDK rule context object
 * @returns {Promise<void>} Promise that resolves when the refresh transition is complete
 *
 * @description
 * This rule is triggered when a page containing the Mirata Forms MDK Extension Control
 * is redisplayed (e.g., returning from another page through backward navigation or
 * the closing of a modal page). It performs the following actions:
 *
 * 1. Checks if the page contains a Mirata form extension control
 * 2. If found, executes the "execute-refresh-transition" command to refresh form data
 * 3. The refresh transition will update any data that may have changed externally
 * 4. If no form extension control is present, no action is taken
 *
 * This ensures that form data remains current when users return to the form
 * after potentially data-changing activities in other applications.
 */
export default function OnReturningPage(context) {
    // The OnResume event handler does everything we need, so we can just call it.
    // The result of the command execution is not reviewed because transition
    // execution errors are handled and reported by the Mirata Forms MDK Extension
    // Control.
    OnResumePage(context)
}
