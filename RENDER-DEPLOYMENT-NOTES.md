# Render deployment notes — LAMPOON Role & Lane Bot

## What changed
- `/health` now returns structured diagnostics while keeping HTTP 200 when the web process is alive. This avoids treating a temporary Discord reconnect as a web-process liveness failure.
- `/health/ready` returns HTTP 503 until Discord is connected and all startup tasks (slash-command registration and the three panels) have succeeded.
- Startup tasks are tracked independently. A failure updating one panel no longer prevents the remaining startup tasks from running.
- Added Discord client/shard connection logs, interaction receipt logs, interaction duration/acknowledgement error details, and process-level failure logs.
- The Content Creator type button now defers its ephemeral reply before role assignment API calls, then edits that reply. This addresses a likely source of Discord `Unknown interaction` errors.
- Existing command definitions, role/lane selection logic, giveaway expiration logic, and panel builders are preserved.

## Deploy
1. Replace the project files in your existing Render-connected repository with these files and commit/push, or use the ZIP in your normal repository workflow.
2. Keep the existing environment variables configured in Render. Do not add a `.env` file to source control.
3. Confirm the Render start command is `npm start`.
4. Keep Render's health-check path set to `/health` if you use one. `/health` intentionally remains HTTP 200 when the web server is alive and reports bot readiness in JSON. Use `/health/ready` only if you explicitly want a strict readiness endpoint that returns 503 during startup, disconnects, or failed startup tasks.
5. After deployment, open `https://YOUR-SERVICE.onrender.com/health` and inspect:
   - `status`: `healthy` or `degraded`
   - `discord`: `connected` or `disconnected`
   - `startup.tasks`: each task should be `ok`
   - `diagnostics.interactionsSeen`: should increase when a user clicks a component or runs a command
   - `diagnostics.lastInteractionError`: records the last error code/name if an interaction failed

## If the bot is online but commands/buttons still fail
- If `interactionsSeen` does not increase, verify the command/button is from this bot, that the app is installed in the server, and that Discord interactions are reaching the current deployment.
- If `interactionsSeen` increases, inspect Render logs for `Interaction received`, `Interaction failed`, and the `elapsedMs` / `acknowledged` details.
- For role assignment failures, check the bot has **Manage Roles** permission and that its highest role is above every role it must grant/remove.
- Do not paste your bot token into logs, screenshots, or public issue reports.
