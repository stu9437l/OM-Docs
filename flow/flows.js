/* Operations Manager module flows.

   Structure: MODULES -> views (sub-tabs) -> nodes / layout / edges.
   A module with a single view shows no sub-tab bar.

   node.kind   start | action | system | decision | exception | exit
   node.jump   "moduleId" or "moduleId:viewId" — renders a jump button
   node.flag   "unverified" — label or behaviour not confirmed in documentation

   Grounded in the OM Confluence documentation, the QC navigation walk, and the
   current front-end navigation. All identifiers shown are placeholders. */

const MODULES = [
  /* ============================ MODULE MAP ============================ */
  {
    id: "map",
    tab: "Module map",
    views: [
      {
        id: "map",
        tab: "Connections",
        title: "How the modules connect",
        route: "OM shell",
        summary:
          "Login leads to the dashboard, setup modules define the data, intake modules bring files in, and the processing ticket then drives execution and reporting. Click a module, then use its button to open that module's own flow.",
        nodes: [
          { id: "login", kind: "start", title: "Login", meta: "CAS authentication", jump: "login", detail: "Authenticates the user and resolves the role, which decides which modules and actions are visible." },
          { id: "home", kind: "action", title: "Home Dashboard", meta: "Release trackers and ticket search", jump: "home", detail: "Two surfaces: monthly release trackers, and a search that reaches active and archived tickets." },
          { id: "admin", kind: "system", title: "Admin", meta: "Global configuration", jump: "admin", detail: "Teams, SLA defaults, Daily IQR thresholds, products, phase groups, phases, versions, and servers." },
          { id: "accounts", kind: "action", title: "Accounts", meta: "Client configuration", jump: "accounts", detail: "Accounts and applications, then the product-frequency settings that decide how tickets behave — including the Autopilot flag." },
          { id: "jobs", kind: "action", title: "Jobs", meta: "Automation setup and status", jump: "jobs", detail: "File-triggered and phase-triggered jobs, plus execution status and failure recovery." },
          { id: "files", kind: "action", title: "File Management", meta: "File Inventory lifecycle", jump: "files", detail: "Files land in Inventory via S3 job path rules, move through Staged Implementation/Production, Unstaged, and Missed tabs, then unstage onto a processing ticket." },
          { id: "production", kind: "action", title: "Production Manager", meta: "Tickets, Phase Tracker, Autopilot", jump: "production", detail: "The centre of the lifecycle. Creates and tracks processing tickets; Phase Tracker is the per-ticket work surface and Autopilot is its automated equivalent." },
          { id: "processing", kind: "system", title: "Processing Dashboard", meta: "Execution, Daily IQR, JetStore", jump: "processing", detail: "Cluster and step-level execution monitoring, Daily IQR / File Change Reports, JetStore Test Harness for Implementation tickets, and ticket-independent CA processing." },
          { id: "blinding", kind: "system", title: "Blinding Status", meta: "Blinding runs", jump: "blinding", detail: "Completed, Failed, and Running blinding jobs used by documented implementation flows." },
          { id: "reports", kind: "exit", title: "Reports", meta: "Quality and release output", jump: "reports", detail: "Quality, variance, release, billing, snapshot, and effort reporting." },
          { id: "sla", kind: "exit", title: "SLA Report", meta: "Service levels", jump: "sla", detail: "Client, product, delivery, legal, and onboarding SLA views, plus the configuration they measure against." },
        ],
        layout: {
          login: [1, 3], home: [2, 3], admin: [3, 1], accounts: [3, 3], jobs: [4, 2],
          production: [4, 4], files: [5, 1], processing: [5, 3], blinding: [5, 5],
          reports: [6, 2], sla: [6, 4],
        },
        edges: [
          ["login", "home"], ["home", "admin"], ["home", "accounts"], ["home", "production"],
          ["admin", "accounts", "configures"], ["accounts", "jobs"], ["accounts", "production"],
          ["jobs", "files", "arranges"], ["jobs", "blinding"], ["files", "production", "unblocks"],
          ["production", "processing", "executes"], ["processing", "reports"], ["production", "sla"],
        ],
      },
    ],
  },

  /* ============================== LOGIN ============================== */
  {
    id: "login",
    tab: "1 · Login",
    views: [
      {
        id: "signon",
        tab: "Sign-on",
        title: "Login to Operations Manager",
        route: "https://om.qc.cgt.us/ · https://om.uat.cgt.us/ · https://om.cgt.us/",
        summary:
          "Every session starts at an environment URL and ends on a role-based landing page. The role resolved here decides which modules appear and which actions inside them are permitted.",
        nodes: [
          { id: "url", kind: "start", title: "Open the OM environment URL", meta: "QC · UAT · PROD", detail: "QC https://om.qc.cgt.us/ · UAT https://om.uat.cgt.us/ · PROD https://om.cgt.us/. The environments hold separate configuration and separate data, so results are not comparable across them." },
          { id: "env", kind: "action", title: "Confirm the environment before signing in", meta: "Check the host name", detail: "A surprising number of failed test steps are simply the wrong environment." },
          { id: "cas", kind: "system", title: "Unauthenticated request redirects to CAS", meta: "Central sign-on", detail: "OM delegates authentication rather than holding credentials itself, so the login form is not an OM page." },
          { id: "creds", kind: "action", title: "Submit username and password", meta: "Assigned test persona", detail: "Use the persona the test calls for. Never paste real passwords into test evidence, tickets, or chat." },
          { id: "persona", kind: "action", title: "The persona decides what is testable", meta: "Processing, Admin, CPM, SPT, and others", detail: "A step that looks broken is often a permission boundary. Confirm the persona before logging a defect." },
          { id: "auth", kind: "decision", title: "CAS validates the credentials", meta: "Accepted or rejected", detail: "Success continues to session setup; failure returns to the CAS form with no OM session created." },
          { id: "reject", kind: "exception", title: "Sign-in rejected", meta: "Retry or request access", detail: "Repeated failures usually mean the wrong environment, an expired account, or a missing OM role." },
          { id: "session", kind: "system", title: "Session established and token returned", meta: "OM accepts the assertion", detail: "OM now trusts the identity and starts building the authorised view." },
          { id: "timeout", kind: "exception", title: "Session expires or is signed out", meta: "Back to CAS", detail: "A mid-test redirect to CAS normally means the session lapsed rather than an application error." },
          { id: "roles", kind: "system", title: "Role and permission set resolved", meta: "Module and action visibility", detail: "Roles control both which modules appear and which write actions are allowed inside them." },
          { id: "nav", kind: "system", title: "Navigation is built for that role", meta: "Sidebar and legacy top nav", detail: "OM presents both a sidebar and a legacy top navigation; some screens exist only as deep links." },
          { id: "home", kind: "exit", title: "Land on the role-based home page", meta: "Continue to Home Dashboard", jump: "home", detail: "Most personas land on a dashboard or production view matching their responsibilities." },
        ],
        layout: {
          url: [1, 1], env: [1, 2], cas: [2, 1], creds: [3, 1], persona: [3, 2],
          auth: [4, 1], reject: [4, 2], timeout: [4, 3], session: [5, 1], roles: [5, 2],
          nav: [5, 3], home: [5, 4],
        },
        edges: [
          ["url", "env"], ["env", "cas"], ["cas", "creds"], ["creds", "persona"],
          ["creds", "auth"], ["auth", "reject", "fail"], ["auth", "session", "pass"],
          ["session", "roles"], ["roles", "nav"], ["nav", "home"], ["session", "timeout"],
        ],
      },
    ],
  },

  /* ========================== HOME DASHBOARD ========================== */
  {
    id: "home",
    tab: "2 · Home Dashboard",
    views: [
      {
        id: "trackers",
        tab: "Release trackers",
        title: "Home Dashboard — release trackers",
        route: "/",
        summary:
          "The trackers answer one question: are maintenance releases on track this month? Counts are grouped by frequency, and each count opens the tickets behind it.",
        nodes: [
          { id: "open", kind: "start", title: "Open Home Dashboard", meta: "Default landing page", detail: "Whether the dashboard is the landing page at all depends on the role." },
          { id: "role", kind: "decision", title: "Role decides the landing page", meta: "Dashboard or primary module", detail: "Personas without dashboard access start in Production Manager or their own module instead." },
          { id: "prev", kind: "system", title: "Previous Month Release Tracker", meta: "Closed period", detail: "Used for retrospective review: what was missed and what was recovered late." },
          { id: "curr", kind: "system", title: "Current Month Release Tracker", meta: "Live period", detail: "The operational view — the counts here change as tickets progress through the month." },
          { id: "freq", kind: "action", title: "Toggle the frequency", meta: "Quarterly, Monthly, Biweekly, Weekly", detail: "Each frequency carries its own release expectations, so counts are only meaningful per frequency." },
          { id: "counts", kind: "system", title: "Counts recalculate for that frequency", meta: "Tracker refresh", detail: "The tracker recounts against the release dates configured for the selected frequency." },
          { id: "segments", kind: "decision", title: "Completed, Missed, or To be completed", meta: "Three segments", detail: "Missed is the escalation signal: the committed release date has already passed." },
          { id: "missed", kind: "exception", title: "Missed release", meta: "Escalation path", detail: "A missed release usually pairs with an SLA breach and needs a documented reason on the ticket." },
          { id: "drill", kind: "action", title: "Drill into a count", meta: "Ticket list", detail: "The count is a link; opening it lists the individual tickets making up that number." },
          { id: "list", kind: "system", title: "Ticket list with dates and context", meta: "Scheduled, release, phase, days left, comment", detail: "Enough context to triage without opening every ticket." },
          { id: "phase", kind: "exit", title: "Open Phase Tracker for a ticket", meta: "Continue in Production Manager", jump: "production:phase", detail: "Phase Tracker is reached by deep link from a ticket row, never from the sidebar." },
        ],
        layout: {
          open: [1, 1], role: [1, 2], prev: [2, 1], curr: [2, 2], freq: [3, 1],
          counts: [3, 2], segments: [4, 1], drill: [4, 2], missed: [5, 1], list: [5, 2], phase: [5, 3],
        },
        edges: [
          ["open", "role"], ["role", "prev"], ["role", "curr"], ["prev", "freq"], ["curr", "freq"],
          ["freq", "counts"], ["counts", "segments"], ["segments", "missed", "missed"],
          ["segments", "drill"], ["drill", "list"], ["missed", "list"], ["list", "phase"],
        ],
      },
      {
        id: "search",
        tab: "Ticket search & status",
        title: "Home Dashboard — search and latest status",
        route: "/",
        summary:
          "The search panel is the fastest way to find any ticket, including archived ones. The Latest Ticket Status panel is the same information grouped by phase instead.",
        nodes: [
          { id: "open", kind: "start", title: "Open the Search panel", meta: "Shared with Production Manager", detail: "The same search backs the assignments view, so results are consistent between the two." },
          { id: "status", kind: "start", title: "Latest Ticket Status panel", meta: "Second entry point", detail: "Groups current maintenance tickets by the phase they are sitting in right now." },
          { id: "filters", kind: "action", title: "Set filters — all optional", meta: "Account, application, product, type", detail: "Because nothing is mandatory, a broad search works when only part of the ticket name is known." },
          { id: "dates", kind: "action", title: "Add a date range", meta: "Scheduled or release dates", detail: "Narrowing by date is the practical way to keep a broad search usable." },
          { id: "archived", kind: "action", title: "Include archived tickets", meta: "History stays searchable", detail: "Archiving hides a ticket from active lists but keeps it and its audit history retrievable." },
          { id: "run", kind: "action", title: "Run the search", meta: "Submit", detail: "Results are still scoped by what the signed-in role is allowed to see." },
          { id: "results", kind: "system", title: "Result grid returned", meta: "Client, product, ticket, phase, dates, comment", detail: "Each row carries enough context to decide whether it is the ticket you wanted." },
          { id: "empty", kind: "exception", title: "No matching tickets", meta: "Widen or check access", detail: "An empty result is ambiguous: it can mean no such ticket, or no permission to see it." },
          { id: "export", kind: "action", title: "Export the result set", meta: "Download", detail: "Treat exports as sensitive; keep client identifiers out of test artefacts." },
          { id: "row", kind: "action", title: "Open a ticket row", meta: "Deep link", detail: "The row links straight to the ticket rather than to a filtered module list." },
          { id: "phase", kind: "exit", title: "Phase Tracker opens", meta: "Continue in Production Manager", jump: "production:phase", detail: "This is the normal route into per-ticket work from the dashboard." },
        ],
        layout: {
          open: [1, 1], status: [1, 3], filters: [2, 1], dates: [2, 2], archived: [3, 2],
          run: [3, 1], results: [4, 1], empty: [4, 2], export: [5, 1], row: [5, 2], phase: [5, 3],
        },
        edges: [
          ["open", "filters"], ["filters", "dates"], ["filters", "archived"], ["dates", "run"],
          ["archived", "run"], ["run", "results"], ["run", "empty", "no match"],
          ["results", "export"], ["results", "row"], ["status", "row"], ["row", "phase"],
        ],
      },
    ],
  },

  /* ======================== PRODUCTION MANAGER ======================== */
  {
    id: "production",
    tab: "3 · Production Manager",
    views: [
      {
        id: "tickets",
        tab: "Tickets & assignments",
        title: "Production Manager — tickets and assignments",
        route: "/productionManager/index",
        summary:
          "Where a processing ticket comes into existence, either from the calendar automation or by hand, and where it is found again afterwards. Assignment rules decide the starting phase and the owner.",
        nodes: [
          { id: "open", kind: "start", title: "Open Production Manager", meta: "Assignments or ticket list", detail: "Assignments is the personal queue; Processing Tickets is the full list for active clients." },
          { id: "calendar", kind: "start", title: "Calendar automation creates a ticket", meta: "Second entry point, maintenance only", detail: "Scheduled events create maintenance tickets, including linked product tickets, with nobody opening the module." },
          { id: "assign", kind: "action", title: "Assignments tabs", meta: "Daily, Pending, Running, PAE, Recent", detail: "Tabs group open work by phase, recency, and product. PAE Tickets lists Plan Analytics Extract tickets assigned to the selected user, in any phase — they can also still appear in Daily, Pending, or Running." },
          { id: "tickets", kind: "action", title: "Processing Tickets", meta: "Development and Production", detail: "Development lists implementation tickets; Production lists maintenance tickets." },
          { id: "filter", kind: "action", title: "Filter and search the list", meta: "Same search as the dashboard", detail: "Account, application, product, type, and dates — all optional." },
          { id: "create", kind: "action", title: "Create Processing", meta: "Manual creation", detail: "Used for implementation work and for maintenance the calendar did not raise." },
          { id: "form", kind: "action", title: "Select account, application, product, frequency", meta: "Scope of the ticket", detail: "The product-frequency pair chosen here pulls in its configured processing behaviour." },
          { id: "category", kind: "action", title: "Set category and ticket type", meta: "Regular, Incremental, Bulk Incremental", detail: "Type is Implementation or Maintenance; category decides how much data the run covers." },
          { id: "version", kind: "system", title: "Compatible versions offered", meta: "From Version Management", jump: "admin:infra", detail: "Only combinations registered as compatible in Admin are selectable here." },
          { id: "rules", kind: "decision", title: "Assignment rules evaluated", meta: "DPCC, running ticket, Autopilot", detail: "These conditions decide the starting phase and whether the owner is a person or the automation user." },
          { id: "dupe", kind: "exception", title: "A running ticket blocks a new one", meta: "Duplicate guard", detail: "Prevents two concurrent runs for the same product-frequency pair." },
          { id: "created", kind: "system", title: "Ticket created and assigned", meta: "Phase group attached", detail: "The ticket now has a phase sequence taken from the product's configured phase group." },
          { id: "auto", kind: "exit", title: "Autopilot-eligible tickets diverge here", meta: "See the Autopilot processing view", jump: "production:autopilot", detail: "Eligible tickets go to the automated user and advance without manual phase actions." },
          { id: "phase", kind: "exit", title: "Phase Tracker opens", meta: "Deep link by processing ID", jump: "production:phase", detail: "Always entered from a ticket row or a report drilldown, never from the sidebar." },
          { id: "archive", kind: "action", title: "Archive completed tickets", meta: "Hidden, not deleted", detail: "Archiving sets a flag; the ticket and its history stay available to search and audit." },
        ],
        layout: {
          open: [1, 1], calendar: [1, 2], assign: [2, 1], tickets: [2, 2], filter: [2, 3],
          create: [3, 1], form: [3, 2], category: [3, 3], rules: [4, 1], version: [4, 2],
          dupe: [4, 3], created: [5, 1], phase: [5, 2], auto: [5, 3], archive: [5, 4],
        },
        edges: [
          ["open", "assign"], ["open", "tickets"], ["open", "filter"], ["calendar", "rules"],
          ["tickets", "create"], ["create", "form"], ["form", "category"], ["category", "version"],
          ["category", "rules"], ["version", "created"], ["rules", "dupe", "blocked"],
          ["rules", "created"], ["created", "phase", "manual"], ["created", "auto", "autopilot"],
          ["assign", "phase"], ["filter", "archive"],
        ],
      },
      {
        id: "phase",
        tab: "Phase Tracker",
        title: "Production Manager — Phase Tracker",
        route: "/productionManager/index (deep link by processing ID)",
        summary:
          "The per-ticket work surface. The phase sequence comes from configuration rather than a fixed list, and every advance, comment, and file link is audited.",
        nodes: [
          { id: "entry", kind: "start", title: "Phase Tracker opens by deep link", meta: "No sidebar entry", detail: "Reached from a ticket row, a dashboard count, a report drilldown, or an SLA breach." },
          { id: "header", kind: "system", title: "Ticket header loads", meta: "Account, product, frequency, dates, version", detail: "Confirms which run you are looking at before any action is taken." },
          { id: "phases", kind: "system", title: "Phase list renders from the phase group", meta: "Configured, not hardcoded", jump: "admin:products", detail: "Phase names and order differ by product because they come from Product Management." },
          { id: "current", kind: "system", title: "Current phase and assignee shown", meta: "Where the ticket actually is", detail: "The current phase is the single most useful field on the screen." },
          { id: "files", kind: "action", title: "Unstage or attach the required files", meta: "From File Inventory", jump: "files:unstaging", detail: "A required file that has not arrived is the most common reason a phase cannot advance. Unstaging links Staged Production files to the ticket." },
          { id: "act", kind: "action", title: "Work the phase and record a comment", meta: "Audited history", detail: "The comment is what the dashboard and reports surface later, so it carries operational weight." },
          { id: "auto", kind: "exit", title: "Autopilot advances phases without a user", meta: "Automated equivalent of this screen", jump: "production:autopilot", detail: "On Autopilot-enabled configurations the same phases progress under the automation user." },
          { id: "jobs", kind: "system", title: "Phase-triggered jobs launch", meta: "Configured in Jobs", jump: "jobs:manage", detail: "Entering a phase can start processing automatically rather than waiting for an operator." },
          { id: "validate", kind: "decision", title: "Are the completion criteria met?", meta: "Files, jobs, approvals", detail: "The guard that stops a ticket moving forward on incomplete work." },
          { id: "hold", kind: "exception", title: "Placed on hold or rolled back", meta: "Documented reason", detail: "A hold keeps the ticket visible and countable rather than quietly stalled." },
          { id: "advance", kind: "system", title: "Phase advances, history is written", meta: "Who, what, when", detail: "The audit trail is the evidence base for both QA and client questions." },
          { id: "release", kind: "system", title: "Release phase reached", meta: "Production, Extract, or Scrub Release", detail: "Release can also update linked extract tickets rather than only this one." },
          { id: "next", kind: "exit", title: "Notifications and downstream reporting", meta: "Reports and SLA", jump: "reports:run", detail: "Release dates feed quality reporting and SLA measurement." },
        ],
        layout: {
          entry: [1, 1], header: [1, 2], phases: [2, 1], current: [2, 2], files: [3, 1],
          act: [3, 2], auto: [3, 3], jobs: [4, 1], validate: [4, 2], hold: [4, 3],
          advance: [5, 1], release: [5, 2], next: [5, 3],
        },
        edges: [
          ["entry", "header"], ["header", "phases"], ["phases", "current"], ["current", "files"],
          ["current", "act"], ["current", "auto", "automated"], ["files", "jobs"],
          ["act", "validate"], ["validate", "hold", "not met"], ["validate", "advance", "met"],
          ["jobs", "advance"], ["hold", "advance", "after fix"], ["advance", "release"], ["release", "next"],
        ],
      },
      {
        id: "autopilot",
        tab: "Autopilot overview",
        title: "Autopilot Processing — overview (Confluence parent)",
        route: "https://confluence.cgt.us/pages/viewpage.action?pageId=3156018174",
        summary:
          "From the Autopilot Processing Parent Page: a product-frequency flag in Accounts, actions by Autopilot User, a global on/off config, and three product flows — HBA (PA), CM (with HP), and CMA. Open a child tab for the phase-by-phase diagram.",
        nodes: [
          { id: "flag", kind: "start", title: "Autopilot Processing flag = Yes", meta: "Accounts → Application → Product → Frequency", jump: "accounts:frequency", detail: "Default is No. Only Account-Application-Product-Frequency combinations set to Yes run through Autopilot." },
          { id: "global", kind: "decision", title: "Global Autopilot config enabled?", meta: "All-clients kill switch", detail: "A separate config can enable or disable the whole Autopilot flow for ALL clients." },
          { id: "off", kind: "exception", title: "Global Autopilot disabled", meta: "No automated phase actions", detail: "Tickets still exist; they are worked manually in Phase Tracker." },
          { id: "actor", kind: "system", title: "Every action is by Autopilot User", meta: "Required assignee", detail: "Phase + Autopilot User together are the trigger. Assigning Production CPM (or any other user) does not run Autopilot even if the flag is Yes." },
          { id: "create", kind: "action", title: "Ticket created", meta: "Calendar event or manual Create Processing", detail: "Calendar and manual tickets both qualify when the product-frequency flag is Yes." },
          { id: "manual", kind: "action", title: "Manual start / resume", meta: "Set phase + assign Autopilot User", detail: "To start or resume from a phase after failure: update the phase and assign Autopilot User. Example: Waiting for Files → File Unstaging + Autopilot User resumes from File Unstaging." },
          { id: "hold", kind: "exception", title: "On Hold or Closed blocks start", meta: "HBA / CM documented guards", detail: "If the ticket is On Hold (assignee ≠ Autopilot User) or Closed before initiation, it is excluded from Autopilot even when the flag is Yes." },
          { id: "hba", kind: "exit", title: "HBA Autopilot (PA product)", meta: "Waiting → … → Scrubbing / App Processing", jump: "production:autopilot-hba", detail: "Non-parent: Waiting → File Arrangement → File Unstaging → Scrub Request → Scrubbing. Parent: Application Processing Request → Application Processing." },
          { id: "cm", kind: "exit", title: "CM Autopilot (Daily) + HP", meta: "Parent / child / non-hierarchy variants", jump: "production:autopilot-cm", detail: "Cut-off 12:45 AM EST. Non-hierarchy runs through Member Merge, Scrub, Engine, and Production Release. HP can follow CM Production Release." },
          { id: "cma", kind: "exit", title: "CMA Autopilot (Daily)", meta: "Auth file → Scrub → Authorization → Release", jump: "production:autopilot-cma", detail: "Starts at 2:00 PM NPT; cut-off 6:00 PM NPT. Requires Inpatient/Outpatient staged files." },
        ],
        layout: {
          flag: [1, 1], global: [2, 1], off: [2, 2], actor: [3, 1], create: [3, 2],
          manual: [3, 3], hold: [4, 2], hba: [5, 1], cm: [5, 2], cma: [5, 3],
        },
        edges: [
          ["flag", "global"], ["global", "off", "disabled"], ["global", "actor", "enabled"],
          ["actor", "create"], ["create", "manual", "resume"], ["create", "hold", "blocked"],
          ["manual", "hba"], ["manual", "cm"], ["manual", "cma"],
          ["create", "hba", "PA"], ["create", "cm", "CM"], ["create", "cma", "CMA"],
        ],
      },
      {
        id: "autopilot-hba",
        tab: "HBA (PA) flow",
        title: "HBA Autopilot Processing — PA phase change flow",
        route: "https://confluence.cgt.us/pages/viewpage.action?pageId=3115581485",
        summary:
          "Confluence HBA Autopilot for PA. Non-parent tickets: Waiting (after 12:30 AM EST) → File Arrangement → File Unstaging → Scrub Request → Scrubbing. Parent tickets: Application Processing Request → Application Processing. Resume only when the phase is set AND assignee is Autopilot User.",
        nodes: [
          { id: "wait", kind: "start", title: "Waiting + Autopilot User", meta: "Calendar-created ticket", detail: "After 12:30 AM EST, move to File Arrangement with comment 'Initiating missing file check for the client !!'. Tickets already On Hold (other assignee) or Closed are excluded." },
          { id: "fa", kind: "action", title: "File Arrangement", meta: "DPCC scan + missing-file check", detail: "Not triggered for parent tickets. Checks Account-Application-Product missing files and the S3 job Files Required flag at destination." },
          { id: "miss", kind: "decision", title: "Required files missing?", meta: "Files Required at destination", detail: "No missing → File Unstaging. Missing but Required = False → File Unstaging. Missing and Required = True → Waiting for Files." },
          { id: "wff", kind: "exception", title: "Waiting for Files", meta: "Assign USDM; poll every 1 hour", detail: "Comment lists distinct missing Deermine tickets (hyperlinked). When required files arrive → File Unstaging. Manual phase change clears the waiting flag." },
          { id: "unstage", kind: "system", title: "File Unstaging", meta: "Staged production files", detail: "Not triggered for parent tickets. Unstages staged production files for the Account-Application-Product combination." },
          { id: "ucheck", kind: "decision", title: "Unstage outcome", meta: "File-check after unstage", detail: "No staged files → On Hold to USDM. Success and no _! left in S3 → Scrub Request. _! still in S3 → File Arrangement to Processing Team. Partial/full failure → On Hold to Processing Team." },
          { id: "hold", kind: "exception", title: "On Hold", meta: "USDM or Processing Team", detail: "No files for unstaging (USDM), unstage failure (Processing Team), missing cluster settings, or cluster launch failure." },
          { id: "scrubreq", kind: "action", title: "Scrub Request", meta: "DPCC + Bad File Format + Crosswalk", detail: "Uses Skip Validation and Re-Unstage on the ticket. Success → Scrubbing. Not triggered for parent tickets." },
          { id: "scrub", kind: "system", title: "Scrubbing", meta: "Launch processing cluster", jump: "processing:monitor", detail: "Cluster from Hadoop Cluster Settings on Processing Dashboard. Missing settings or launch failure → On Hold to Processing Team. Not triggered for parent tickets." },
          { id: "apr", kind: "start", title: "Application Processing Request", meta: "Parent tickets only", detail: "Set by AfterScrubChecks / Processing Automation. Autopilot moves parent to Application Processing with comment 'Starting Application Processing'." },
          { id: "app", kind: "system", title: "Application Processing", meta: "Parent cluster launch", detail: "Same cluster-settings rules as Scrubbing. Failure → On Hold to Processing Team." },
          { id: "resume", kind: "exit", title: "Resume rule", meta: "Phase AND Autopilot User", jump: "production:phase", detail: "Retrigger from any phase only if that phase is set AND assignee is Autopilot User. Comment: '<User Comment>. Resuming autopilot processing from <Assigned Phase Name>!!'" },
        ],
        layout: {
          wait: [1, 1], fa: [2, 1], miss: [2, 2], wff: [2, 3], unstage: [3, 1],
          ucheck: [3, 2], hold: [3, 3], scrubreq: [4, 1], scrub: [4, 2], apr: [5, 1],
          app: [5, 2], resume: [5, 3],
        },
        edges: [
          ["wait", "fa", "after 12:30 AM EST"], ["fa", "miss"],
          ["miss", "unstage", "ok / not required"], ["miss", "wff", "required missing"],
          ["wff", "unstage", "files arrived"], ["unstage", "ucheck"],
          ["ucheck", "scrubreq", "no _! left"], ["ucheck", "fa", "_! remain"],
          ["ucheck", "hold", "none / fail"], ["scrubreq", "scrub", "validated"],
          ["scrub", "hold", "cluster fail"], ["apr", "app"], ["app", "hold", "cluster fail"],
          ["scrub", "resume"], ["app", "resume"], ["hold", "resume", "manual fix"],
        ],
      },
      {
        id: "autopilot-cm",
        tab: "CM / HP flow",
        title: "CM Autopilot Processing — Daily phase change flow",
        route: "https://confluence.cgt.us/pages/viewpage.action?pageId=3127476318",
        summary:
          "Confluence CM Autopilot (Daily), cut-off 12:45 AM EST. Start window ~6:30 AM NPT for Waiting / Production Release / Scrub Release tickets with Autopilot Yes. Non-hierarchy, parent, and child tickets follow different phase chains. HP can auto-release when CM first hits Production Release.",
        nodes: [
          { id: "start", kind: "start", title: "Daily start window", meta: "~6:30 AM NPT · cut-off 12:45 AM EST", detail: "Applies to tickets in Waiting + Autopilot User, or Production Release + Daily Production, or Scrub Release, with Autopilot Processing = Yes for that month's daily CM ticket." },
          { id: "dpcc", kind: "decision", title: "Open DPCC at product-frequency?", meta: "Parent, child, or non-hierarchy", detail: "Valid open DPCC → On Hold to Production CPM (and all open children if parent). Closed/invalid DPCC continues Autopilot." },
          { id: "hold", kind: "exception", title: "On Hold → Production CPM", meta: "Open DPCC", detail: "Parent also puts open children On Hold with comment that parent has open DPCC." },
          { id: "fa", kind: "action", title: "File Arrangement", meta: "Child / non-hierarchy", detail: "Needs at least one Staged Production file with Required = True. Parent tickets skip this and go to Member Merge Outbound instead." },
          { id: "mmo", kind: "system", title: "Member Merge Outbound", meta: "Parent / non-hierarchy", detail: "Not triggered for child tickets. Success on non-hierarchy → File Unstaging (or Waiting if past cut-off). Failure → On Hold Processing Team. Parent success stays on Member Merge Outbound for Processing Team." },
          { id: "wff", kind: "exception", title: "Waiting for Files", meta: "Poll every 30 min until cut-off", detail: "Assign Processing Team. After cut-off: non-child → Waiting + Autopilot User; child → Scrub Release. Email USDM (CC Processing Team, DW_production, CPM)." },
          { id: "unstage", kind: "system", title: "File Unstaging", meta: "Child / non-hierarchy", detail: "Requires Member Merge file plus other required files. Success with no _! → Scrub Request. _! remain → File Arrangement to Processing Team. Failure → On Hold." },
          { id: "scrubreq", kind: "action", title: "Scrub Request", meta: "DPCC + Bad Format + Crosswalk", detail: "Success → Scrubbing. Not for parent tickets." },
          { id: "scrub", kind: "system", title: "Scrubbing", meta: "Cluster or Inbound (parent)", detail: "Child/non-hierarchy: launch cluster. Parent: Inbound Execution → Scrub QC (Production QA) or On Hold on failure." },
          { id: "engine", kind: "system", title: "Request / Engine Execution", meta: "Non-child", detail: "Request for Engine Execution → Engine Execution. Success → Production Release + Daily Production. Failure → On Hold Processing Team. Not for child tickets." },
          { id: "release", kind: "exit", title: "Production Release", meta: "Daily Production", detail: "First CM Production Release can set matching-frequency HP ticket to Production Release + Daily Production when CM Autopilot is True. Prior-month dailies auto-close on the 1st at 12 AM NPT." },
          { id: "chains", kind: "system", title: "Three documented chains", meta: "Parent · Child · Non-hierarchy", detail: "Parent: Waiting → Member Merge → Scrubbing → Inbound → Scrub QC → Request Engine → Engine → Production Release. Child: Waiting → File Arrangement → File Unstaging → Scrub Request → Scrubbing. Non-hierarchy: Waiting → File Arrangement → Member Merge → File Unstaging → Scrub Request → Scrubbing → Inbound → Scrub QC → Request Engine → Engine → Production Release." },
        ],
        layout: {
          start: [1, 1], dpcc: [2, 1], hold: [2, 2], fa: [3, 1], mmo: [3, 2],
          wff: [3, 3], unstage: [4, 1], scrubreq: [4, 2], scrub: [5, 1], engine: [5, 2],
          release: [5, 3], chains: [1, 2],
        },
        edges: [
          ["start", "dpcc"], ["start", "chains"], ["dpcc", "hold", "open DPCC"],
          ["dpcc", "fa", "child / non-hier"], ["dpcc", "mmo", "parent"],
          ["fa", "mmo", "files ok"], ["fa", "wff", "missing"],
          ["wff", "mmo", "received"], ["mmo", "unstage", "success"],
          ["mmo", "hold", "fail"], ["unstage", "scrubreq"], ["scrubreq", "scrub"],
          ["scrub", "engine"], ["engine", "release"], ["engine", "hold", "fail"],
        ],
      },
      {
        id: "autopilot-cma",
        tab: "CMA flow",
        title: "CMA Autopilot Processing — Daily phase change flow",
        route: "https://confluence.cgt.us/pages/viewpage.action?pageId=3473605906",
        summary:
          "Confluence CMA Autopilot (Daily). Starts ~2:00 PM NPT for Waiting + Autopilot User or Production Release + Daily Production tickets with Autopilot Yes. Cut-off 6:00 PM NPT. Phase chain: Waiting → File Arrangement → Scrubbing → Authorization Execution → Production Release.",
        nodes: [
          { id: "start", kind: "start", title: "Daily start ~2:00 PM NPT", meta: "Cut-off 6:00 PM NPT", detail: "Tickets in Waiting + Autopilot User or Production Release + Daily Production, with Autopilot Processing = Yes for that month's daily CMA ticket." },
          { id: "dpcc", kind: "decision", title: "Open DPCC at product-frequency?", meta: "Hold or continue", detail: "Valid open DPCC → On Hold to Production CPM. Closed/invalid → File Arrangement." },
          { id: "hold", kind: "exception", title: "On Hold → Production CPM / Processing Team", meta: "DPCC, cluster, or auth failure", detail: "Also used for missing cluster settings, cluster launch failure, Authorization Execution failure, or no jobs on the phase." },
          { id: "fa", kind: "action", title: "File Arrangement", meta: "DPCC scan + required IP/OP file", detail: "Needs at least one Staged Production file with Required = True and File Type Inpatient or Outpatient." },
          { id: "files", kind: "decision", title: "Required Inpatient/Outpatient present?", meta: "Before cut-off", detail: "Present → Scrubbing (or Waiting if past cut-off). Missing → Waiting for Files to Processing Team; poll every 15 minutes until cut-off." },
          { id: "wff", kind: "exception", title: "Waiting for Files", meta: "Poll every 15 min", detail: "After cut-off without files → Waiting + Autopilot User. If Salesforce has Client Contact Notification Type = CMA Notification, email client (CC USDM, Processing Team, DW_production)." },
          { id: "scrub", kind: "system", title: "Scrubbing", meta: "Launch processing cluster", jump: "processing:monitor", detail: "Uses Hadoop Cluster Settings from Processing Dashboard. Missing settings or launch failure → On Hold to Processing Team." },
          { id: "auth", kind: "system", title: "Authorization Execution", meta: "Set by processing automation", detail: "Success → Production Release. Failure or no jobs on phase → On Hold to Processing Team. Resume only with phase + Autopilot User." },
          { id: "release", kind: "system", title: "Production Release", meta: "Optional CMA notification email", detail: "If CMA Notification contact exists in SF: email Authorization Report with tab counts and Excel attachment. Comment 'Authorization Complete !! Release Notification Email Triggered !!' (or without email if no contact)." },
          { id: "closed", kind: "exit", title: "Auto-close prior month", meta: "1st of month · 12 AM NPT", detail: "Daily tickets in Production Release / Scrub Release assigned to Production CPM / Daily Production for the previous month are closed automatically." },
        ],
        layout: {
          start: [1, 1], dpcc: [2, 1], hold: [2, 2], fa: [3, 1], files: [3, 2],
          wff: [3, 3], scrub: [4, 1], auth: [4, 2], release: [5, 1], closed: [5, 2],
        },
        edges: [
          ["start", "dpcc"], ["dpcc", "hold", "open DPCC"], ["dpcc", "fa", "ok"],
          ["fa", "files"], ["files", "scrub", "IP/OP present"], ["files", "wff", "missing"],
          ["wff", "scrub", "received"], ["wff", "start", "past cut-off"],
          ["scrub", "auth"], ["scrub", "hold", "cluster fail"],
          ["auth", "release", "success"], ["auth", "hold", "fail / no jobs"],
          ["release", "closed"],
        ],
      },
    ],
  },

  /* ============================= ACCOUNTS ============================= */
  {
    id: "accounts",
    tab: "4 · Accounts",
    views: [
      {
        id: "setup",
        tab: "Accounts & applications",
        title: "Accounts — account and application setup",
        route: "/account/index",
        summary:
          "Account configuration is the source of truth for who the client is and who owns their work. The application beneath it is the level at which processing and file expectations are actually defined.",
        nodes: [
          { id: "open", kind: "start", title: "Open Accounts", meta: "Client configuration", detail: "Read access is broad; edits are role-gated." },
          { id: "tabs", kind: "action", title: "Active and Termed tabs", meta: "Lifecycle split", detail: "Termed accounts stay visible for history but drop out of active operational lists." },
          { id: "find", kind: "action", title: "Search for the client account", meta: "Name or identifier", detail: "Accounts are organised by client and hold one or more applications." },
          { id: "create", kind: "action", title: "Add a new account", meta: "Role-gated", detail: "New-client onboarding starts here, before any processing can be configured." },
          { id: "detail", kind: "action", title: "Open the account record", meta: "Account detail", detail: "Holds market context, SLA days, and the client-service roles attached to the account." },
          { id: "team", kind: "action", title: "Assign the owning team and roles", meta: "From Admin setup", jump: "admin:setup", detail: "Team ownership drives routing, notifications, and who sees the work in their queue." },
          { id: "apps", kind: "action", title: "Open the Applications list", meta: "One or many", detail: "Applications separate distinct data feeds or scrub streams under one client." },
          { id: "appdet", kind: "action", title: "Configure the application", meta: "Vendor, layout, billable dates", detail: "Vendor and layout here are what File Management later matches incoming files against." },
          { id: "hierarchy", kind: "system", title: "Parent-child application hierarchy", meta: "Multi-scrub clients", detail: "Hierarchy changes how tickets are created, because child applications can be processed together." },
          { id: "mgu", kind: "action", title: "MGU Crosswalk", meta: "NDM and USDM only", detail: "A scoped submodule that most personas never see in the Accounts menu." },
          { id: "next", kind: "exit", title: "Continue to product-frequency settings", meta: "Where behaviour is decided", jump: "accounts:frequency", detail: "The account exists, but nothing processes until the product-frequency pairs are configured." },
        ],
        layout: {
          open: [1, 1], tabs: [1, 2], find: [2, 1], create: [2, 2], detail: [3, 1],
          team: [3, 2], mgu: [3, 3], apps: [4, 1], appdet: [4, 2], hierarchy: [5, 1], next: [5, 2],
        },
        edges: [
          ["open", "tabs"], ["tabs", "find"], ["find", "create", "new client"], ["find", "detail"],
          ["create", "detail"], ["detail", "team"], ["detail", "mgu"], ["detail", "apps"],
          ["apps", "appdet"], ["appdet", "hierarchy"], ["hierarchy", "next"], ["appdet", "next"],
        ],
      },
      {
        id: "frequency",
        tab: "Product-frequency & flags",
        title: "Accounts — product-frequency and processing flags",
        route: "/account/index (application → product frequency)",
        summary:
          "This is the screen that decides how future tickets behave: when they are raised, whether Autopilot runs them, whether a hold applies, and what validation they must pass.",
        nodes: [
          { id: "open", kind: "start", title: "Open Product Frequency for the application", meta: "Per deliverable", detail: "Each deliverable and frequency pair is configured independently." },
          { id: "pick", kind: "action", title: "Choose the deliverable and frequency", meta: "Monthly, weekly, and others", detail: "This pair is the key that tickets, jobs, and file expectations all hang from." },
          { id: "sched", kind: "action", title: "Set the processing calendar and release day", meta: "Drives ticket creation", jump: "production:tickets", detail: "The calendar automation reads this to raise maintenance tickets without human action." },
          { id: "auto", kind: "action", title: "Autopilot flag", meta: "Automated processing", jump: "production:autopilot", detail: "Switching this on makes future tickets for this pair eligible for automated phase progression." },
          { id: "dpcc", kind: "action", title: "DPCC flag", meta: "Processing hold condition", detail: "Feeds the assignment rules and can hold a ticket at its starting phase.", flag: "unverified" },
          { id: "weekend", kind: "action", title: "Weekend and holiday handling", meta: "Calendar behaviour", detail: "Decides whether a release date lands on, or shifts away from, a non-working day." },
          { id: "valid", kind: "action", title: "Validation and threshold settings", meta: "Quality gates", jump: "admin:setup", detail: "Works with the Daily IQR thresholds configured in Admin to decide what counts as an outlier." },
          { id: "save", kind: "decision", title: "Configuration validated on save", meta: "Accepted or rejected", detail: "A guard against combinations that would create unworkable tickets." },
          { id: "err", kind: "exception", title: "Conflicting or incomplete configuration", meta: "Correct and retry", detail: "Typical causes are a missing calendar, or flags that contradict each other." },
          { id: "effect", kind: "system", title: "Future tickets inherit these settings", meta: "Not retrospective", detail: "Existing tickets keep the configuration they were created with, which explains behaviour differences." },
          { id: "jobs", kind: "exit", title: "Jobs and file expectations reference this pair", meta: "Continue to Jobs", jump: "jobs:manage", detail: "Job configuration and expected-file records are both scoped to account, application, and product." },
        ],
        layout: {
          open: [1, 1], pick: [2, 1], sched: [2, 2], auto: [3, 1], dpcc: [3, 2],
          weekend: [3, 3], valid: [4, 1], save: [4, 2], effect: [5, 1], err: [5, 2], jobs: [5, 3],
        },
        edges: [
          ["open", "pick"], ["pick", "sched"], ["sched", "auto"], ["sched", "dpcc"],
          ["sched", "weekend"], ["auto", "valid"], ["dpcc", "valid"], ["weekend", "valid"],
          ["valid", "save"], ["save", "err", "rejected"], ["save", "effect", "saved"], ["effect", "jobs"],
        ],
      },
    ],
  },

  /* ============================== REPORTS ============================== */
  {
    id: "reports",
    tab: "5 · Reports",
    views: [
      {
        id: "run",
        tab: "Running a report",
        title: "Reports — running a report",
        route: "/viewReport/index",
        summary:
          "Reports turn processing results into something reviewable. The filter form is a deliberate gate: a report cannot run broadly enough to become an accidental client-data extract.",
        nodes: [
          { id: "open", kind: "start", title: "Open Reports", meta: "Report, Snapshots, Effort Log", detail: "The module is broadly visible, but the rows returned depend on access." },
          { id: "pick", kind: "action", title: "Select the report", meta: "Report picker", detail: "Each documented report has its own purpose and its own filter form." },
          { id: "family", kind: "system", title: "Report families", meta: "Quality, variance, release, billing", detail: "Quality and variance reports are the usual QA checkpoints after a processing run." },
          { id: "form", kind: "action", title: "Fill the filter form", meta: "Account, product, ticket, dates", detail: "The available filters change with the report, so the form is not a fixed layout." },
          { id: "required", kind: "decision", title: "Are the required fields supplied?", meta: "Ready or blocked", detail: "This is what prevents an unscoped run across every client." },
          { id: "missing", kind: "exception", title: "Missing required filter", meta: "Correct and retry", detail: "The form flags the missing input rather than returning partial output." },
          { id: "run", kind: "action", title: "Show the report", meta: "Submit", detail: "Larger date ranges take noticeably longer to return." },
          { id: "scope", kind: "system", title: "Access scopes the rows returned", meta: "Role-dependent", detail: "Two users running the same report can legitimately see different row counts." },
          { id: "out", kind: "system", title: "Result grid rendered", meta: "Counts, variances, dates", detail: "Variance against the previous period is usually the figure being checked." },
          { id: "drill", kind: "action", title: "Drill into a ticket or count", meta: "Deep link", detail: "A drilldown is the standard route from a suspicious number to its cause." },
          { id: "export", kind: "action", title: "Export or share", meta: "Download", detail: "Keep identifiers out of test evidence; use placeholders when documenting results." },
          { id: "phase", kind: "exit", title: "Investigate on the ticket", meta: "Phase Tracker", jump: "production:phase", detail: "A reporting anomaly is normally explained by the ticket's phase history." },
        ],
        layout: {
          open: [1, 1], pick: [2, 1], family: [2, 2], form: [3, 1], required: [3, 2],
          missing: [3, 3], run: [4, 1], scope: [4, 2], out: [5, 1], drill: [5, 2],
          export: [5, 3], phase: [5, 4],
        },
        edges: [
          ["open", "pick"], ["pick", "family"], ["family", "form"], ["form", "required"],
          ["required", "missing", "blocked"], ["required", "run", "valid"], ["run", "scope"],
          ["scope", "out"], ["out", "drill"], ["out", "export"], ["drill", "phase"],
        ],
      },
      {
        id: "snapshots",
        tab: "Snapshots & effort",
        title: "Reports — snapshots and effort log",
        route: "/viewReport/index#/snapshots",
        summary:
          "Two supporting surfaces. Snapshots preserve a report result so a later run can be compared against it; the Effort Log records the operational time spent on processing work.",
        nodes: [
          { id: "open", kind: "start", title: "Open Snapshots", meta: "Saved report state", detail: "A snapshot is a captured result, not a live query, so it does not move under you." },
          { id: "effort", kind: "start", title: "Open Effort Log", meta: "Second entry point", detail: "Opens as its own view rather than inside the report grid." },
          { id: "list", kind: "action", title: "Browse saved snapshots", meta: "By report and date", detail: "Useful when a client questions a figure reported earlier in the month." },
          { id: "create", kind: "action", title: "Capture a new snapshot", meta: "Freeze the current result", detail: "Capture before a change if you expect to need the before-and-after." },
          { id: "log", kind: "action", title: "Record effort against processing work", meta: "Ticket or account", detail: "Effort is attributed so it can be rolled up per client or per team." },
          { id: "compare", kind: "action", title: "Compare a snapshot to the current run", meta: "Before and after", detail: "The practical use of snapshots: showing exactly what changed and when." },
          { id: "summary", kind: "system", title: "Effort rolls up for reporting", meta: "Aggregated", detail: "Aggregation is what makes the log useful for capacity discussion." },
          { id: "diff", kind: "system", title: "Differences highlighted", meta: "Variance view", detail: "A difference is a question, not a defect, until the ticket history explains it." },
          { id: "billing", kind: "exit", title: "Feeds billing and capacity reporting", meta: "Downstream", detail: "Effort data supports billing review and staffing decisions." },
          { id: "invest", kind: "exit", title: "Raise the variance on the ticket", meta: "Phase Tracker", jump: "production:phase", detail: "Unexplained variance is documented against the ticket that produced it." },
        ],
        layout: {
          open: [1, 1], effort: [1, 2], list: [2, 1], create: [2, 2], log: [2, 3],
          compare: [3, 1], summary: [3, 3], diff: [4, 1], billing: [4, 3], invest: [5, 1],
        },
        edges: [
          ["open", "list"], ["list", "create"], ["list", "compare"], ["create", "compare"],
          ["compare", "diff"], ["diff", "invest"], ["effort", "log"], ["log", "summary"], ["summary", "billing"],
        ],
      },
    ],
  },

  /* ============================ SLA REPORT ============================ */
  {
    id: "sla",
    tab: "6 · SLA Report",
    views: [
      {
        id: "report",
        tab: "SLA reporting",
        title: "SLA Report — reporting",
        route: "/slaReport/index",
        summary:
          "Answers whether service-level commitments were met, by comparing committed dates against what actually happened. Each report option serves a different audience.",
        nodes: [
          { id: "open", kind: "start", title: "Open SLA Report", meta: "Report and Configuration", detail: "Consolidates the separate SLA report types into one module." },
          { id: "option", kind: "action", title: "Choose the SLA report option", meta: "Report selector", detail: "Pick the option matching the commitment being checked, not the client being asked about." },
          { id: "kinds", kind: "system", title: "Available SLA views", meta: "Client, product, data requirement, file delivery, legal, onboarding", detail: "File delivery covers vendor intake timeliness; legal and onboarding cover contractual milestones." },
          { id: "acct", kind: "action", title: "Select the account", meta: "Required scope", detail: "Scoping to an account keeps the result relevant and limited." },
          { id: "range", kind: "action", title: "Add the reporting period", meta: "Month or range", detail: "SLA questions are almost always about a specific closed period." },
          { id: "show", kind: "action", title: "Show", meta: "Run the report", detail: "Results reflect the SLA values configured at calculation time." },
          { id: "result", kind: "system", title: "Committed against actual dates", meta: "Met or missed", detail: "Compares the SLA commitment with the actual release or delivery date." },
          { id: "met", kind: "decision", title: "Was the SLA met?", meta: "Pass or breach", detail: "The single output that matters to the client-facing conversation." },
          { id: "breach", kind: "exception", title: "Breach needs an explanation", meta: "Documented reason", detail: "A breach is normally traced to a late file, a failed job, or a held phase." },
          { id: "drill", kind: "exit", title: "Open the ticket", meta: "Phase Tracker", jump: "production:phase", detail: "The phase history is where the cause of a breach is actually visible." },
        ],
        layout: {
          open: [1, 1], option: [2, 1], kinds: [2, 2], acct: [3, 1], range: [3, 2],
          show: [4, 1], result: [4, 2], met: [5, 1], breach: [5, 2], drill: [5, 3],
        },
        edges: [
          ["open", "option"], ["option", "kinds"], ["kinds", "acct"], ["acct", "range"],
          ["range", "show"], ["show", "result"], ["result", "met"], ["met", "breach", "missed"],
          ["met", "drill", "met"], ["breach", "drill"],
        ],
      },
      {
        id: "config",
        tab: "SLA configuration",
        title: "SLA Report — configuration",
        route: "/slaReport/index (Configuration tab)",
        summary:
          "Defines the values the report measures against. Changes here shape future calculations rather than rewriting results already reported.",
        nodes: [
          { id: "open", kind: "start", title: "Open the Configuration tab", meta: "Alongside the report", detail: "Same module, different purpose: this tab sets the target, the other tab checks it." },
          { id: "gate", kind: "decision", title: "Does the role permit editing?", meta: "Role-gated", detail: "Most personas can read the configuration but not change it." },
          { id: "ro", kind: "exception", title: "Read-only view", meta: "No save available", detail: "A missing save control is a permission boundary, not a defect." },
          { id: "pick", kind: "action", title: "Select account, application, product", meta: "Scope of the value", detail: "SLA values are specific; a global default would not survive real contracts." },
          { id: "vals", kind: "action", title: "Enter SLA days and commitment dates", meta: "Contractual values", detail: "These are taken from the client agreement rather than invented operationally." },
          { id: "save", kind: "decision", title: "Validation on save", meta: "Accepted or rejected", detail: "Blocks values that would produce impossible commitments." },
          { id: "err", kind: "exception", title: "Rejected values", meta: "Correct and retry", detail: "Usually an out-of-range day count or an overlapping definition." },
          { id: "applied", kind: "system", title: "Values apply to future calculations", meta: "Not retrospective", detail: "This is why an old report can disagree with a rerun of the same period." },
          { id: "report", kind: "exit", title: "The Report tab reflects the change", meta: "Back to reporting", jump: "sla:report", detail: "Rerun the report to confirm the new configuration behaves as intended." },
        ],
        layout: {
          open: [1, 1], gate: [2, 1], ro: [2, 2], pick: [3, 1], vals: [4, 1],
          save: [4, 2], applied: [5, 1], err: [5, 2], report: [5, 3],
        },
        edges: [
          ["open", "gate"], ["gate", "ro", "read only"], ["gate", "pick", "editable"],
          ["pick", "vals"], ["vals", "save"], ["save", "err", "rejected"],
          ["save", "applied", "saved"], ["applied", "report"],
        ],
      },
    ],
  },

  /* =============================== ADMIN =============================== */
  {
    id: "admin",
    tab: "7 · Admin",
    views: [
      {
        id: "setup",
        tab: "Setup & groups",
        title: "Admin — setup and groups",
        route: "/admin/index",
        summary:
          "The configuration every other module leans on: who owns work, what the SLA defaults are, and what counts as an out-of-threshold day. Strongly role-gated.",
        nodes: [
          { id: "open", kind: "start", title: "Open Admin", meta: "Role-gated module", detail: "Only some roles see Admin, and they do not all see the same submenus." },
          { id: "gate", kind: "decision", title: "Role decides the landing submenu", meta: "Setup or Server Management", detail: "Admin lands on Setup; Processing and SPT land on Server Management only." },
          { id: "setup", kind: "action", title: "Setup", meta: "Admin only", detail: "The configuration hub for teams, SLA defaults, and quality thresholds." },
          { id: "group", kind: "action", title: "Group Management", meta: "Admin only", detail: "Maintains the grouping used by notifications and access." },
          { id: "team", kind: "action", title: "Team setup", meta: "Ownership routing", jump: "accounts:setup", detail: "Teams defined here are the ones selectable on an account or application." },
          { id: "sla", kind: "action", title: "SLA defaults", meta: "Refresh and commitment days", jump: "sla:config", detail: "Defaults sit behind the per-account SLA configuration in the SLA module." },
          { id: "iqr", kind: "action", title: "Daily IQR thresholds", meta: "Quality gates", detail: "Sets the boundaries that decide whether a daily count is flagged as an outlier." },
          { id: "members", kind: "action", title: "Maintain group membership", meta: "Who is in which group", detail: "Membership decides who receives notifications and who can see grouped work." },
          { id: "save", kind: "decision", title: "Configuration validated on save", meta: "Accepted or rejected", detail: "Guards against removing ownership that active accounts still depend on." },
          { id: "effect", kind: "system", title: "Routing and thresholds change", meta: "Applies going forward", detail: "Threshold changes alter which future runs are flagged, not past ones." },
          { id: "reports", kind: "exit", title: "Daily IQR reporting uses these thresholds", meta: "Continue to Reports", jump: "reports:run", detail: "The threshold is the reason a report row is highlighted at all." },
        ],
        layout: {
          open: [1, 1], gate: [1, 2], setup: [2, 1], group: [2, 2], team: [3, 1],
          sla: [3, 2], iqr: [3, 3], members: [3, 4], save: [4, 1], effect: [5, 1], reports: [5, 2],
        },
        edges: [
          ["open", "gate"], ["gate", "setup", "admin"], ["gate", "group"], ["setup", "team"],
          ["setup", "sla"], ["setup", "iqr"], ["group", "members"], ["team", "save"],
          ["sla", "save"], ["iqr", "save"], ["members", "save"], ["save", "effect"], ["effect", "reports"],
        ],
      },
      {
        id: "products",
        tab: "Products & phases",
        title: "Admin — product management and phases",
        route: "/admin/index (Product Management)",
        summary:
          "Phases are configured data, not a fixed built-in list. This is why the phase sequence in Phase Tracker differs from one product to another.",
        nodes: [
          { id: "open", kind: "start", title: "Open Product Management", meta: "Admin only", detail: "Defines the deliverables that accounts can then be configured for." },
          { id: "prod", kind: "action", title: "Maintain the product list", meta: "Deliverables", detail: "A product must exist here before an account can be configured to produce it." },
          { id: "pg", kind: "action", title: "Define a phase group", meta: "Reusable sequence", detail: "A phase group is the template a ticket's phase list is built from." },
          { id: "ph", kind: "action", title: "Define the phases in the group", meta: "Names and order", detail: "Naming matters operationally, because phase names appear on dashboards and reports." },
          { id: "order", kind: "action", title: "Set the phase order and owners", meta: "Sequence and responsibility", detail: "Order decides what 'next' means; owner decides whose queue it lands in." },
          { id: "rules", kind: "action", title: "Mark phases automated or manual", meta: "Autopilot relevance", jump: "production:autopilot", detail: "Which phases can progress without a person is what makes automated processing possible.", flag: "unverified" },
          { id: "save", kind: "decision", title: "Phase group saved", meta: "Validated", detail: "Prevents sequences that would leave a ticket unable to advance." },
          { id: "err", kind: "exception", title: "Conflicting phase definition", meta: "Correct and retry", detail: "Typically a duplicate position or a phase with no owner." },
          { id: "avail", kind: "system", title: "Phase group available to products", meta: "Configuration live", detail: "Existing tickets keep the sequence they were created with." },
          { id: "tracker", kind: "exit", title: "Phase Tracker renders this sequence", meta: "Continue to Production Manager", jump: "production:phase", detail: "What a user sees on a ticket is a direct rendering of this configuration." },
        ],
        layout: {
          open: [1, 1], prod: [2, 1], pg: [3, 1], ph: [3, 2], order: [4, 1],
          rules: [4, 2], save: [5, 1], err: [5, 2], avail: [5, 3], tracker: [5, 4],
        },
        edges: [
          ["open", "prod"], ["prod", "pg"], ["pg", "ph"], ["ph", "order"], ["ph", "rules"],
          ["order", "save"], ["rules", "save"], ["save", "err", "rejected"],
          ["save", "avail", "saved"], ["avail", "tracker"],
        ],
      },
      {
        id: "infra",
        tab: "Versions & servers",
        title: "Admin — versions and server management",
        route: "/admin/index (Version and Server Management)",
        summary:
          "Two operational corners of Admin. Version Management controls which processing combinations may be selected on a ticket; Server Management is the only Admin area Processing and SPT roles reach.",
        nodes: [
          { id: "open", kind: "start", title: "Open Version Management", meta: "Admin only", detail: "Controls the version choices offered later at ticket creation." },
          { id: "srv", kind: "start", title: "Open Server Management", meta: "Also Processing and SPT", detail: "The landing page for processing personas who have no other Admin access." },
          { id: "kinds", kind: "action", title: "Version types", meta: "Product, scrub, extract, master table", detail: "Each type moves on its own release cadence, which is why compatibility has to be declared." },
          { id: "add", kind: "action", title: "Register a new version", meta: "After a release", detail: "Registration is what makes a newly released version selectable at all." },
          { id: "db", kind: "action", title: "Databases, servers, and scripts", meta: "Processing targets", detail: "Defines where processing physically runs and which scripts are available." },
          { id: "compat", kind: "action", title: "Map compatible combinations", meta: "Which versions work together", detail: "The mapping prevents a ticket being created against an untested combination." },
          { id: "avail", kind: "system", title: "Processing targets available to jobs", meta: "Referenced by Jobs", jump: "jobs:manage", detail: "Job configuration selects from the servers and scripts registered here." },
          { id: "check", kind: "decision", title: "Is the combination valid?", meta: "Accepted or rejected", detail: "The guard that keeps incompatible versions out of production runs." },
          { id: "err", kind: "exception", title: "Incompatible combination rejected", meta: "Correct and retry", detail: "Usually a version pairing that has not been certified together." },
          { id: "offer", kind: "system", title: "Versions offered at ticket creation", meta: "Continue to Production Manager", jump: "production:tickets", detail: "This is why a ticket cannot always be created against the newest version." },
          { id: "exec", kind: "exit", title: "Processing runs against these targets", meta: "Continue to Processing Dashboard", jump: "processing:monitor", detail: "Cluster and server context shown during execution comes from this configuration." },
        ],
        layout: {
          open: [1, 1], srv: [1, 2], kinds: [2, 1], add: [2, 2], db: [2, 3],
          compat: [3, 1], avail: [3, 3], check: [4, 1], err: [4, 2], offer: [5, 1], exec: [5, 2],
        },
        edges: [
          ["open", "kinds"], ["kinds", "add"], ["kinds", "compat"], ["add", "compat"],
          ["compat", "check"], ["check", "err", "invalid"], ["check", "offer", "valid"],
          ["srv", "db"], ["db", "avail"], ["avail", "exec"],
        ],
      },
    ],
  },

  /* =============================== JOBS =============================== */
  {
    id: "jobs",
    tab: "8 · Jobs",
    views: [
      {
        id: "manage",
        tab: "Manage jobs",
        title: "Jobs — manage jobs",
        route: "/viewJobs/index",
        summary:
          "The automation layer. Configuration here decides what happens when a file arrives or a phase changes, which is what allows processing to run without an operator pressing anything.",
        nodes: [
          { id: "open", kind: "start", title: "Open Jobs, then Manage Jobs", meta: "Configuration side", detail: "Read access is broad; creating and editing jobs is role-gated." },
          { id: "acct", kind: "action", title: "Select the account", meta: "First scope", detail: "Jobs are never global; they always belong to a client context." },
          { id: "app", kind: "action", title: "Select the application", meta: "Second scope", detail: "Account and application together identify the job list." },
          { id: "list", kind: "system", title: "Existing jobs for the pair", meta: "Current automation", detail: "Worth reading before adding: a duplicate job is a common cause of double processing." },
          { id: "add", kind: "action", title: "Add Jobs", meta: "New automation", detail: "Opens the job-type tabs, each with its own configuration form." },
          { id: "type", kind: "action", title: "Pick the job type tab", meta: "Type drives the form", detail: "Job type determines the trigger, the destination, and the recovery options available later." },
          { id: "types", kind: "system", title: "Available job types", meta: "S3, stored procedure, EDI parser, upload, inbound, authorization, script, RTI", detail: "File-facing types feed File Inventory; script and procedure types act on data already loaded." },
          { id: "cfg", kind: "action", title: "Configure trigger, source, and destination", meta: "Matching rules", jump: "files:intake", detail: "File-matching rules here are what decide whether an arriving file is recognised or lands in FM." },
          { id: "save", kind: "decision", title: "Job saved and enabled", meta: "Validated", detail: "A saved but disabled job silently does nothing, which is easy to misread as a failure." },
          { id: "err", kind: "exception", title: "Invalid or duplicate configuration", meta: "Correct and retry", detail: "Overlapping match patterns are the usual cause." },
          { id: "live", kind: "exit", title: "Job is live for the next matching event", meta: "Continue to Job status", jump: "jobs:status", detail: "Nothing happens until a file arrives or a phase is entered." },
        ],
        layout: {
          open: [1, 1], acct: [2, 1], app: [2, 2], list: [3, 1], add: [3, 2],
          type: [4, 1], types: [4, 2], cfg: [5, 1], save: [5, 2], err: [5, 3], live: [5, 4],
        },
        edges: [
          ["open", "acct"], ["acct", "app"], ["app", "list"], ["app", "add"], ["list", "type"],
          ["add", "type"], ["type", "types"], ["types", "cfg"], ["cfg", "save"],
          ["save", "err", "rejected"], ["save", "live", "enabled"],
        ],
      },
      {
        id: "status",
        tab: "Job status & recovery",
        title: "Jobs — status and recovery",
        route: "/viewJobs/index (Job Status)",
        summary:
          "The monitoring side. Status tabs separate healthy runs from failures, and a failed job is recovered here rather than in the Processing Dashboard.",
        nodes: [
          { id: "open", kind: "start", title: "Open Job Status", meta: "Monitoring side", detail: "Shows what the configured jobs actually did, per day." },
          { id: "date", kind: "action", title: "Choose the date", meta: "Required scope", detail: "Status is always read for a specific day rather than as a running total." },
          { id: "tab", kind: "action", title: "Completed, Failed, or Running", meta: "Status tabs", detail: "Failed is the operational entry point; Running shows work still in flight." },
          { id: "find", kind: "start", title: "Find S3 Job or Search Files", meta: "Second entry point", detail: "Used when you start from a file or job identifier instead of an account." },
          { id: "grid", kind: "system", title: "Job rows returned", meta: "Message, description, timestamps", detail: "The message column is usually enough to classify a failure before opening it." },
          { id: "row", kind: "action", title: "Open a job row", meta: "Detail view", detail: "Confirms which file and which account the run belonged to." },
          { id: "detail", kind: "system", title: "Full detail and file reference", meta: "Diagnosis", detail: "Treat file paths as sensitive and use placeholders in evidence." },
          { id: "ok", kind: "exit", title: "Completed job feeds File Inventory", meta: "Continue to File Management", jump: "files:inventory", detail: "A successful file job is what produces the inventory record a ticket needs." },
          { id: "fail", kind: "exception", title: "Failed job", meta: "Needs a decision", detail: "A failure can hold a ticket at its current phase until it is resolved." },
          { id: "act", kind: "action", title: "Rerun, skip, or stop", meta: "Role-gated", detail: "Available actions depend on both the tab and the signed-in role." },
          { id: "esc", kind: "exit", title: "Escalate a repeat failure", meta: "Defect or vendor issue", detail: "A second identical failure is usually data or configuration, not transient." },
        ],
        layout: {
          open: [1, 1], date: [2, 1], tab: [2, 2], find: [2, 3], grid: [3, 1],
          row: [4, 1], detail: [4, 2], ok: [5, 1], fail: [5, 2], act: [5, 3], esc: [5, 4],
        },
        edges: [
          ["open", "date"], ["date", "tab"], ["tab", "grid"], ["find", "grid"], ["grid", "row"],
          ["row", "detail"], ["detail", "ok", "completed"], ["detail", "fail", "failed"],
          ["fail", "act"], ["act", "grid", "rerun"], ["act", "esc"],
        ],
      },
    ],
  },

  /* ======================= PROCESSING DASHBOARD ======================= */
  {
    id: "processing",
    tab: "9 · Processing Dashboard",
    views: [
      {
        id: "monitor",
        tab: "Execution monitoring",
        title: "Processing Dashboard — execution monitoring",
        route: "/processingDashboard/index",
        summary:
          "Where processing actually runs. Filters narrow execution by cluster and date, rows expose step-level progress, and permitted operators can intervene when a run stalls.",
        nodes: [
          { id: "open", kind: "start", title: "Open Processing Dashboard", meta: "Role-gated module", detail: "Processing, Admin, CPM, development processing, SPT, and CA roles see different scopes." },
          { id: "cluster", kind: "action", title: "Choose the cluster tab", meta: "Processing or Snowflake", detail: "The platform decides which process-type tabs are meaningful." },
          { id: "date", kind: "action", title: "Set the date range", meta: "Required", detail: "Results always describe a defined window rather than everything ever run." },
          { id: "ptype", kind: "action", title: "Choose the process-type sub-tab", meta: "Narrows further", detail: "Each process type has its own operational meaning and its own failure patterns." },
          { id: "ptypes", kind: "system", title: "Process types available", meta: "Client processing, Daily IQR, splitter, parser", jump: "processing:daily-iqr", detail: "Daily IQR here is the execution of the quality check whose thresholds are set in Admin. After Daily IQR completes, File Change Reports may be generated." },
          { id: "grid", kind: "system", title: "Execution rows returned", meta: "Cluster, job, and ticket context", detail: "Identifies which ticket or process each run belongs to." },
          { id: "row", kind: "action", title: "Open an execution", meta: "Drill in", detail: "The row summary is rarely enough to diagnose a problem on its own." },
          { id: "steps", kind: "system", title: "Step-level status and messages", meta: "Where diagnosis happens", detail: "The failing step and its message are the actual evidence for a defect." },
          { id: "stuck", kind: "decision", title: "Healthy, stalled, or failed?", meta: "Operational judgement", detail: "A long-running step is not automatically a failure; compare against the usual duration." },
          { id: "act", kind: "action", title: "Resume, kill, or terminate", meta: "Role-gated", detail: "Strictly limited, because these actions affect live client processing." },
          { id: "back", kind: "exit", title: "Outcome returns to the ticket", meta: "Phase Tracker and Reports", jump: "production:phase", detail: "Execution results move the ticket forward and feed downstream reporting." },
        ],
        layout: {
          open: [1, 1], cluster: [2, 1], date: [2, 2], ptype: [3, 1], ptypes: [3, 2],
          grid: [4, 1], row: [4, 2], steps: [5, 1], stuck: [5, 2], act: [5, 3], back: [5, 4],
        },
        edges: [
          ["open", "cluster"], ["cluster", "date"], ["date", "ptype"], ["ptype", "ptypes"],
          ["ptypes", "grid"], ["grid", "row"], ["row", "steps"], ["steps", "stuck"],
          ["stuck", "act", "stalled"], ["stuck", "back", "healthy"], ["act", "back"],
        ],
      },
      {
        id: "ca",
        tab: "CA processing & config",
        title: "Processing Dashboard — CA processing and configuration",
        route: "/processingDashboard/index (CA Processing, Configuration)",
        summary:
          "CA processing runs on its own queue, independent of OM tickets, so it is monitored separately. The configuration views alongside it set cluster behaviour and team ownership.",
        nodes: [
          { id: "open", kind: "start", title: "Open CA Processing", meta: "Own queue", detail: "Visible to CA-related roles; not part of the ticket-driven path." },
          { id: "indep", kind: "system", title: "Runs independently of OM tickets", meta: "No processing ticket", detail: "This is why a CA job has no phase and no Phase Tracker entry." },
          { id: "cfg", kind: "start", title: "Open Configuration", meta: "Second entry point", detail: "Supporting views for cluster settings, ownership, and operational reporting." },
          { id: "queue", kind: "action", title: "Review the CA queue", meta: "Submitted work", detail: "Queue depth is the practical signal of whether CA work is keeping up." },
          { id: "cluster", kind: "action", title: "Cluster and processing settings", meta: "Execution behaviour", jump: "admin:infra", detail: "Works together with the servers registered in Admin." },
          { id: "status", kind: "system", title: "Queued, running, completed, or failed", meta: "Job state", detail: "State is read from the queue itself rather than from a ticket." },
          { id: "fail", kind: "exception", title: "Failed CA job", meta: "Needs a decision", detail: "Failures here do not block a processing ticket, so they can be missed." },
          { id: "map", kind: "action", title: "Account Team Mapping", meta: "Ownership", jump: "admin:setup", detail: "Decides which team is accountable for which client's processing." },
          { id: "retry", kind: "action", title: "Retrigger or escalate", meta: "Recovery", detail: "Escalate rather than repeatedly retrigger; repeated failure is rarely transient." },
          { id: "rep", kind: "action", title: "Processing Report", meta: "Operational reporting", jump: "reports:run", detail: "Summarises execution activity for review rather than for client delivery." },
          { id: "out", kind: "exit", title: "Operational reporting and ownership", meta: "Downstream", detail: "The output of these views is accountability rather than client deliverables." },
        ],
        layout: {
          open: [1, 1], indep: [1, 2], cfg: [1, 3], queue: [2, 1], cluster: [2, 3],
          status: [3, 1], fail: [3, 2], map: [3, 3], retry: [4, 2], rep: [4, 3], out: [5, 1],
        },
        edges: [
          ["open", "indep"], ["indep", "queue"], ["queue", "status"], ["status", "fail", "failed"],
          ["fail", "retry"], ["retry", "queue", "retry"], ["status", "out"],
          ["cfg", "cluster"], ["cluster", "map"], ["map", "rep"], ["rep", "out"],
        ],
      },
      {
        id: "daily-iqr",
        tab: "Daily IQR",
        title: "Daily IQR processing → File Change Reports",
        route: "/processingDashboard/index (24*7 Daily IQR / Custom Daily IQR)",
        summary:
          "Daily IQR runs on eligible files (automated or manual / forced for a past date). After the Daily IQR Processing Report is sent, File Change Reports are generated for Medical, Eligibility, and Pharmacy files that have distribution. A completely new file uses New File Report instead of FCR.",
        nodes: [
          { id: "start", kind: "start", title: "Daily IQR run starts", meta: "Automated or manual / forced date", detail: "Visible on Processing Dashboard process-type tabs such as 24*7 Daily IQR and Custom Daily IQR. Thresholds come from Admin >> Daily IQR Setup." },
          { id: "files", kind: "system", title: "Eligible files processed", meta: "Unstaged / synced inputs", jump: "files:inventory", detail: "If multiple files arrive in the same location on the same date for one job, all are processed by Daily IQR, but FCR uses only the latest." },
          { id: "iqr", kind: "system", title: "Daily IQR Processing Report sent", meta: "Quality output first", detail: "File Change Reports are generated after this report goes out." },
          { id: "newfile", kind: "decision", title: "Completely new file?", meta: "First-time feed", detail: "A brand-new file replaces FCR with New File Report for that case." },
          { id: "nfr", kind: "exit", title: "New File Report", meta: "Not an FCR", detail: "Used instead of File Change Reports when the file has no prior comparable history as a change." },
          { id: "scope", kind: "decision", title: "Medical, Eligibility, or Pharmacy?", meta: "FCR record types only", detail: "Other record types do not produce File Change Reports." },
          { id: "skip", kind: "exception", title: "Out of FCR scope", meta: "No FCR for this type", detail: "FCR only considers Medical, Eligibility, and Pharmacy." },
          { id: "dist", kind: "decision", title: "File has distribution?", meta: "Flag Y/1 vs N/0", detail: "Only valid files with distribution (Y or 1) are used. Dependent files without distribution (N or 0) are ignored for FCR." },
          { id: "dep", kind: "exception", title: "Dependent file ignored", meta: "No distribution", detail: "FME marks dependent files N/0 in the file job table; they do not drive FCR." },
          { id: "fcr", kind: "exit", title: "Generate File Change Reports", meta: "New Group + Missing Group", jump: "processing:fcr", detail: "Continue to the detailed FCR flow: New Group Report, Missing Group Report, and File Issue ticket posting." },
        ],
        layout: {
          start: [1, 1], files: [2, 1], iqr: [3, 1], newfile: [3, 2], nfr: [3, 3],
          scope: [4, 1], skip: [4, 2], dist: [5, 1], dep: [5, 2], fcr: [5, 3],
        },
        edges: [
          ["start", "files"], ["files", "iqr"], ["iqr", "newfile"],
          ["newfile", "nfr", "new file"], ["newfile", "scope", "known feed"],
          ["scope", "skip", "other type"], ["scope", "dist", "Med/Elig/Pharm"],
          ["dist", "dep", "N/0"], ["dist", "fcr", "Y/1"],
        ],
      },
      {
        id: "fcr",
        tab: "File Change Report",
        title: "Daily IQR — File Change Reports (FCR)",
        route: "https://confluence.cgt.us/pages/viewpage.action?pageId=3133866049",
        summary:
          "From File Change Reports Documentation (under Daily IQR Processing). FCRs are New Group and Missing Group reports. New Group compares the current file to UM active groups using the Sandbox Client → Sandbox App → Parent → same-client order (OM-5887). Missing Group compares to the previous file for the same Job ID, Client, Vendor, Layout, and File Type. Each FCR posts a File Issue ticket unless excluded.",
        nodes: [
          { id: "start", kind: "start", title: "FCR generation starts", meta: "After Daily IQR Processing Report", jump: "processing:daily-iqr", detail: "Eligibility, Medical, and Pharmacy only; distribution Y/1 only. Eligibility uses Group + Record Count; Medical/Pharmacy also use Max Paid Date." },
          { id: "split", kind: "action", title: "Build both FCR types", meta: "New Group and Missing Group", detail: "Both reports may be produced for the same file when their conditions are met." },
          { id: "ng", kind: "system", title: "New Group Report", meta: "Current file vs UM active groups", detail: "Groups in the current file that are not in the UM active set for the comparison client are new groups." },
          { id: "order", kind: "decision", title: "Which client for New Group compare?", meta: "OM-5887 order", detail: "1) Sandbox Client on the application if set. 2) Else an application on the account with Sandbox App = Yes. 3) Else parent application (PA hierarchy). 4) Else the same client." },
          { id: "um", kind: "system", title: "UM API active groups", meta: "Group code + group name", detail: "UM provides the active groups used for New Group comparison." },
          { id: "mg", kind: "system", title: "Missing Group Report", meta: "Current vs previous file", detail: "Groups present previously but missing now. Previous file matched by Job ID + Client + Vendor + Layout + File Type." },
          { id: "prev", kind: "action", title: "Identify previous file", meta: "Same job + vendor + layout + type", detail: "If no comparable previous file exists, Missing Group does not apply as a change against history." },
          { id: "change", kind: "decision", title: "New or missing groups found?", meta: "Generate report or stop", detail: "Report is generated only when differences are identified." },
          { id: "none", kind: "exit", title: "No FCR for this file", meta: "No group change", detail: "No New Group and no Missing Group report means no File Issue ticket from FCR." },
          { id: "excl", kind: "decision", title: "On FileMissingExclusionList?", meta: "Client + data type", detail: "Excluded client/data-type pairs do not get File Issue tickets." },
          { id: "ticket", kind: "system", title: "Create File Issue ticket", meta: "Data Production - File Management", detail: "Subject: <Account Acronym>-<Vendor> - <Type of Report> - <File Received Date>. Assignee: USDM / USDM Work Queue. File Issue Type New Group or Missing Group. Status New, Priority Normal, File Required Yes." },
          { id: "fail", kind: "exception", title: "Ticket create failed", meta: "Email Production Team", detail: "If File Issue cannot be created, send the FCR email notification to Production Team with the same report layout." },
          { id: "forced", kind: "action", title: "Manual / forced past-date run", meta: "Regenerate forward", detail: "FCRs regenerate from the forced date through current. File Issue tickets are created only when a regenerated report differs from the previously stored one." },
          { id: "done", kind: "exit", title: "FCR complete", meta: "Ticket or email delivered", detail: "USDM works the File Issue; treat client, vendor, and file names as placeholders in evidence." },
        ],
        layout: {
          start: [1, 1], split: [1, 2], ng: [2, 1], order: [2, 2], um: [2, 3],
          mg: [3, 1], prev: [3, 2], change: [4, 1], none: [4, 2], excl: [4, 3],
          ticket: [5, 1], fail: [5, 2], forced: [5, 3], done: [5, 4],
        },
        edges: [
          ["start", "split"], ["split", "ng"], ["split", "mg"],
          ["ng", "order"], ["order", "um"], ["um", "change"],
          ["mg", "prev"], ["prev", "change"],
          ["change", "none", "no change"], ["change", "excl", "change found"],
          ["excl", "done", "excluded"], ["excl", "ticket", "post ticket"],
          ["ticket", "fail", "create failed"], ["ticket", "done"],
          ["fail", "done", "email sent"], ["forced", "split", "regenerate"],
          ["start", "forced", "manual past date"],
        ],
      },
      {
        id: "jetstore",
        tab: "JetStore Integration",
        title: "JetStore Integration — Test Harness on Implementation tickets",
        route: "https://confluence.cgt.us/pages/viewpage.action?pageId=3215556842",
        summary:
          "From JetStore Integration (Confluence 3215556842). After File Mapping on an Implementation ticket, the stage1 dump is uploaded to JetStore S3 input with a unique Run ID. JetStore runs Test Harness per data type (Medical, Eligibility, Pharmacy), posts Running/Completed/Failed to OM, evaluates Pass/Fail/Warning results, and may create Feature Defect Jira tickets or put the ticket On Hold for the Data Team User.",
        nodes: [
          { id: "impl", kind: "start", title: "Implementation ticket — File Mapping done", meta: "Stage1 dump ready", jump: "production:phase", detail: "Applies to Implementation processing tickets after all File Mapping jobs complete. Each scrub/File Mapping iteration needs a unique Run ID even on the same day." },
          { id: "upload", kind: "system", title: "Upload dump to JetStore S3 input", meta: "environment = OM cluster env", detail: "Path pattern: s3://cgt-prod-jetstore/jetstore/input/…/environment=<PROD|UAT|QC>/processing_ticket=<…_RunID>/…/object_type=<MedicalClaim|Eligibility|PharmacyClaim>/…. QC cluster → QC in the path." },
          { id: "notify", kind: "system", title: "FME posts run details to OM API", meta: "Processing ID, start time, data types, Run ID", detail: "Stored in OM DB. Uploaded data types can be Medical, Eligibility, and/or Pharmacy." },
          { id: "harness", kind: "system", title: "JetStore runs Test Harness", meta: "Per data type", detail: "JetStore posts Running, Completed, or Failed to OM for each data type separately." },
          { id: "status", kind: "decision", title: "Harness status for a data type", meta: "Running / Completed / Failed", detail: "Running → comment 'Test Harness execution in progress for <Data Type>'. Completed → 'Test Harness Output Generation Completed for <Data Type>'. Failed → On Hold." },
          { id: "ogen", kind: "exception", title: "Output generation failed", meta: "On Hold → Data Team User", detail: "Phase On Hold, comment 'Test Harness Output Generation Failed for <Data Type>.', assignee = Data Team User from Team Setup for the account (OM-5747)." },
          { id: "all", kind: "decision", title: "All input data types reported?", meta: "Completed or Failed received", detail: "When every uploaded data type has Completed or Failed, PagerDuty is triggered with Phase Tracker comment 'Pagerduty alert has been pushed for Failed Status.' — except Failed with no Input Data Type message (OM-4533), which skips PagerDuty." },
          { id: "timeout", kind: "exception", title: "No output within threshold", meta: "Config minutes", detail: "If neither output nor failure arrives within the configured minutes after upload: On Hold, comment about threshold, assign Data Team User. Cluster termination after next Backup Job is config-gated." },
          { id: "eval", kind: "action", title: "Evaluate Test Result files", meta: "Pass / Fail / Warning", detail: "Warning ignored. Only test cases with $ in rawfilename are evaluated. Results stored per Processing Ticket + Run ID." },
          { id: "result", kind: "decision", title: "Any Fail outside exclusion list?", meta: "Known-issue Feature Defects", detail: "Exclusion: prior Feature Defect for same client/ALL, layout, data type, test_id, Known Issue Yes, Status Done or Closed. All Pass → 'All stage1 test cases Passed!'. All Fails excluded → exclusion comment." },
          { id: "pass", kind: "exit", title: "All stage1 tests passed", meta: "Or fails only in exclusion list", detail: "Ticket continues the Implementation path. Monitor related blinding/status separately when applicable.", jump: "blinding" },
          { id: "jira", kind: "system", title: "Create Feature Defect Jira tickets", meta: "Data Type–Layout–Test Case ID", detail: "Project = Data Team project; Work Queue Stage1 Issue Queue; Test = Stage1 Test; Defect Root Cause Mapping Error - General; Defect Impact Data; Defect Test Phase Non-Regression; System Environment AUAT (OM-5303)." },
          { id: "hold", kind: "exception", title: "On Hold + terminate cluster", meta: "Data Team User", detail: "Comment lists hyperlinked Jira tickets (or create-failed messages if Fix Version / other errors). After next Backup Job: 'Backup jobs completed, terminating the cluster!' when terminate-config is True." },
        ],
        layout: {
          impl: [1, 1], upload: [2, 1], notify: [2, 2], harness: [3, 1], status: [3, 2],
          ogen: [3, 3], all: [4, 1], timeout: [4, 2], eval: [4, 3], result: [5, 1],
          pass: [5, 2], jira: [5, 3], hold: [5, 4],
        },
        edges: [
          ["impl", "upload"], ["upload", "notify"], ["notify", "harness"],
          ["harness", "status"], ["status", "ogen", "Failed"], ["status", "all", "Running/Completed"],
          ["ogen", "all"], ["notify", "timeout", "no response"],
          ["all", "eval", "outputs ready"], ["eval", "result"],
          ["result", "pass", "pass / excluded"], ["result", "jira", "fail not excluded"],
          ["jira", "hold"], ["timeout", "hold"], ["ogen", "hold", "terminate path"],
        ],
      },
    ],
  },

  /* =========================== FILE MANAGEMENT =========================== */
  {
    id: "files",
    tab: "10 · File Management",
    views: [
      {
        id: "inventory",
        tab: "Listing criteria",
        title: "File Inventory — how files get listed",
        route: "https://confluence.cgt.us/pages/viewpage.action?pageId=3067544735",
        summary:
          "From File Inventory Documentation. Every file placed in dasscrubinput by OM S3 Copy/Parse (or matching S3 Static invocation rules) with staging Production (_!) or QC ($) and a standard destination path is listed in File Manager >> File Inventory. File Received Date comes from OM SQS; Expected Date from job frequency. Products tracked include PA, CM, HP, CMP, CMA, FME, CC.",
        nodes: [
          { id: "job", kind: "start", title: "S3 job places a file", meta: "S3 Copy, S3 Parse, or S3 Static", jump: "jobs:manage", detail: "Inventory is fed by job execution, not by browsing the bucket by hand." },
          { id: "bucket", kind: "decision", title: "In dasscrubinput via OM S3 job?", meta: "Destination bucket", detail: "Copy/Parse files must land in dasscrubinput through OM S3 Jobs." },
          { id: "stage", kind: "decision", title: "Staging = Production (_!) or QC ($)?", meta: "Cannot be None", detail: "Staging None means the file is not listed in Inventory UI." },
          { id: "path", kind: "decision", title: "Destination path matches convention?", meta: "ClientName uppercase · ClientFolder lowercase", detail: "dasscrubinput/[Onshore|Offshore]/[ClientName]/[ProductAcronym]/[Incremental]/[StageFolder]/[ClientFolder]/[Vendor]/[FileType]/[Layout]/[DateFolder]/[FileName]. StageFolder = Stage0 or preFileProcess. DateFolder = %{yyyyMMdd|0}%." },
          { id: "static", kind: "decision", title: "S3 Static invocation rule OK?", meta: "…/dasscrubinput/EOF/…", detail: "Static jobs use [ClientBucket]/[dev]/dasscrubinput/EOF/[Onshore|Offshore]/[ClientName]/[Product]/[StageFolder]/[ClientFolder]/[Vendor]/[FileType]/[Layout]/[DateFolder]/[FileName]." },
          { id: "pathLayout", kind: "system", title: "Layout parsed from path segments", meta: "Optional path parameter", detail: "Layout null vs present depends on total path parameter count and whether Onshore/Offshore, Incremental, or /dev/ are present." },
          { id: "removed", kind: "exception", title: "is_destination_removed = 1", meta: "Hidden from all tabs", detail: "Removed destination records in inventory_tracker are not listed in any Inventory tab." },
          { id: "untracked", kind: "exception", title: "untracked_file_inventory", meta: "Criteria not met", detail: "Files that fail listing criteria are stored as untracked, not shown as normal Inventory rows." },
          { id: "listed", kind: "system", title: "Listed in File Inventory", meta: "Received Date + Expected Date", detail: "File Received Date from SQS. Expected Date from job frequency (same frequency for files from the same job). Required/Optional shown on every tab. All dates/times EST." },
          { id: "tabs", kind: "exit", title: "Continue by inventory tab", meta: "Staged · Unstaged · Missed", jump: "files:staged", detail: "Open Staged Implementation/Production, Unstaging, or Missed flows next." },
        ],
        layout: {
          job: [1, 1], bucket: [2, 1], stage: [2, 2], path: [3, 1], static: [3, 2],
          pathLayout: [4, 1], removed: [4, 2], untracked: [4, 3], listed: [5, 1], tabs: [5, 2],
        },
        edges: [
          ["job", "bucket"], ["job", "static", "S3 Static"],
          ["bucket", "stage", "yes"], ["bucket", "untracked", "no"],
          ["stage", "path", " _! or $ "], ["stage", "untracked", "None"],
          ["path", "pathLayout", "match"], ["path", "untracked", "no match"],
          ["static", "pathLayout", "match"], ["static", "untracked", "no match"],
          ["pathLayout", "removed"], ["removed", "untracked", "removed"],
          ["removed", "listed", "active"], ["listed", "tabs"],
        ],
      },
      {
        id: "staged",
        tab: "Staged files",
        title: "File Inventory — Staged Implementation / Production",
        route: "/fileManagement/index#/fileInventory (Staged tabs)",
        summary:
          "QC Files ($) → Staged Implementation (development). Production Files (_!) → Staged Production. Default frequency: Monthly for Implementation-only, Daily for Production or mixed. Move to Production works at Job + Client + Product level; onshore moves also unstage blinded/crosswalk/sample $ folders and send a separate email.",
        nodes: [
          { id: "listed", kind: "start", title: "File listed in Inventory", meta: "From listing criteria", jump: "files:inventory", detail: "Search UI uses Account, Application, Product (QC-observed required filters). Job Id with * is an archived job." },
          { id: "kind", kind: "decision", title: "Staging type on the job?", meta: "QC $ vs Production _!", detail: "$ prepended to DateFolder → Staged Implementation. _! prepended → Staged Production." },
          { id: "impl", kind: "system", title: "Staged Implementation Files", meta: "Development / QC", detail: "Used for development. Default frequency Monthly if not configured on the job." },
          { id: "prod", kind: "system", title: "Staged Production Files", meta: "Production _!", detail: "Default frequency Daily if not configured. Mixed Imp+Prod jobs default Daily." },
          { id: "freq", kind: "action", title: "Frequency & Expected Date", meta: "From job config · N/A / On Hold options", detail: "CPM has limited write: frequency and expected date on staged files. Admin and Processing have full write. Tolerance days affect next expected date." },
          { id: "req", kind: "action", title: "Update Required / Optional", meta: "Action on staged & missed tabs", detail: "OM-3075: Action button updates Required file status on Staged Implementation/Production and Missed Implementation/Production." },
          { id: "move", kind: "action", title: "Move to Production", meta: "Job + Client + Product", detail: "From Staged Implementation. Option A: keep development copy (file in both tabs). Option B: move only (Production tab only)." },
          { id: "onshore", kind: "system", title: "Onshore move → unstage blind files", meta: "Blinded / crosswalk / sample", detail: "Remove $ from those DateFolders. They are not listed in Inventory. Separate email notification is sent (OM-3174)." },
          { id: "refresh", kind: "system", title: "S3 Refresh Job with _!", meta: "Keeps development copy", detail: "Refresh jobs staged as Production automatically keep a development copy as well." },
          { id: "next", kind: "exit", title: "Ready to unstage or wait", meta: "Continue to Unstaging or Missed", jump: "files:unstaging", detail: "Staged Production files can be unstaged to a ticket, or become Missed if Expected Date passes." },
        ],
        layout: {
          listed: [1, 1], kind: [2, 1], impl: [2, 2], prod: [3, 1], freq: [3, 2],
          req: [3, 3], move: [4, 1], onshore: [4, 2], refresh: [4, 3], next: [5, 1],
        },
        edges: [
          ["listed", "kind"], ["kind", "impl", "QC $"], ["kind", "prod", "Prod _!"],
          ["impl", "freq"], ["prod", "freq"], ["freq", "req"], ["impl", "move"],
          ["move", "onshore", "onshore"], ["move", "prod", "to production"],
          ["prod", "refresh"], ["prod", "next"], ["req", "next"],
        ],
      },
      {
        id: "unstaging",
        tab: "Unstaging",
        title: "File Inventory — Unstaged Files",
        route: "/fileManagement/index#/fileInventory (Unstaged Files)",
        summary:
          "Staged Production files become Unstaged by Set Processing ID on the row, or by setting a ticket phase to File Unstaging (all files for that Account-Application-Product). Unstaging removes _! (and $ development copies). S3 Static files can appear in Unstaged without a processing ticket. After the ticket is archived, UI records disappear but DB retains them.",
        nodes: [
          { id: "staged", kind: "start", title: "File in Staged Production", meta: "Or S3 Static inventory match", jump: "files:staged", detail: "Normal unstaging starts from Staged Production. S3 Static files that match inventory criteria also list under Unstaged without needing a ticket." },
          { id: "how", kind: "decision", title: "How is unstaging started?", meta: "UI action or Phase Tracker", detail: "Two documented paths into Unstaged Files." },
          { id: "setid", kind: "action", title: "Set Processing ID", meta: "Action on Staged Production row", detail: "Ticket picker filtered by Account, Application, and Product." },
          { id: "phase", kind: "action", title: "Ticket phase = File Unstaging", meta: "Phase Tracker", jump: "production:phase", detail: "Unstages all listed files for that Account-Application-Product onto that ticket." },
          { id: "move", kind: "system", title: "Remove _! (and $ copy)", meta: "S3 path rewrite", detail: "File leaves _! DateFolder for the normal location. Development $ copy is removed if present." },
          { id: "incr", kind: "system", title: "Incremental / Bulk Incremental rules", meta: "Also clear _!Incremental", detail: "Remove _! from DateFolder in regular and _!Incremental locations; remove $ copies in both." },
          { id: "static", kind: "system", title: "S3 Static on Unstaged tab", meta: "No ticket required", detail: "OM-4150: Static files matching inventory criteria list in Unstaged and feed Missed Production when overdue." },
          { id: "miss", kind: "system", title: "Missing-file records on ticket", meta: "Feature #601440", detail: "Missing File records are saved/displayed for tickets that go through file unstaging / re-unstaging (Missed while Arranging)." },
          { id: "done", kind: "exit", title: "Unstaged — ticket can proceed", meta: "Until ticket archived", jump: "production:phase", detail: "When the processing ticket used for unstaging is archived, Inventory UI rows for that lifecycle disappear; database retains them." },
        ],
        layout: {
          staged: [1, 1], how: [2, 1], setid: [2, 2], phase: [2, 3], move: [3, 1],
          incr: [3, 2], static: [3, 3], miss: [4, 1], done: [5, 1],
        },
        edges: [
          ["staged", "how"], ["staged", "static"], ["how", "setid", "Set Processing ID"],
          ["how", "phase", "File Unstaging phase"], ["setid", "move"], ["phase", "move"],
          ["move", "incr", "incremental"], ["move", "done"], ["incr", "done"],
          ["static", "done"], ["move", "miss"], ["miss", "done"],
        ],
      },
      {
        id: "missed",
        tab: "Missed files",
        title: "File Inventory — Missed Implementation / Production / Missed Files",
        route: "/fileManagement/index#/fileInventory (Missed tabs)",
        summary:
          "A file is Missed when the next file for the job is not received after Expected Date. Missed Implementation uses latest staged implementation files. Missed Production uses latest staged production and unstaged files (including S3 Static). Received-late files show green on Imp/Prod missed tabs. Missed Files tab (OM-3745) shows only still-missing production files for a selected Expected Date across all clients. Daily Missing File Report email at 9:15 am NPT.",
        nodes: [
          { id: "expect", kind: "start", title: "Expected Date passes with no next file", meta: "Latest file per job", detail: "Missed marking is based on the latest file received for a job exceeding its Expected Date." },
          { id: "impl", kind: "system", title: "Missed Implementation Files", meta: "From Staged Implementation", detail: "Only latest file(s) per job under Staged Implementation are considered." },
          { id: "prod", kind: "system", title: "Missed Production Files", meta: "From Staged Production + Unstaged", detail: "Includes S3 Static jobs. Latest file(s) per job under those tabs." },
          { id: "late", kind: "system", title: "Received after marked missed", meta: "Green highlight", detail: "On Missed Implementation/Production tabs, late-received files stay visible with updated File Received Date and are highlighted green." },
          { id: "tab", kind: "action", title: "Missed Files tab", meta: "All clients · one Expected Date", detail: "OM-3745: for the Expected Date in search, list missing production files for all clients/products — excluding files already received. Columns include Client, Product, Job ID, Vendor, Layout, File Type, File Name, Expected/Received dates, Frequency, Ticket ID, emails sent, Grace Period, Required/Optional." },
          { id: "req", kind: "action", title: "Update Required on missed rows", meta: "Same action as staged", detail: "Required status can be updated from Missed Implementation/Production tabs." },
          { id: "issue", kind: "system", title: "Missing/Duplicate File Issue tickets", meta: "Automated posting", jump: "files:unmatched", detail: "Automated Deermine/File Issue creation for missing records is documented under Automate File Issues for Missing Records." },
          { id: "email", kind: "system", title: "Missing File Report email", meta: "9:15 am NPT · 10:30 pm EST daily", detail: "Title: Missing File Report for Account: <Account> and Application: <Application> for <Date>. Sections: still missing, and received-after-missed. Only new misses for that day. If nothing to report overall: single 'Missing File Report for <Date>' saying no missing files." },
          { id: "roles", kind: "decision", title: "Role access to File Manager", meta: "Read / limited / full write", detail: "All OM users: read-only. ROLE_OM_CPM: edit frequency and expected date on staged files. ROLE_OM_ADMIN and ROLE_OM_PROCESSINGTEAM: full read/write." },
          { id: "done", kind: "exit", title: "Chase or unstage when received", meta: "Back to Staged / Unstaging", jump: "files:unstaging", detail: "Once received, files leave the Missed Files tab and can be unstaged onto a ticket." },
        ],
        layout: {
          expect: [1, 1], impl: [2, 1], prod: [2, 2], late: [2, 3], tab: [3, 1],
          req: [3, 2], issue: [4, 1], email: [4, 2], roles: [4, 3], done: [5, 1],
        },
        edges: [
          ["expect", "impl"], ["expect", "prod"], ["impl", "late"], ["prod", "late"],
          ["prod", "tab"], ["tab", "req"], ["tab", "issue"], ["tab", "email"],
          ["email", "roles"], ["late", "done"], ["roles", "done"], ["issue", "done"],
        ],
      },
      {
        id: "unmatched",
        tab: "Client / General FM",
        title: "File Management — Client FM and General FM",
        route: "/fileManagement/index (Client FM, General FM)",
        summary:
          "Related File Management surface documented under the File Inventory parent tree. Files that do not uniquely match a job rule (or failed refresh replace) land in Client FM or General FM for manual routing back into Inventory.",
        nodes: [
          { id: "open", kind: "start", title: "Open Client FM or General FM", meta: "Unmatched files", detail: "Client FM is scoped to a client; General FM holds files with no clear owner." },
          { id: "why", kind: "system", title: "No unique job invocation match", meta: "Or failed refresh replace", jump: "jobs:manage", detail: "Archived jobs are excluded from matching. Refresh that cannot replace an old file (not first run) also lands here." },
          { id: "list", kind: "action", title: "Review the unmatched list", meta: "Arrival order", detail: "Growing quietly is the failure mode; this list needs regular review." },
          { id: "inspect", kind: "action", title: "Inspect name and source path", meta: "Identify the file", detail: "Name and inbound path usually identify a known feed." },
          { id: "decide", kind: "decision", title: "Known expected file?", meta: "Route or discard", detail: "Determines whether the file re-enters normal Inventory handling." },
          { id: "link", kind: "action", title: "Link to Job", meta: "Controlled route back", detail: "Attaches the file to the job that should have claimed it." },
          { id: "da", kind: "action", title: "Send to DA / delete", meta: "Role-gated", detail: "Unclear files go to DA; deletes are reserved for duplicates and test files." },
          { id: "inv", kind: "exit", title: "Appears in File Inventory", meta: "Continue to listing / staged", jump: "files:inventory", detail: "Once linked, the file follows the normal Inventory listing and staged-tab rules." },
        ],
        layout: {
          open: [1, 1], why: [1, 2], list: [2, 1], inspect: [2, 2], decide: [3, 1],
          link: [4, 1], da: [4, 2], inv: [5, 1],
        },
        edges: [
          ["open", "why"], ["why", "list"], ["list", "inspect"], ["inspect", "decide"],
          ["decide", "link", "known"], ["decide", "da", "unclear"], ["link", "inv"],
        ],
      },
      {
        id: "intake",
        tab: "Intake setup",
        title: "File Management — FTP, Vendor Schedule, Notification",
        route: "/fileManagement/index (FTP Accounts, Vendor Schedule, Vendor Notification)",
        summary:
          "Supporting intake configuration referenced from the File Inventory documentation tree. FTP Accounts define inbound identity; Vendor Schedule seeds expected timing used with job frequency; Vendor Notification drives late-file chase.",
        nodes: [
          { id: "open", kind: "start", title: "Open intake configuration", meta: "Role-gated writes", detail: "Most personas read Inventory; Admin/DAC typically maintain schedules and FTP mappings." },
          { id: "ftp", kind: "action", title: "FTP Accounts", meta: "Active / Termed / Shared", detail: "Inbound credentials and paths. Shared FTP with multiple clients is a Global FTP Account." },
          { id: "sched", kind: "action", title: "Vendor Schedule", meta: "Expected timing defaults", detail: "Used when OM Job Automation creates S3 jobs from IFR, unless the account-vendor is on the exception list." },
          { id: "notif", kind: "action", title: "Vendor Notification", meta: "Late-file communication", detail: "Pairs with Missed tabs and grace period." },
          { id: "expect", kind: "system", title: "Feeds Expected Date behaviour", meta: "With job frequency", jump: "files:missed", detail: "Expected Date, grace period, and tolerance days decide when a file becomes Missed." },
          { id: "inv", kind: "exit", title: "Back to File Inventory", meta: "Listing and staged tabs", jump: "files:inventory", detail: "Intake setup is upstream of what Inventory shows and when rows go Missed." },
        ],
        layout: {
          open: [1, 1], ftp: [2, 1], sched: [2, 2], notif: [2, 3], expect: [3, 1], inv: [4, 1],
        },
        edges: [
          ["open", "ftp"], ["open", "sched"], ["open", "notif"],
          ["ftp", "expect"], ["sched", "expect"], ["notif", "expect"], ["expect", "inv"],
        ],
      },
    ],
  },

  /* =========================== BLINDING STATUS =========================== */
  {
    id: "blinding",
    tab: "11 · Blinding Status",
    views: [
      {
        id: "status",
        tab: "Run status",
        title: "Blinding Status",
        route: "/blindingStatus/index",
        summary:
          "A focused monitoring module for blinding runs. Status tabs separate healthy runs from failures, and the grid carries enough context to route a failure onward.",
        nodes: [
          { id: "open", kind: "start", title: "Open Blinding Status", meta: "Top-level module", detail: "A narrow module reached directly from the navigation." },
          { id: "scope", kind: "system", title: "Monitoring only", meta: "No configuration here", detail: "Nothing is triggered from this screen; it reports on runs started elsewhere." },
          { id: "tab", kind: "action", title: "Completed, Failed, or Running", meta: "Status tabs", detail: "Failed is the operational entry point; Running shows work still in progress." },
          { id: "date", kind: "action", title: "Filter by Date Created", meta: "Optional", detail: "Narrows a busy grid to the period being investigated." },
          { id: "search", kind: "action", title: "Search", meta: "Submit", detail: "Returns the runs matching the tab and date filter." },
          { id: "grid", kind: "system", title: "Status grid returned", meta: "Job ID, status, message, locations", detail: "Treat file locations as sensitive and use placeholders in any evidence." },
          { id: "row", kind: "action", title: "Open a run", meta: "Detail view", detail: "Confirms which job and which files the run covered." },
          { id: "detail", kind: "system", title: "Step messages and file paths", meta: "Diagnosis", detail: "The message is what distinguishes a data problem from an infrastructure one." },
          { id: "state", kind: "decision", title: "What state is the run in?", meta: "Completed, failed, or running", detail: "The three outcomes lead to genuinely different next actions." },
          { id: "fail", kind: "exception", title: "Failed run", meta: "Retrigger or raise a defect", detail: "A failure can place dependent work on hold until it is resolved." },
          { id: "run", kind: "system", title: "Still running", meta: "Recheck later", detail: "Long-running is not the same as failed; compare against the usual duration." },
          { id: "ok", kind: "exit", title: "Completed run unblocks the flow", meta: "Implementation path", jump: "processing:jetstore", detail: "A successful blinding/JetStore-related run lets the documented Implementation Test Harness flow continue. See JetStore Integration under Processing Dashboard for the full harness evaluation path." },
        ],
        layout: {
          open: [1, 1], scope: [1, 2], tab: [2, 1], date: [2, 2], search: [3, 1],
          grid: [3, 2], row: [4, 1], detail: [4, 2], state: [5, 1], fail: [5, 2],
          run: [5, 3], ok: [5, 4],
        },
        edges: [
          ["open", "scope"], ["scope", "tab"], ["tab", "date"], ["date", "search"],
          ["search", "grid"], ["grid", "row"], ["row", "detail"], ["detail", "state"],
          ["state", "fail", "failed"], ["state", "run", "running"], ["state", "ok", "completed"],
        ],
      },
    ],
  },
];

const KINDS = [
  ["start", "entry point", "var(--violet)"],
  ["action", "user action", "var(--blue)"],
  ["system", "system result", "var(--emerald)"],
  ["decision", "decision", "var(--amber)"],
  ["exception", "exception path", "var(--rose)"],
  ["exit", "hand-off to another view", "var(--indigo)"],
];
