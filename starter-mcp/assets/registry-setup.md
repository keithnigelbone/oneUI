# Connecting to the JDS / OneUI private feed

> **This is the first and most important step.** The `@jds4/*` packages
> (`@jds4/oneui-react`, `@jds4/oneui-icons-jio`, the bundler plugins) are NOT on
> public npm. They live on a **private Azure DevOps Artifacts feed**. Until the
> machine is connected to that feed, `npm install @jds4/oneui-react` fails with a
> 401/404. Run this check BEFORE `setup_oneui_project` or any install.

## Feed identity

| Field | Value |
|---|---|
| Feed name | `JIO-DS-ONE-UI` |
| Organisation | `jio-dsp` |
| Registry URL | `https://jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/registry/` |
| Connect page | `https://jio-dsp.visualstudio.com/DS-Assets/_artifacts/feed/JIO-DS-ONE-UI/connect` |
| Create a PAT | `https://jio-dsp.visualstudio.com/_usersSettings/tokens` |

> **Two host forms (both kept as backup):**
> - **Primary:** `jio-dsp.pkgs.visualstudio.com` — the form the feed's own "Connect to feed" page generates.
> - **Backup:** `pkgs.dev.azure.com/JIO-DSP` — equivalent modern Azure host.
>
> The generated project `.npmrc` uses the primary host, with the backup included as a
> commented line you can swap to if the primary 401s/404s. The user `~/.npmrc` auth block
> includes credentials for **both** hosts — npm only applies the auth matching the active
> `registry=` host, so listing both is harmless and means either form works without re-editing.
> The one rule: the active `registry=` line and its `:_password=` auth lines must share the
> same host.

## Step 0 — Access gate (ask the user)

**Ask the user: "Can you open the feed connect page? → `https://jio-dsp.visualstudio.com/DS-Assets/_artifacts/feed/JIO-DS-ONE-UI/connect`"**

- **Cannot open it / access denied** → the user has **no JDS access at all**. Stop here.
  They must request access to the `JIO-DS-ONE-UI` feed from the DS / platform team
  (onboarding). No amount of `.npmrc` setup will work without feed access.
- **Can open it** → continue below.

## The three situations

Determine which one applies by checking the project `./.npmrc` and the user `~/.npmrc`
(the `check_oneui_registry` tool does this automatically and tells you the status).

### A. Already connected (`status: connected`)
The feed registry is configured and a real auth token is present. Nothing to do —
proceed to `setup_oneui_project` / installing packages.

### B. Project set up but new to JDS, or registry set without a token (`status: registry-no-auth` / `not-configured`)
The project may already exist; it just isn't wired to the JDS feed. Do this:

1. **Write the project `./.npmrc`** (registry + flags — no secret; backup host commented):
   ```
   registry=https://jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/registry/
   always-auth=true
   legacy-peer-deps=true

   ; Backup host — uncomment this and comment the line above if the primary fails:
   ; registry=https://pkgs.dev.azure.com/JIO-DSP/_packaging/JIO-DS-ONE-UI/npm/registry/
   ```
2. **Add the auth token to your USER `~/.npmrc`** (this is where the secret lives, so it
   never gets committed). It carries auth for BOTH host forms as a backup — npm only uses
   the one matching your active `registry=`. Copy this block in, then replace **all four**
   `[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]` values with your Base64 PAT:
   ```
   ; begin auth token
   ; --- primary host (jio-dsp.pkgs.visualstudio.com) ---
   //jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/registry/:username=JIO-DSP
   //jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/registry/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
   //jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/registry/:email=npm requires email to be set but doesn't use the value
   //jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/:username=JIO-DSP
   //jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
   //jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-ONE-UI/npm/:email=npm requires email to be set but doesn't use the value
   ; --- backup host (pkgs.dev.azure.com/JIO-DSP) ---
   //pkgs.dev.azure.com/JIO-DSP/_packaging/JIO-DS-ONE-UI/npm/registry/:username=JIO-DSP
   //pkgs.dev.azure.com/JIO-DSP/_packaging/JIO-DS-ONE-UI/npm/registry/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
   //pkgs.dev.azure.com/JIO-DSP/_packaging/JIO-DS-ONE-UI/npm/registry/:email=npm requires email to be set but doesn't use the value
   //pkgs.dev.azure.com/JIO-DSP/_packaging/JIO-DS-ONE-UI/npm/:username=JIO-DSP
   //pkgs.dev.azure.com/JIO-DSP/_packaging/JIO-DS-ONE-UI/npm/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
   //pkgs.dev.azure.com/JIO-DSP/_packaging/JIO-DS-ONE-UI/npm/:email=npm requires email to be set but doesn't use the value
   ; end auth token
   ```
3. **Create + encode the PAT** (see "Creating a Personal Access Token" below).
4. Re-run the registry check / install. A `401 Unauthorized` later just means the token
   expired — regenerate and repeat.

### C. Brand-new user, nothing set up (`status: not-configured`)
Same as B, plus: create the project first (`setup_oneui_project` handles framework
detection). The agent SHOULD write the project `./.npmrc` from the values above, then
ask the user to create the PAT and add the auth block to `~/.npmrc`. Do not install
packages until the token is in place.

## Creating a Personal Access Token (PAT)

1. Go to **`https://jio-dsp.visualstudio.com/_usersSettings/tokens`**.
2. Create a token with **Packaging → Read & write** scope.
3. **Base64-encode** the token.

   **macOS / Linux** — safe method (no shell history):
   ```
   node -e "require('readline').createInterface({input:process.stdin,output:process.stdout,historySize:0}).question('PAT> ',p => { b64=Buffer.from(p.trim()).toString('base64');console.log(b64);process.exit(); })"
   ```
   Paste the PAT, press Enter, copy the Base64 output.

   **Windows** — instead of hand-editing, you can run:
   ```
   vsts-npm-auth -config .npmrc
   ```
   This adds an Azure Artifacts token to your user-level `~/.npmrc` automatically. You
   don't need to re-run it every time — only when npm returns `401 Unauthorized`.
4. Replace **both** `[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]` values in `~/.npmrc` with the
   Base64 string from step 3.

## Installing the packages (once connected) — get the NEWEST version

The `latest` dist-tag can lag behind the newest alpha (it pointed at `0.1.0-alpha.0` while
`alpha.5` was newest). So **do NOT** rely on a bare `npm install @jds4/oneui-react` or `@latest`.
Resolve the highest published version from the full versions list and pin it:

```bash
# 1. List all published versions (highest semver wins, incl. prereleases)
npm view @jds4/oneui-react versions --json     # → […, "0.1.0-alpha.5"]
# 2. Install that exact version; resolve each package independently
npm install @jds4/oneui-react@0.1.0-alpha.5 @jds4/oneui-icons-jio@0.1.0-alpha.5
npm install -D @jds4/oneui-vite-plugin@<its-newest>   # (or webpack/next/esbuild plugin)
```

Or just call the MCP's `setup_oneui_project` (or `update_oneui_packages`) — it does exactly
this: resolves each package's highest published version and installs it pinned.

## Security rules (for the agent)

- **NEVER** write, echo, log, or commit a real PAT. The token lives only in the user's
  `~/.npmrc`, added by the user.
- Only ever write the project `./.npmrc` (registry + flags) — it contains no secret.
- When showing the auth block, always use the `[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]`
  placeholder; ask the user to substitute their own token.
- If you write a project `./.npmrc`, also ensure `.npmrc` is in `.gitignore` if a token
  could ever end up there.
