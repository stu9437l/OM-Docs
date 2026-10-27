/* Salesforce integration flows — MODULES -> views -> nodes / layout / edges.
   Grounded in Confluence 3224996412, 3265825842, 3179348294, 3224995843,
   repo_om_sales_force/DeermineCreator.apxc, OM-Module-Dependency-Matrix,
   CGT Client Gateway Overview.pptx, SF & Jira Mapping For Case and IFR.xlsx. */

const MODULES = [
  {
    id: "map",
    tab: "Architecture",
    views: [
      {
        id: "map",
        tab: "Systems",
        title: "Salesforce integration landscape",
        summary:
          "Salesforce is the CRM source for accounts and vendor hierarchy. OMSF Gateway mediates bidirectional sync on a ~15-minute cron. OM consumes data into operational modules; Jira receives custom-field updates.",
        nodes: [
          { id: "sf", kind: "start", title: "Salesforce", meta: "CRM + Apex", jump: "sf-to-om", detail: "Accounts (Current Client), Vendor hierarchy, Cases, Contacts, Vendor File IFR trigger." },
          { id: "cron", kind: "system", title: "AWS Lambda cron", meta: "~15 min schedule", detail: "Invokes OMSF Gateway sync endpoints on a recurring schedule." },
          { id: "gw", kind: "system", title: "OMSF Gateway", meta: "ArgoCD deployed", jump: "sf-to-om", detail: "REST bridge: vendorSyncSF, syncAccountSfToOm, accountSyncSF, resync/syncSF. Logs in ArgoCD and OpenSearch." },
          { id: "om", kind: "action", title: "Operations Manager", meta: "Accounts, Vendor, FM, Jobs", detail: "om.accounts and om.vendor* tables. Vendor dropdown in Jobs; File Inventory from synced vendor files." },
          { id: "jira", kind: "action", title: "Jira", meta: "Custom fields", jump: "jira", detail: "dataVendor, clientName (LEG), accountApplication (DDTC) updated via ScriptRunner REST." },
          { id: "ifr", kind: "exit", title: "IFR / Jira", meta: "Vendor File → Jira", jump: "ifr", detail: "DeermineCreator Apex creates IFR from Vendor_File__c. See IFR flow module." },
          { id: "alert", kind: "exception", title: "Sync failure alerts", meta: "Exception mail API", detail: "Gateway auth or mapping failures trigger email notifications." },
          { id: "sso", kind: "system", title: "Microsoft Entra SSO", meta: "SAML to Salesforce", detail: "CAS SSO path for CG Analytics login." },
        ],
        layout: {
          sf: [1, 2], cron: [2, 1], gw: [2, 2], om: [3, 1], jira: [3, 3],
          ifr: [4, 2], alert: [3, 2], sso: [1, 1],
        },
        edges: [
          ["sf", "gw"], ["cron", "gw"], ["gw", "om"], ["gw", "jira"], ["sf", "jira"],
          ["sf", "ifr"], ["gw", "alert", "on failure"], ["sso", "sf"],
          ["om", "gw", "outbound"],
        ],
      },
    ],
  },

  {
    id: "sf-to-om",
    tab: "SF → OM",
    views: [
      {
        id: "vendor",
        tab: "Vendor tree",
        title: "Salesforce to OM — vendor hierarchy sync",
        summary:
          "Cron or manual resync pulls vendor changes from Salesforce into OM. Parent records must exist before children. SF deletion sets is_deleted=1 in OM.",
        nodes: [
          { id: "trigger", kind: "start", title: "Cron or resync triggered", meta: "Every ~15 min", detail: "GET /vendor/vendorSyncSF syncs all vendors and associated objects. Resync: /resync/syncSF?object=&objectId=" },
          { id: "vendor", kind: "action", title: "Vendor synced", meta: "Number, Name, IT Vendor Name", detail: "Match on Vendor Number for update/delete. IT Vendor Name auto-populated in SF UI." },
          { id: "contact", kind: "action", title: "Vendor Contact synced", meta: "Requires vendor in OM", detail: "Vendor Contact Number, Name, Email, Global flag. Parent Vendor Number must exist." },
          { id: "rel", kind: "action", title: "Vendor Relationship synced", meta: "Account link + SFTP", detail: "Legal agreements, SFTP credentials, up to 5 contacts, group name, NDA." },
          { id: "file", kind: "action", title: "Vendor File synced", meta: "File metadata", detail: "File type, frequency, layout, billable, Jira ticket fields, expected/received dates." },
          { id: "omdb", kind: "system", title: "OM database updated", meta: "om.vendor*", detail: "Records available to Vendor module, Jobs vendor dropdown, and File Manager." },
          { id: "jira", kind: "exit", title: "Jira dataVendor updated", meta: "LEG project", jump: "jira", detail: "Vendor add/update/delete propagates to Jira custom field in parallel sync path." },
          { id: "fail", kind: "exception", title: "Sync failure", meta: "Exception email", detail: "Missing parent, inactive user, or gateway auth failure sends alert." },
        ],
        layout: {
          trigger: [1, 1], vendor: [2, 1], contact: [3, 1], rel: [4, 1],
          file: [5, 1], omdb: [6, 1], jira: [6, 2], fail: [4, 2],
        },
        edges: [
          ["trigger", "vendor"], ["vendor", "contact"], ["contact", "rel"],
          ["rel", "file"], ["file", "omdb"], ["omdb", "jira"], ["rel", "fail", "missing parent"],
        ],
      },
      {
        id: "account",
        tab: "Account",
        title: "Salesforce to OM — account sync",
        summary:
          "Current Client accounts only. Updates team picklists, segments, and Name in Salesforce. Match by Acronym or NameInSalesforce.",
        nodes: [
          { id: "edit", kind: "start", title: "SF Account updated", meta: "Current Client type", detail: "Client Success Lead, Data Team, EDM, Onshore, Vendor Manager, CSOL, DOS, Market Segment." },
          { id: "cron", kind: "system", title: "Cron invokes sync", meta: "syncAccountSfToOm", detail: "Update-only endpoint; triggered every ~15 minutes." },
          { id: "validate", kind: "decision", title: "User validation", meta: "Active + correct role", detail: "CS Lead/CSOL must be Account Manager in OM. All referenced users must be active." },
          { id: "match", kind: "system", title: "Match account in OM", meta: "Acronym or NameInSalesforce", detail: "Search Acronym first, else Name in Salesforce field." },
          { id: "impl", kind: "action", title: "Implementation Manager", meta: "HBA or VBCA only", detail: "If both products exist, sync HBA only." },
          { id: "om", kind: "exit", title: "OM Accounts updated", meta: "Feeds ticket creation", detail: "Team assignments and segments drive Production Manager and SLA behavior." },
          { id: "reject", kind: "exception", title: "Skipped", meta: "Not Current Client", detail: "Non-Current accounts are excluded from sync." },
        ],
        layout: {
          edit: [1, 1], cron: [2, 1], validate: [3, 1], match: [4, 1],
          impl: [5, 1], om: [6, 1], reject: [3, 2],
        },
        edges: [
          ["edit", "cron"], ["cron", "validate"], ["validate", "match", "pass"],
          ["validate", "reject", "fail"], ["match", "impl"], ["impl", "om"],
        ],
      },
    ],
  },

  {
    id: "om-to-sf",
    tab: "OM → SF",
    views: [
      {
        id: "account",
        tab: "Account outbound",
        title: "OM to Salesforce — account sync",
        summary:
          "When OM account team fields change, cron pushes updates to Salesforce. SF user profiles must match (AM and IM, Vendor Management, TPM).",
        nodes: [
          { id: "edit", kind: "start", title: "OM Account edited", meta: "Accounts module", detail: "Admin/CPM updates team picklists, Acronym, Data Manager." },
          { id: "cron", kind: "system", title: "Cron or resync", meta: "accountSyncSF", detail: "Resync single account: /resync/syncSF?acronym=&object=account&accountNameInSF=" },
          { id: "validate", kind: "decision", title: "SF profile check", meta: "AM/IM, VM, TPM", detail: "Each field maps to allowed Salesforce profiles." },
          { id: "match", kind: "system", title: "Match in Salesforce", meta: "Acronym or Name", detail: "Search Acronym first, else account name." },
          { id: "usdm", kind: "action", title: "USDM picklist sync", meta: "/account/syncUSDM", detail: "Data Manager values pushed to SF account picklist when USDM changes." },
          { id: "sf", kind: "exit", title: "Salesforce account updated", meta: "Current Client", detail: "Bidirectional consistency maintained with inbound sync." },
          { id: "jira", kind: "exit", title: "Jira accountApplication", meta: "If apps changed", jump: "jira", detail: "OM application add/update/disable updates DDTC custom field." },
        ],
        layout: {
          edit: [1, 1], cron: [2, 1], validate: [3, 1], match: [4, 1],
          usdm: [5, 1], sf: [6, 1], jira: [6, 2],
        },
        edges: [
          ["edit", "cron"], ["cron", "validate"], ["validate", "match"],
          ["match", "usdm"], ["usdm", "sf"], ["edit", "jira", "app change"],
        ],
      },
    ],
  },

  {
    id: "ifr",
    tab: "IFR / Jira",
    views: [
      {
        id: "create",
        tab: "Create IFR",
        title: "Vendor File to Jira IFR ticket",
        summary:
          "Salesforce Apex (repo_om_sales_force) creates a Jira IFR from Vendor_File__c with 39 mapped fields. Create Jira button on Vendor File record.",
        nodes: [
          { id: "vf", kind: "start", title: "Vendor File in Salesforce", meta: "Vendor File record", detail: "File Layout Name, Date Interval, File Fees, Create Jira button. Vendor relationship and metadata complete." },
          { id: "check", kind: "decision", title: "Jira ticket exists?", meta: "Deermine_Ticket__c", detail: "DeermineCreator.apxc skips if Deermine_Ticket__c already set." },
          { id: "skip", kind: "exception", title: "Already linked", meta: "No duplicate IFR", detail: "Debug log: Jira # exists for vendor file id." },
          { id: "build", kind: "action", title: "Jira IFR Creator.build", meta: "DeermineCreator.apxc", detail: "createDeermineIssue: IFR tracker id=11, 22 custom fields via DeermineCustomField.apxc." },
          { id: "auth", kind: "system", title: "CAS → Jira", meta: "DeerwalkAuth.apxc", detail: "TGT/ST via callout:CAS_LOGIN_URL. DeermineRequest handles 302 cookie redirects." },
          { id: "assign", kind: "decision", title: "Resolve assignee", meta: "Account Manager email", detail: "DeermineQueryService → DeermineRequest.getAssigneeId. Null aborts." },
          { id: "post", kind: "system", title: "POST /issues.json", meta: "HttpClient.apxc", detail: "DeermineRequest.postIssue in Data Development project from account Data Team." },
          { id: "write", kind: "system", title: "Write Jira ID to SF", meta: "SFRequest.apxc", detail: "updateTicketInVendorFile → Deermine_Ticket__c. Jira ID written back to Vendor File." },
          { id: "fm", kind: "exit", title: "OM File Manager follow-up", meta: "Job setup path", detail: "IFR drives S3 job configuration and file inventory in OM." },
        ],
        layout: {
          vf: [1, 1], check: [2, 1], skip: [2, 2], build: [3, 1], auth: [4, 1],
          assign: [5, 1], post: [6, 1], write: [7, 1], fm: [8, 1],
        },
        edges: [
          ["vf", "check"], ["check", "skip", "exists"], ["check", "build", "empty"],
          ["build", "auth"], ["auth", "assign"], ["assign", "post", "found"], ["post", "write"], ["write", "fm"],
        ],
      },
    ],
  },

  {
    id: "jira",
    tab: "SF ↔ Jira",
    views: [
      {
        id: "sf-jira",
        tab: "From Salesforce",
        title: "Salesforce to Jira custom fields",
        summary:
          "When SF Accounts or Vendors change, OMSF Gateway updates Jira picklists via ScriptRunner REST endpoints.",
        nodes: [
          { id: "change", kind: "start", title: "SF record change", meta: "Account or Vendor", detail: "Create, update, or delete in Salesforce during sync window." },
          { id: "gw", kind: "system", title: "OMSF Gateway", meta: "Part of sync pipeline", detail: "Processes change alongside OM database update." },
          { id: "vendor", kind: "action", title: "dataVendor field", meta: "LEG project", detail: "POST customFieldAdd/Update/Delete with vendor name." },
          { id: "client", kind: "action", title: "clientName field", meta: "ACC - Account Name", detail: "Only when account type is Current Client. Disabled if type changes." },
          { id: "done", kind: "exit", title: "Jira picklists current", meta: "Issue creation ready", detail: "Jira issues can reference synced vendor and client values." },
        ],
        layout: {
          change: [1, 1], gw: [2, 1], vendor: [3, 1], client: [3, 2], done: [4, 1],
        },
        edges: [
          ["change", "gw"], ["gw", "vendor"], ["gw", "client"], ["vendor", "done"], ["client", "done"],
        ],
      },
      {
        id: "om-jira",
        tab: "From OM",
        title: "OM to Jira accountApplication",
        summary:
          "When OM account applications are added, updated, or disabled, Jira DDTC accountApplication picklist is updated.",
        nodes: [
          { id: "change", kind: "start", title: "OM application change", meta: "Add / update / disable", detail: "Account application hierarchy modified in OM Accounts module." },
          { id: "add", kind: "action", title: "Application Add", meta: "customFieldAdd", detail: "Value format: Acronym - AccountName - Application Name." },
          { id: "update", kind: "action", title: "Application Update", meta: "customFieldUpdate", detail: "oldValue and newValue arrays for renamed applications." },
          { id: "disable", kind: "action", title: "Application disable", meta: "customFieldDelete", detail: "Removes value from DDTC accountApplication picklist." },
          { id: "done", kind: "exit", title: "Jira field synchronized", meta: "DDTC project", detail: "Jira issues can filter by account application." },
        ],
        layout: {
          change: [1, 1], add: [2, 1], update: [2, 2], disable: [2, 3], done: [3, 1],
        },
        edges: [
          ["change", "add", "add"], ["change", "update", "update"], ["change", "disable", "disable"],
          ["add", "done"], ["update", "done"], ["disable", "done"],
        ],
      },
    ],
  },

  {
    id: "cases",
    tab: "Case automation",
    views: [
      {
        id: "routing",
        tab: "Owner routing",
        title: "Salesforce Case — owner assignment",
        summary:
          "14 routing rules assign cases to queues or account owners based on Product, Origin, Request Type, and account fields.",
        nodes: [
          { id: "create", kind: "start", title: "Case created", meta: "Web origin typical", detail: "Product and Request Type drive all downstream automation." },
          { id: "bu", kind: "system", title: "Business unit assigned", meta: "By Product", detail: "Cap Admin, Analytics, or Pop Health based on product line." },
          { id: "route", kind: "decision", title: "Routing rules evaluated", meta: "14 conditions", detail: "NGO/VCR → VM queue or account VM. CCT/ASD → IM, VM, or EDM ATPM based on account fields." },
          { id: "queue", kind: "action", title: "Assigned to queue", meta: "Capitation, Analytics, Pop Health, VM", detail: "Queue ID prefix 00G. User takeover (005) moves status New → In Progress." },
          { id: "owner", kind: "action", title: "Assigned to account owner", meta: "IM, VM, EDM ATPM", detail: "When account fields are populated and rules match." },
          { id: "notify", kind: "system", title: "Notification emails", meta: "By Notification Type", detail: "Case contact, owner, and account contacts by product-specific notification type." },
          { id: "entitle", kind: "system", title: "Entitlement set", meta: "By Product", detail: "Analytics, Pop Health, or Cap Admin entitlement drives milestones." },
          { id: "close", kind: "exit", title: "Lifecycle complete", meta: "Milestones + auto-close", detail: "Client Acceptance auto-closes after 30 days. Milestone notification emails are disabled." },
        ],
        layout: {
          create: [1, 1], bu: [2, 1], route: [3, 1], queue: [4, 1],
          owner: [4, 2], notify: [5, 1], entitle: [5, 2], close: [6, 1],
        },
        edges: [
          ["create", "bu"], ["bu", "route"], ["route", "queue", "queue match"],
          ["route", "owner", "owner match"], ["queue", "notify"], ["owner", "notify"],
          ["notify", "entitle"], ["entitle", "close"],
        ],
      },
    ],
  },

  {
    id: "community",
    tab: "Client Gateway",
    views: [
      {
        id: "portal",
        tab: "Portal login",
        title: "Client Gateway / Community Page",
        summary:
          "Client-facing Salesforce Experience Cloud portal. CAS SSO, rebranded Welcome to Client Gateway.",
        nodes: [
          { id: "site", kind: "start", title: "Client Portal URL", meta: "Experience Cloud", detail: "UAT: cedargate--cguatfull.sandbox.my.site.com/ClientPortal/s/ · PROD: cedargate.my.site.com/ClientPortal/s/. All Sites → Client Portal." },
          { id: "sso", kind: "action", title: "Login With CG Single Sign-On", meta: "CAS redirect", detail: "Redirects to CAS when password not saved. User needs SF product access in User Management." },
          { id: "home", kind: "system", title: "Portal home", meta: "Support · Knowledge · Ask", detail: "Top nav: Client Gateway. Support (Cases), Knowledge (Training), Ask a Question, Reports." },
          { id: "support", kind: "action", title: "Support module", meta: "Renamed Cases", detail: "Create/view/update support cases from portal." },
          { id: "knowledge", kind: "action", title: "Knowledge base", meta: "Renamed Training", detail: "Browse topics or search articles and documentation." },
          { id: "ask", kind: "exit", title: "Ask a Question", meta: "Help resources", detail: "Getting started guides under Ask a Question tab." },
        ],
        layout: {
          site: [1, 1], sso: [2, 1], home: [3, 1], support: [4, 1], knowledge: [4, 2], ask: [5, 1],
        },
        edges: [
          ["site", "sso"], ["sso", "home"], ["home", "support"], ["home", "knowledge"], ["home", "ask"],
        ],
      },
      {
        id: "ngo",
        tab: "NGO / VCR",
        title: "Group Onboarding and Vendor Change Requests",
        summary:
          "Clients submit New Group Onboarding (NGO) or Vendor Change Request (VCR) with Data Feeds. Case assigned to Account VM; VM creates VR, Vendor Files, and IFR.",
        nodes: [
          { id: "start", kind: "start", title: "Client selects NGO or VCR", meta: "HBA / VBCA only", detail: "Request New Group Onboarding or Vendor Change from portal. Password-protected PHI files supported." },
          { id: "fields", kind: "action", title: "Mandatory fields + Data Feeds", meta: "Crosswalk attachments", detail: "Subject: Group Name, Vendor, Data Type. New Data Feeds for vendor contacts. Upload Files for crosswalk." },
          { id: "create", kind: "system", title: "Case created in Salesforce", meta: "My Cases queue", detail: "Case listed under My Cases in dashboard after submit." },
          { id: "vm", kind: "action", title: "Assigned to Account VM", meta: "Routing rule", detail: "NGO/VCR cases route to account Vendor Manager (or VM queue)." },
          { id: "vr", kind: "action", title: "VM creates VR + Vendor Files", meta: "Salesforce back-office", detail: "Vendor Relationship, Vendor Files generated. Create Jira spawns IFR in DDT Jira project." },
          { id: "email", kind: "system", title: "Introduction email", meta: "Client + vendor", detail: "Client must send introduction email connecting vendor contacts alongside case." },
          { id: "done", kind: "exit", title: "Operational follow-up", meta: "IFR + File Manager", jump: "ifr", detail: "IFR drives job setup and file inventory in OM." },
        ],
        layout: {
          start: [1, 1], fields: [2, 1], create: [3, 1], vm: [4, 1], vr: [5, 1], email: [5, 2], done: [6, 1],
        },
        edges: [
          ["start", "fields"], ["fields", "create"], ["create", "vm"], ["vm", "vr"], ["vr", "email"], ["vr", "done"],
        ],
      },
      {
        id: "cct-asd",
        tab: "CCT / ASD",
        title: "Control Total and Account Structure Digest",
        summary:
          "Client uploads Account Structure Digest documents and submits Client Control Total cases. VM reviews; client provides feedback via case Post comments.",
        nodes: [
          { id: "asd", kind: "start", title: "Account Structure Digest upload", meta: "ASD case", detail: "Attach docs: Division Type, Plan Type, Employee Status Benefits. View all attachments for download/delete." },
          { id: "review", kind: "action", title: "VM reviews documents", meta: "Case open", detail: "VM team opens case to review attached ASD documents." },
          { id: "comment", kind: "system", title: "Client feedback via Post", meta: "Case feed", detail: "Client writes comment in Post section with approval or feedback." },
          { id: "cct", kind: "action", title: "Client Control Total case", meta: "Expected Run Out", detail: "Mandatory Expected Run Out Period from previous vendor. Guidance on Subject field format." },
          { id: "close", kind: "exit", title: "Case lifecycle", meta: "Support module", jump: "cases", detail: "Standard case milestones and auto-close rules apply." },
        ],
        layout: {
          asd: [1, 1], review: [2, 1], comment: [3, 1], cct: [4, 1], close: [5, 1],
        },
        edges: [
          ["asd", "review"], ["review", "comment"], ["comment", "cct"], ["cct", "close"],
        ],
      },
    ],
  },

  {
    id: "legal",
    tab: "Legal → Jira",
    views: [
      {
        id: "leg",
        tab: "LEG ticket",
        title: "Legal Agreement to Jira LEG project",
        summary:
          "Vendor Relationship Legal Agreements create LEG-type Jira tickets with field mapping to Salesforce.",
        nodes: [
          { id: "vr", kind: "start", title: "Legal Agreement on VR", meta: "Related tab", detail: "Legal Agreement section on Vendor Relationship. Name: ClientAcronym-Vendor-Group-LegalType." },
          { id: "create", kind: "action", title: "Create Ticket clicked", meta: "All legal agreements", detail: "Create Jira button on every legal agreement record." },
          { id: "jira", kind: "system", title: "LEG Jira created", meta: "LEG project", detail: "Initial Date = ticket created date. Ticket field = Jira URL." },
          { id: "map", kind: "system", title: "Field mapping SF → Jira", meta: "Summary, Status, Legal Type…", detail: "Summary=Legal Agreement Name, Client Name=VR Account, Legal Type→Agreement Type, Signature fields synced. Global Agreement=No default." },
          { id: "open", kind: "exit", title: "Ticket URL opens Jira", meta: "New tab", detail: "Click Jira URL opens ticket in Jira with synced fields." },
        ],
        layout: {
          vr: [1, 1], create: [2, 1], jira: [3, 1], map: [4, 1], open: [5, 1],
        },
        edges: [
          ["vr", "create"], ["create", "jira"], ["jira", "map"], ["map", "open"],
        ],
      },
    ],
  },

  {
    id: "datachannel",
    tab: "Data Channel",
    views: [
      {
        id: "iosd",
        tab: "IOSD",
        title: "Data Channel IOSD creation",
        summary:
          "VM users create IOSD tickets from Data Channel. RemoteSync features spawn RemoteSync FTP Setup Requests Jira tickets.",
        nodes: [
          { id: "login", kind: "start", title: "VM user opens Data Channel", meta: "Role-gated", detail: "Create IOSD button visible only for authorized VM users." },
          { id: "fill", kind: "action", title: "Enter required fields", meta: "Feature selection", detail: "RemoteSync Normal, DeleteSrcl, DelayDelete, MoveWithinSrc each create FTP setup Jira." },
          { id: "create", kind: "system", title: "Create IOSD", meta: "Jira ticket", detail: "IOSD Jira ticket created on button click." },
          { id: "nosync", kind: "exception", title: "Post-create edits not synced", meta: "By design", detail: "Updating Data Channel fields after ticket creation does not sync to Jira." },
          { id: "dup", kind: "exception", title: "Duplicate name blocked", meta: "Validation", detail: "Same Data Channel name cannot be created twice." },
        ],
        layout: {
          login: [1, 1], fill: [2, 1], create: [3, 1], nosync: [4, 1], dup: [4, 2],
        },
        edges: [
          ["login", "fill"], ["fill", "create"], ["create", "nosync"], ["fill", "dup", "duplicate name"],
        ],
      },
    ],
  },

  {
    id: "sf-jira-mapping",
    tab: "SF ↔ Jira mapping",
    views: [
      {
        id: "projects",
        tab: "Project Mapping",
        title: "Salesforce Product → Jira project",
        summary:
          "SF Product and Internal Project determine the target Jira project. Data Team NGO/VCR/GTR/CCT/ASD cases map to DDT* projects.",
        nodes: [
          { id: "sf", kind: "start", title: "SF Product / Internal Project", meta: "Case or IFR context", detail: "Product picklist and Internal Project determine target Jira project." },
          { id: "cap", kind: "action", title: "Capitation Administration", meta: "CAPD · CAAST · CAWING", detail: "Cap Admin cases split across CAPD, CAAST, CAWING per internal project." },
          { id: "analytics", kind: "action", title: "HBA / VBCA Analytics", meta: "AP · PCC", detail: "Healthcare Benefits Analytics and Value-Based Care Analytics → Analytics Platform." },
          { id: "care", kind: "action", title: "Care Management", meta: "ECF · CMD · CAREUM", detail: "Care Coordination, Clinical Decision Support, Utilization Management projects." },
          { id: "legal", kind: "action", title: "Legal Agreements", meta: "LEG project", jump: "legal", detail: "Legal Agreement Create Ticket → LEG with field mapping." },
          { id: "ddt", kind: "action", title: "Data Team cases", meta: "DDTC · DDTD · DDTE…", detail: "NGO, VCR, GTR, CCT, ASD, Feature, Bug, Research request types route to Data Team projects." },
          { id: "done", kind: "exit", title: "Jira issue created", meta: "Per-project rules", jump: "jira", detail: "Request Type maps to issueType based on target Jira project." },
        ],
        layout: {
          sf: [1, 2], cap: [2, 1], analytics: [2, 2], care: [2, 3], legal: [3, 1], ddt: [3, 3], done: [4, 2],
        },
        edges: [
          ["sf", "cap"], ["sf", "analytics"], ["sf", "care"], ["sf", "legal"], ["sf", "ddt"],
          ["cap", "done"], ["analytics", "done"], ["care", "done"], ["legal", "done"], ["ddt", "done"],
        ],
      },
      {
        id: "ifr-map",
        tab: "IFR Mapping",
        title: "Vendor File → Jira IFR (39 fields)",
        summary:
          "Type = Implementation File Receipt. Summary from Name (+ Historical). Parent from VM_Case_ID. Jira Closed → SF File Status Received.",
        nodes: [
          { id: "vf", kind: "start", title: "Vendor File in SF", meta: "Create Jira button", jump: "ifr", detail: "User clicks Create Jira when Deermine_Ticket__c is empty." },
          { id: "project", kind: "action", title: "Project from Data Team", meta: "DDT* projects", detail: "Account Data Team picklist selects DDT project (DDTC, DDTD, DDTE, DDTH, DDTG…)." },
          { id: "fields", kind: "action", title: "22+ custom fields mapped", meta: "DeermineCustomField.apxc", detail: "File Type, Frequency, Data Vendor, Layout, SFTP, Legal Agreements, Billable, Date Interval, etc." },
          { id: "parent", kind: "system", title: "Parent = NGO Case Jira", meta: "VM_Case_ID__c", detail: "Links IFR to parent issue from Vendor Relationship VM Case ID." },
          { id: "post", kind: "system", title: "POST issue to Jira", meta: "Implementation File Receipt", detail: "Assignee = Jira Creator (button clicker). Priority Normal, Status New." },
          { id: "reverse", kind: "exit", title: "Jira Closed → SF Received", meta: "Bidirectional status", detail: "When Jira status is Closed, SF File Status (Overall_Status__c) is set to Received." },
        ],
        layout: {
          vf: [1, 1], project: [2, 1], fields: [3, 1], parent: [4, 1], post: [5, 1], reverse: [6, 1],
        },
        edges: [
          ["vf", "project"], ["project", "fields"], ["fields", "parent"], ["parent", "post"], ["post", "reverse"],
        ],
      },
      {
        id: "case-map",
        tab: "Case sync",
        title: "Case ↔ Jira field sync rules",
        summary:
          "Common pattern: Request Type→issueType, Subject→Summary, Status/Priority/Description/Client Name with SF↔Jira direction flags per project.",
        nodes: [
          { id: "create", kind: "start", title: "SF Case created/updated", meta: "Web or internal", jump: "cases", detail: "Product determines Jira project via Project Mapping." },
          { id: "type", kind: "action", title: "Request Type → issueType", meta: "Per-project rules", detail: "Bug→Bug; Support/Feature/Prof Services→Story or Support (varies by project, e.g. ECF/CMGR use Support for bugs)." },
          { id: "fields", kind: "action", title: "Core fields synced", meta: "Subject · Status · Priority", detail: "Subject→Summary, Priority→Priority, Description→Description, Client=Acronym - Account Name." },
          { id: "status", kind: "decision", title: "Status bidirectional", meta: "Per-project rules", detail: "SF New/In Development→Jira Open; Jira Done/Closed→SF Closed/Client Acceptance (CAPD, CAIM, LEG differ)." },
          { id: "feed", kind: "system", title: "Feed + comments", meta: "Bidirectional sync", detail: "Comments sync to Jira feed; HTML tags and large attachments may fail sync." },
          { id: "done", kind: "exit", title: "Issues linked", meta: "SF ↔ Jira sync", jump: "jira", detail: "Bidirectional case sync and feed share between Salesforce and Jira." },
        ],
        layout: {
          create: [1, 1], type: [2, 1], fields: [3, 1], status: [4, 1], feed: [5, 1], done: [6, 1],
        },
        edges: [
          ["create", "type"], ["type", "fields"], ["fields", "status"], ["status", "feed"], ["feed", "done"],
        ],
      },
      {
        id: "dc-map",
        tab: "Data Channel",
        title: "Data Channel → Jira IOSD mapping",
        summary:
          "Feature→SyncType (RemoteSync, ReverseSync, ClientPush). FTP URLs, Port, Destination Path, Client Name, Data Vendor mapped per issue type.",
        nodes: [
          { id: "dc", kind: "start", title: "Data Channel record", meta: "VM user", jump: "datachannel", detail: "Create IOSD button visible for authorized VM users." },
          { id: "feature", kind: "action", title: "Feature → SyncType", meta: "RemoteSync · ReverseSync", detail: "RemoteSync Normal, DeleteSrcl, DelayDelete, MoveWithinSrc each spawn FTP setup Jira tickets." },
          { id: "ftp", kind: "action", title: "FTP field mapping", meta: "ClientFTP · CedarGateFTP", detail: "Outgoing Channel URL→ClientFTP URL; CedarGate FTP URL; Port; Destination Path." },
          { id: "meta", kind: "system", title: "Client + Vendor", meta: "Account · Vendor", detail: "Account→Client Name; Vendor→Data Vendor on IOSD ticket." },
          { id: "nosync", kind: "exception", title: "Post-create edits", meta: "Not synced", detail: "Updating Data Channel after ticket creation does not sync to Jira." },
        ],
        layout: {
          dc: [1, 1], feature: [2, 1], ftp: [3, 1], meta: [4, 1], nosync: [4, 2],
        },
        edges: [
          ["dc", "feature"], ["feature", "ftp"], ["ftp", "meta"], ["meta", "nosync"],
        ],
      },
    ],
  },

  {
    id: "regression",
    tab: "Regression map",
    views: [
      {
        id: "map",
        tab: "Checklist 18.7.0",
        title: "SalesForce Regression Checklist module map",
        summary:
          "15 test modules from the regression checklist mapped to integration flows and repo_om_sales_force. Click a module tab above to drill into each flow.",
        nodes: [
          { id: "repo", kind: "start", title: "repo_om_sales_force", meta: "11 Apex classes", jump: "ifr", detail: "DeermineCreator, DeermineRequest, DeerwalkAuth, SFRequest, DeermineQueryService, DeermineCustomField, DeermineUtils, HttpClient, DeermineConstants + tests." },
          { id: "cases", kind: "action", title: "Cases (569)", meta: "Largest module", jump: "cases", detail: "Login, queues, routing, milestones, NGO/VCR/CCT/ASD." },
          { id: "sfjira", kind: "action", title: "SF-JIRA SYNC (158)", meta: "Bidirectional", jump: "jira", detail: "Case↔Jira, feed share, Legal Agreement LEG tickets." },
          { id: "vfiles", kind: "action", title: "Vendor Files (163)", meta: "Create Jira/IFR", jump: "ifr", detail: "Maps to DeermineCreator Apex. File Fees, Date Interval, Employee Lives fields." },
          { id: "community", kind: "action", title: "Community (136)", meta: "Client Gateway", jump: "community", detail: "SSO, Support, Knowledge, Ask a Question." },
          { id: "accounts", kind: "action", title: "Accounts (82)", meta: "OM→SF picklists", jump: "sf-to-om", detail: "Data Team OM→SF only. Data Manager by team." },
          { id: "api", kind: "system", title: "Api (86)", meta: "Mass case REST", detail: "Case+datafeed creation, vendor list API, mandatory field validation." },
          { id: "vendor", kind: "action", title: "Vendor + VR (84)", meta: "IT Vendor Name", jump: "sf-to-om", detail: "21 Vendor + 63 VR tests. Generate Vendor Files, VM Case ID." },
          { id: "gateway", kind: "exit", title: "OMSF Gateway sync", meta: "Outside Apex repo", jump: "sf-to-om", detail: "vendorSyncSF, syncAccountSfToOm documented in Confluence — not in repo_om_sales_force." },
        ],
        layout: {
          repo: [1, 2], cases: [2, 1], sfjira: [2, 2], vfiles: [2, 3],
          community: [3, 1], accounts: [3, 2], api: [3, 3], vendor: [4, 1], gateway: [4, 3],
        },
        edges: [
          ["repo", "vfiles"], ["cases", "sfjira"], ["vfiles", "gateway"], ["accounts", "gateway"],
          ["vendor", "gateway"], ["sfjira", "gateway"], ["community", "cases"],
        ],
      },
    ],
  },
];

const KINDS = [
  ["start", "entry / trigger", "var(--violet)"],
  ["action", "sync action", "var(--blue)"],
  ["system", "system result", "var(--emerald)"],
  ["decision", "validation / branch", "var(--amber)"],
  ["exception", "failure / skip", "var(--rose)"],
  ["exit", "hand-off", "var(--indigo)"],
];
