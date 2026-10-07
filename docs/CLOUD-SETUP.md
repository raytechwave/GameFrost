# Cloud environment setup record

The requested `cloud-environment-onboarding:setup` skill was used. The environment draft now saves a pinned, frozen pnpm 11.25.0 install and `npm run prepare:local`, plus startup instructions for the existing `/workspace/GameFrost` checkout. No secrets or additional network domains were requested. Saving a draft does not apply it or publish the environment.

Review and save the changes in environment settings, then publish **the environment** if you want to retain that configuration. This does not publish or replace the GAME FROST website.

Current-instance checks: Node 24.19.0, frozen package installation, both production builds, local migrations, repeat migration with nothing to apply, development HTTP 200 for `/`, `/shop`, `/api/content` and `/api/store?view=cart`, prebuilt launcher, and independent extracted-source reinstall/rebuild. Local content/cart APIs use the same D1 persistence folder as the dev server. Read the main QA report for application checks.

The selected GitHub repository was empty with an unborn local branch when inspected. The uploaded source was imported into this workspace; no source was pushed remotely. A new task restoring the uploaded/untracked files from an environment snapshot has not been verified. Keep the source ZIP as the recovery copy and import it if a future checkout is empty. The saved setup script stops with a clear error if the source/lockfile is absent.

Each cloud task is isolated already. Reuse the current checkout; do not create a Git worktree unless explicitly requested. Local mock sign-in is not the production owner identity. The owner test harness is loopback-only and must never be deployed.
