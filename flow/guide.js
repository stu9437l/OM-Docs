/* OM user-guide text per module.
   Condensed from Confluence Operations Manager Documentation (local KB mirror).
   Identifiers in examples are placeholders — no PHI/FI.
*/
const GUIDES = {
  "map": {
    "title": "OM shell — user guide",
    "sources": [
      {
        "title": "User Manual - Operations Manager",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3322577475",
        "id": "3322577475"
      },
      {
        "title": "Operations Manager Documentation Parent Page",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3067544725",
        "id": "3067544725"
      }
    ],
    "sections": [
      {
        "heading": "What this application is",
        "body": "Cedar Gate Operations Manager (OM) is the operations tooling for account and vendor setup, jobs, file inventory, processing tickets, dashboards, SLA and reporting, admin configuration, and blinding status.",
        "bullets": [
          "QC: https://om.qc.cgt.us/ · UAT: https://om.uat.cgt.us/ · PROD: https://om.cgt.us/",
          "OM presents both a React sidebar and a legacy top icon bar; they list the same primary modules.",
          "Phase Tracker is not a sidebar item — it opens by deep link from a processing ticket.",
          "Default ROLE_OM_USER is read-only on many write actions. Admin, CPM, Processing, USDM, DAC, and SPT see different submenus."
        ],
        "note": "Do not copy real account names, member IDs, file paths, or financial values into evidence. Use placeholders such as <account_name>, <processing_id>, <job_id>, <file_name>."
      },
      {
        "heading": "Module order in the product",
        "bullets": [
          "Production Manager — /productionManager/index — Assignments, Processing Tickets",
          "Accounts — /account/index — Account Management (Active / Termed)",
          "Vendor — /vendor/index — Vendors List, Client Vendor, Summary (QC-observed)",
          "Reports — /viewReport/index — Report, Snapshots, Effort Log",
          "SLA Report — /slaReport/index — Report, Configuration",
          "Admin — /admin/index — Setup (Admin), Server Management (Processing/SPT)",
          "Jobs — /viewJobs/index — Manage Jobs, Job Status",
          "Processing Dashboard — /processingDashboard/index — Dashboard, Configuration, Report, Account Team Mapping, Processing Report",
          "File Management — /fileManagement/index — File Inventory, Client FM, General FM, Vendor Notification, Vendor Schedule, FTP Accounts",
          "Blinding Status — /blindingStatus/index — Completed, Failed, Running"
        ]
      }
    ]
  },
  "login": {
    "title": "First login — user guide",
    "sources": [
      {
        "title": "OM application overview",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=local-00-application-overview",
        "id": "local-00-application-overview"
      }
    ],
    "sections": [
      {
        "heading": "How to sign in",
        "bullets": [
          "Open the environment URL (QC, UAT, or PROD). The environments hold separate configuration and data.",
          "QC: https://om.qc.cgt.us/ · UAT: https://om.uat.cgt.us/ · PROD: https://om.cgt.us/",
          "An unauthenticated request redirects to CAS (QC host: login.qc.cgt.us).",
          "Submit the assigned test persona username and password. Do not paste real passwords into tickets, evidence, or chat.",
          "On success, OM builds a session and a role-based navigation (sidebar + top icons, clocks, notifications, user menu, footer version).",
          "Most Processing personas land on Production Manager / the maintenance dashboard rather than a dedicated login landing page."
        ]
      },
      {
        "heading": "What the role decides",
        "bullets": [
          "ROLE_OM_USER: read-only on Jobs write actions (Add Jobs, Assign Job Email, Job Status Action column, RTI Action, EDI Parser Add).",
          "Admin: Add/Edit Account, Admin Setup, Version Management edits, FTP/Vendor Schedule writes (with DAC).",
          "CPM: edit application-level information and some Phase Tracker flags (Scrub Only, CETL, Re-Unstage, Skip Validation).",
          "Processing / Admin: start processing from Phase Tracker; retrigger failed blinding runs.",
          "USDM: receives Autopilot 'Waiting for Files' and some On Hold assignments.",
          "A failed or expired session returns to CAS. That is usually a session timeout, not an OM defect."
        ]
      }
    ]
  },
  "home": {
    "title": "Home Dashboard — user guide",
    "sources": [
      {
        "title": "Dashboard",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3067544729",
        "id": "3067544729"
      }
    ],
    "byView": {
      "trackers": [
        {
          "heading": "Overview",
          "body": "Dashboard is the landing page after login. It shows the current status of Maintenance (production) processing tickets: search, Previous/Current Month Release Tracker bars, and Latest Status of Maintenance tickets."
        },
        {
          "heading": "Release tracker bars",
          "bullets": [
            "Counts of Completed / Missed / To be Completed, segregated by frequency for previous and current month.",
            "Toggle frequencies: Quarterly, Monthly, Biweekly, Weekly. Default selection is Monthly.",
            "Previous Month header: Maintenance - <Frequency> <Previous Month>-<Current Year>.",
            "Includes only Maintenance tickets whose Release Date (or Expected/Original Scheduled Release Date if Release Date is missing) falls in that month."
          ]
        },
        {
          "heading": "What is excluded from tracker counts",
          "bullets": [
            "Archived tickets",
            "Termed clients' tickets",
            "Daily-frequency tickets",
            "Child-application tickets",
            "Tickets marked as test processing"
          ]
        },
        {
          "heading": "Completed vs Missed logic",
          "bullets": [
            "Completed: Maintenance tickets Released (phase Production Release / Extract Release / Closed) within the Expected Release Date (Original Release Date).",
            "Missed: not released within that date.",
            "If a ticket has multiple releases, use the latest production/extract release. A later Production Release that is only a comment or assignment change is not the latest release.",
            "If the ticket spent time in 'Waiting on ClearHealth', deduct that elapsed time (including weekends, accumulated across repeats) from the Production Release Date. This deduction applies only to tickets that have been released."
          ]
        },
        {
          "heading": "Count drilldown",
          "bullets": [
            "Header example: Maintenance <Frequency> Completed/Missed as of Previous Month (<Month>-<Year>).",
            "Columns: Processing Ticket (filterable), Scheduled Date Original/Latest, Release Date Original/Latest, Production Release Date (latest if multiple), Comment (latest Comment for Change).",
            "Missed drilldown: highlight Scheduled Date in red if Updated Scheduled Date is greater than Original Scheduled Date.",
            "Details section shows previous/revised Release Date, Scheduled Date, and Comment for Change.",
            "Excel download retains the UI layout."
          ]
        },
        {
          "heading": "Current month tracker",
          "bullets": [
            "Completed uses the same release-within-expected-date logic.",
            "Missed and To be Completed drilldowns exist for the current month.",
            "Latest Status of Maintenance tickets is grouped by frequency including Daily."
          ]
        },
        {
          "heading": "Days remaining and comments",
          "body": "Days Remaining is current date minus release date, business days only. Comments shown on tracker and search grids are the latest Comment for Change from the ticket."
        }
      ],
      "search": [
        {
          "heading": "Search panel",
          "body": "The Search button is on the top-right of Dashboard and of Production Manager >> Assignments. It opens a panel labelled Search.",
          "fields": [
            "Account — non-mandatory dropdown of active accounts",
            "Application — enabled after Account; active applications for that account",
            "Product — enabled after Account and Application; distinct deliverables",
            "Processing Type — Implementation or Maintenance",
            "Processing Ticket — free text",
            "Created Date Range From / To — ticket created dates in EST",
            "Search / Cancel / reset selected options"
          ]
        },
        {
          "heading": "Search results",
          "bullets": [
            "Results open on a new page and include archived tickets.",
            "Columns: Client Name, Product (deliverable acronym), Processing Ticket, USDM, CPM (one per line if multiple), Current Phase, Created Date, Production Release Date (latest), Scheduled Date, Days Remaining, Comments.",
            "Excel download retains layout."
          ]
        }
      ]
    },
    "sections": [
      {
        "heading": "Related dashboard reports",
        "bullets": [
          "Data Client Summary Mail and Daily Client Status Report are documented as dashboard-adjacent outputs (Confluence Dashboard child pages)."
        ]
      }
    ]
  },
  "production": {
    "title": "Production Manager — user guide",
    "sources": [
      {
        "title": "Production Manager Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3067544748",
        "id": "3067544748"
      },
      {
        "title": "Phase Tracker Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3067544746",
        "id": "3067544746"
      },
      {
        "title": "Autopilot Processing Parent Page",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3156018174",
        "id": "3156018174"
      },
      {
        "title": "HBA Autopilot Processing",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3115581485",
        "id": "3115581485"
      },
      {
        "title": "CM Autopilot Processing",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3127476318",
        "id": "3127476318"
      },
      {
        "title": "CMA Autopilot Processing",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3473605906",
        "id": "3473605906"
      }
    ],
    "byView": {
      "tickets": [
        {
          "heading": "Assignments (personal dashboard)",
          "body": "When a user is selected, tickets open in tabs Daily, Pending, Running, PAE Tickets, and Recent. Columns: Account, Application, Processing ID, Current Phase, Assigned By, Assigned Date, Comment. Only open, unarchived tickets for active accounts are listed.",
          "bullets": [
            "Daily / Pending / Running / PAE (not Recent) are split into Less than 24 hours, Less than 48 hours, More than 48 hours by last updated date.",
            "Recent uses a 'No. of days' field instead of those buckets.",
            "Daily: daily-frequency tickets assigned to the selected user, any phase.",
            "Pending: non-daily tickets in Waiting, File Arrangement, Scrub Request, Scrub Import, Scrub Resume, Application Processing Request, Extract Generation.",
            "Running: assigned tickets that are not Daily and not in the Pending phase list.",
            "PAE Tickets: tickets for the PAE product, any frequency or phase. A PAE ticket also still appears in Daily/Pending/Running when those rules match.",
            "Recent: tickets last updated by the selected user within the selected number of days."
          ],
          "note": "PAE here is the Plan Analytics Extract product tab — not an Autopilot exception queue."
        },
        {
          "heading": "Ticket ID formats",
          "bullets": [
            "Maintenance: <Account>_<Application>_<Product>_<Month>_<Year>_<Frequency> — example pattern <acct>_<app>_PA_08_26_M1 (File Received Date month/year).",
            "Implementation: <Account>_<Application>_<Product>_I<auto-increment> — example pattern <acct>_<app>_PA_I1."
          ]
        },
        {
          "heading": "Create Processing — rules that always apply",
          "bullets": [
            "SLA Status defaults to On Track.",
            "Release Date is calculated from Scheduled Date using Refresh Days from Internal SLA setup: UAT Refresh Days when Implementation = Yes, Production Refresh Days when Implementation = No. Scheduled Date is included. Weekdays only.",
            "If Plan Analytics Extract exists at the same frequency as Plan Analytics, creating a PA Maintenance ticket also creates a PAE ticket. Implementation tickets offer an option to create PAE.",
            "Same linked-ticket behaviour for Scrub Engine Extract (SCE) and Plan Analytics Cohort where those deliverables exist at the same frequency."
          ]
        },
        {
          "heading": "Automated ticket creation (calendar)",
          "bullets": [
            "Maintenance tickets only. Event name: <Account> <Application>_<Deliverable>_<Frequency>-<Category>-(Clearhealth).",
            "Scheduled Date = calendar event date. Type is always Maintenance.",
            "Daily events for next month: tickets created on the beginning of the last working day (EST) of the current month. Later new daily events for that month must be created manually.",
            "Non-daily: created at the beginning of the event day (EST). Weekend creation is allowed only if Client-Product-Frequency is configured to create tickets on weekends; otherwise shift to the next Monday.",
            "Do not auto-create tickets for child applications of a multi-scrub client even if child events exist — only create for the events the system is supposed to honour (parent)."
          ]
        },
        {
          "heading": "Manual creation",
          "body": "Users can create both Maintenance and Implementation tickets from Processing Tickets >> Create Processing. Category is Regular, Incremental, or Bulk Incremental. Compatible Scrub / Product / Extract / Master Table versions come from Admin >> Version Management."
        },
        {
          "heading": "Auto archival",
          "body": "Completed tickets can be archived. Archiving hides them from active lists but they remain in Search (including Dashboard Search)."
        }
      ],
      "phase": [
        {
          "heading": "How Phase Tracker opens",
          "body": "Drilling into a processing ticket opens a Phase Tracker page for that ticket. It is used to display and update ticket details, change phase / assignee / cycle dates / comments, execute phase-triggered jobs, log effort, and start processing.",
          "bullets": [
            "Admin or CPM: update/edit processing ticket details.",
            "Admin or Processing: start processing."
          ]
        },
        {
          "heading": "Summary section (documented fields)",
          "fields": [
            "Account Name, Application Name, Processing Ticket (Processing ID)",
            "Parent/Child Ticket(s) icon — hierarchy clients; hidden if no matching scrub-released child tickets. Maintenance matches hierarchy+product; Implementation also matches Processing For",
            "Product Ticket icon — PA with linked PAE/SCE created at the same time",
            "Show Files — inventory pop-up for products enabled in File Inventory",
            "File Inventory icon — new tab, File Management >> File Inventory >> Unstaged Files, pre-filtered to client/product/ticket",
            "Cycle Start/End Date (default Not Set), Processing Category, version fields (SE, layout, PA, Extract, Scrub Jar on M tickets)",
            "Onshore / Onshore Type / Implementation / Processing For (I tickets) / File Received Date",
            "Client Success Lead, USDM, CPMs from Accounts",
            "Re-Processing, Special Processing (default False), PGIC, 3M, BOB, VBCA (Yes if Contract Analytics enabled on the account), CM Outbound Exists",
            "View Details: Group Count, Feed Count",
            "Autopilot Processing Yes/No/N/A, DPCC# (hyperlink if present), Scrub Only, CETL, Re-Unstage, Skip Validation",
            "Sprint Version — Implementation tickets only"
          ]
        },
        {
          "heading": "File Received Date rules",
          "bullets": [
            "Shown on every Maintenance ticket Summary. Default is ticket creation date.",
            "If the ticket has Waiting for Files, automatically update File Received Date when the phase leaves Waiting for Files.",
            "Multi-scrub parent: when phase is Application Processing Request, set File Received Date to the max among child tickets.",
            "Admin and Processing may update File Received Date manually."
          ]
        },
        {
          "heading": "Update phase",
          "bullets": [
            "Update button reveals Update Phase (hidden by default): phase, comments, cycle dates, attachments, assignee.",
            "Confirmation prompt when setting PA/PAE Maintenance to Production Release / Extract Release after the first time that phase has been set.",
            "History section shows audit logs."
          ]
        },
        {
          "heading": "Edit Processing",
          "bullets": [
            "Top-left edit icon: versions, dates, status, re-processing, special processing, custom message, remarks, flags.",
            "Scrub Only and CETL: PA tickets only. Re-Unstage and Skip Validation: Maintenance only. Those four flags editable by CPM only.",
            "Date change requires Comment for Change.",
            "Linked PA/PAE/SCE: Scheduled Date, Status, Comment for Change (M) or Start/End Date, Status, Comment (I) copy across. Special Processing and PA Version copy as documented.",
            "Parent-child: Special Processing on parent copies to children created with it; if any such child is True, parent is True."
          ]
        },
        {
          "heading": "Phase-specific events (documented groups)",
          "bullets": [
            "Jobs — phase-triggered job execution from the ticket.",
            "File Unstaging — unstage staged production files for the account-application-product; Re-unstage option for Maintenance.",
            "Production Release — release notifications, assign release notes, last release ticket.",
            "Scrub Request — DPCC scan, CETL flag, Halt Scrub to App, crosswalk validation, blind-run validation, I-Check, bad file format validation.",
            "File Arrangement — including refresh-file / special-processing handling.",
            "Application Sign off — auto-populate Assigned To for onshore clients.",
            "Process Job — enable client cluster details from Phase Tracker; start application processing immediately after scrub (feature documented).",
            "Closed phase events; Incremental branch setup for SE; Incremental data-load status; Bulk Incremental version/branch update; PA-PAE tickets; ticket-wise counts; Sprint Version field."
          ]
        }
      ],
      "autopilot": [
        {
          "heading": "Source",
          "body": "Autopilot Processing Parent Page (Confluence 3156018174), under Phase Tracker Documentation."
        },
        {
          "heading": "How Autopilot is switched on",
          "body": "Accounts has an Autopilot Processing flag at Application–Product–Frequency, Yes or No (default No). Only combinations set to Yes run through Autopilot. Actions are carried out by Autopilot User. A global config can enable or disable the entire Autopilot flow for ALL clients.",
          "bullets": [
            "Applies to tickets created from the calendar and tickets created manually.",
            "To start Autopilot from a given phase on a manual ticket: set that phase and assign Autopilot User, and the product-frequency flag must be Yes.",
            "On failure, users may skip phases and resume by assigning Autopilot User on the resume phase. Example: Autopilot set Waiting for Files; a person moves it to File Unstaging and assigns Autopilot User — flow resumes from File Unstaging.",
            "If a ticket is On Hold (assignee ≠ Autopilot User) or Closed before initiation, it is excluded even when the flag is Yes."
          ]
        },
        {
          "heading": "Documented product flows (child pages)",
          "bullets": [
            "HBA Autopilot Processing (3115581485) — PA product.",
            "CM Autopilot Processing (3127476318) — CM Daily and HP follow-on.",
            "CMA Autopilot Processing (3473605906) — CMA Daily."
          ],
          "note": "Open the HBA / CM / CMA sub-tabs for the animated phase-change diagrams."
        }
      ],
      "autopilot-hba": [
        {
          "heading": "Source",
          "body": "HBA Autopilot Processing — https://confluence.cgt.us/pages/viewpage.action?pageId=3115581485"
        },
        {
          "heading": "Documented phase chain",
          "bullets": [
            "Non-parent: Waiting → File Arrangement → File Unstaging → Scrub Request → Scrubbing.",
            "Parent: Application Processing Request → Application Processing.",
            "Start: after 12:30 AM EST from Waiting + Autopilot User."
          ]
        },
        {
          "heading": "HBA / PA phase actions (non-parent unless noted)",
          "bullets": [
            "Waiting: after 12:30 AM EST → File Arrangement, comment 'Initiating missing file check for the client !!'.",
            "File Arrangement: DPCC + missing-file check. No missing / Required=False → File Unstaging. Required=True missing → Waiting for Files to USDM (hyperlinked Deermine tickets); poll every 1 hour until files arrive. Not for parent tickets.",
            "File Unstaging: none available → On Hold USDM. Success, no _! in S3 → Scrub Request. _! remain → File Arrangement to Processing Team. Failure → On Hold Processing Team. Not for parent tickets.",
            "Scrub Request: DPCC + Bad File Format Validation + Crosswalk (Skip Validation / Re-Unstage). Success → Scrubbing.",
            "Scrubbing: launch cluster from Processing Dashboard Hadoop Cluster Settings. Missing settings or launch failure → On Hold Processing Team.",
            "Application Processing Request / Application Processing (parent): move to Application Processing and launch cluster with the same settings rules."
          ],
          "note": "Resume rule: phase AND Autopilot User. Comment: '<User Comment>. Resuming autopilot processing from <Assigned Phase Name>!!'"
        }
      ],
      "autopilot-cm": [
        {
          "heading": "Source",
          "body": "CM Autopilot Processing — https://confluence.cgt.us/pages/viewpage.action?pageId=3127476318"
        },
        {
          "heading": "Timing",
          "body": "Daily CM. Start window ~6:30 AM NPT for Waiting / Production Release / Scrub Release tickets with Autopilot Yes. Cut-off 12:45 AM EST."
        },
        {
          "heading": "Three documented chains",
          "bullets": [
            "Parent: Waiting → Member Merge Outbound → Scrubbing → Inbound Execution → Scrub QC → Request for Engine Execution → Engine Execution → Production Release.",
            "Child: Waiting → File Arrangement → File Unstaging → Scrub Request → Scrubbing.",
            "Non-hierarchy: Waiting → File Arrangement → Member Merge Outbound → File Unstaging → Scrub Request → Scrubbing → Inbound Execution → Scrub QC → Request for Engine Execution → Engine Execution → Production Release."
          ]
        },
        {
          "heading": "Key decisions",
          "bullets": [
            "Open DPCC at product-frequency → On Hold to Production CPM (and open children if parent).",
            "File Arrangement needs a Required staged production file; missing → Waiting for Files (poll 30 min) then email USDM after cut-off.",
            "Member Merge is not for child tickets. HP with same frequency can auto Production Release when CM first reaches Production Release and CM Autopilot is True.",
            "Prior-month dailies auto-close on the 1st at 12 AM NPT."
          ]
        }
      ],
      "autopilot-cma": [
        {
          "heading": "Source",
          "body": "CMA Autopilot Processing — https://confluence.cgt.us/pages/viewpage.action?pageId=3473605906"
        },
        {
          "heading": "Documented phase chain (Daily)",
          "bullets": [
            "Waiting → File Arrangement → Scrubbing → Authorization Execution → Production Release.",
            "Start ~2:00 PM NPT; cut-off 6:00 PM NPT.",
            "Open DPCC → On Hold Production CPM; else File Arrangement.",
            "File Arrangement requires Required staged Inpatient or Outpatient file; missing → Waiting for Files (poll 15 min).",
            "Authorization Execution is set by processing automation; success → Production Release; failure / no jobs → On Hold Processing Team.",
            "Production Release may email CMA Notification Salesforce contacts with the Authorization Report attachment.",
            "Prior-month dailies auto-close on the 1st at 12 AM NPT."
          ]
        }
      ]
    }
  },
  "accounts": {
    "title": "Accounts — user guide",
    "sources": [
      {
        "title": "Account Workflow",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3067544726",
        "id": "3067544726"
      }
    ],
    "byView": {
      "setup": [
        {
          "heading": "Purpose",
          "body": "Accounts displays client details and manages Accounts and Applications. Privileges follow assigned roles."
        },
        {
          "heading": "Who can add or edit",
          "bullets": [
            "Admin only: add/edit an Account. Add Account is top-right on Accounts >> Active and opens Add/Edit Account.",
            "CPM: edit application-level information on existing accounts, and assign products via Edit Account."
          ]
        },
        {
          "heading": "Account info fields (core)",
          "fields": [
            "Account Code — integer, required, unique, 4 digits, auto-increment, read-only",
            "Account Name — text, required, unique, 50 characters",
            "Account Acronym — text, required, unique, 3 characters",
            "Market Segment / Sub-Market Segment — view-only in OM, synced from Salesforce (Payer, Provider, Self-Funded, Commercial)"
          ]
        },
        {
          "heading": "Product selection and SLA days",
          "bullets": [
            "If Implementation = Yes (UAT): checking a product just updates account info.",
            "If Implementation = No (Production): show Client SLA Days (integer), defaulted from Default SLA Setup. Null and 0 are invalid. Saving checks the product and auto-updates SLA Reports >> Configuration >> Update SLA with the product and Client SLA Days."
          ]
        },
        {
          "heading": "Other documented account behaviours",
          "bullets": [
            "Landing page is role-modified.",
            "Role-based authorization tables exist for Account action items and Application action items.",
            "Save User Preferences, Quarterly Password Notification, and Termination Checklist Template are documented on the same Account Workflow page.",
            "MGU Crosswalk is a scoped Accounts submodule (NDM/USDM), not shown to most personas."
          ]
        }
      ],
      "frequency": [
        {
          "heading": "Product–frequency is where runtime behaviour is set",
          "body": "Each application has product-frequency rows (deliverable + frequency). Flags and calendars here decide ticket creation, Autopilot eligibility, holds, and validation.",
          "bullets": [
            "Autopilot Processing: Yes/No, default No, at Application–Product–Frequency.",
            "Weekend ticket-creation configuration is read by calendar automation.",
            "DPCC# can be stored at product-frequency and is shown (hyperlinked) on Phase Tracker.",
            "Future tickets inherit settings at creation time; existing tickets keep the configuration they were created with."
          ]
        }
      ]
    }
  },
  "reports": {
    "title": "Reports — user guide",
    "sources": [
      {
        "title": "Operations Manager Reports Parent Page",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3087927098",
        "id": "3087927098"
      },
      {
        "title": "IQR Report Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3127476478",
        "id": "3127476478"
      },
      {
        "title": "SQR Variance Report Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3087927133",
        "id": "3087927133"
      },
      {
        "title": "Report Snapshots Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3087927143",
        "id": "3087927143"
      }
    ],
    "byView": {
      "run": [
        {
          "heading": "How to run a report",
          "body": "Reports >> Report: choose Select the Report, complete that report's filter form, then Show. Required fields vary by report. Two users with different access can see different row counts for the same report."
        },
        {
          "heading": "Documented report catalogue (parent tree)",
          "bullets": [
            "Bad Data Report",
            "CM/HP Test Results Report",
            "Daily IQR Summary Report",
            "Expected File Date Report",
            "Groupwise Active Count Report",
            "IQR Report — Client Name *, IQR Type * (Daily IQR or Input Profiling IQR), From/To Date * (File Received Date), File Type *, Search. Header: IQR Client, IQR Type, Record Type.",
            "Missing File Impacted Group Report",
            "Production Release Note Report",
            "SQR Report",
            "SQR Variance Report — quality/variance checkpoint after processing; child views include Data Distribution Quality, Groupwise Member Match, Hierarchy, IDQR, New/Missing Groups, NGO VCR MTP Verification, Profile Report, 3M Test Case. A flag for SQR report calculations is documented in the User Manual."
          ]
        }
      ],
      "snapshots": [
        {
          "heading": "Snapshots",
          "body": "Reports >> Snapshots stores a captured report result (not a live query) so a later run can be compared. Capture before a known change if a before-and-after will be needed."
        },
        {
          "heading": "Effort Log",
          "body": "Opens as its own view. Effort is attributed to processing work so it can roll up per client or team. Treat exports as sensitive."
        }
      ]
    }
  },
  "sla": {
    "title": "SLA Report — user guide",
    "sources": [
      {
        "title": "SLA Reports Parent Page",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3088650768",
        "id": "3088650768"
      },
      {
        "title": "Client SLA Report Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3087927787",
        "id": "3087927787"
      }
    ],
    "byView": {
      "report": [
        {
          "heading": "How to run",
          "body": "SLA Report >> Report: choose SLA Report Option, select Account, then Show. Configuration tab sits beside it."
        },
        {
          "heading": "Documented SLA report options",
          "bullets": [
            "Client SLA Report — includes a documented decision on archive tickets in the filter (Support #779672).",
            "Client-wise Product SLA Report",
            "Product SLA Report",
            "Data Requirements Analysis SLA Report",
            "File Delivery Date SLA Report",
            "Legal SLA Report",
            "New Group Onboarding SLA Report"
          ]
        }
      ],
      "config": [
        {
          "heading": "Configuration",
          "body": "SLA values used by the reports. Saving a product on an Account that is in Production (Implementation = No) auto-updates Update SLA with Client SLA Days. Changes apply to future calculations; they do not rewrite already reported results. Editing is role-gated."
        }
      ]
    }
  },
  "admin": {
    "title": "Admin — user guide",
    "sources": [
      {
        "title": "Set Up Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3087927792",
        "id": "3087927792"
      },
      {
        "title": "Version Management Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3146383538",
        "id": "3146383538"
      }
    ],
    "byView": {
      "setup": [
        {
          "heading": "Who sees Setup",
          "body": "Admin >> Set Up is Admin-only. It holds configurations used throughout OM. Processing and SPT land on Server Management instead (Database Server Info, Server Info, Script List, Add Database)."
        },
        {
          "heading": "Team Set Up — Add/Edit Team",
          "fields": [
            "Team — required free text",
            "USDM — required dropdown of active USDM-role users",
            "USDM Queue — optional, same user list",
            "CPM — required dropdown of active CPM-role users",
            "CPM Queue — optional"
          ]
        },
        {
          "heading": "SLA Set Up and Daily IQR Setup",
          "body": "Internal/default SLA days (including UAT vs Production refresh days used to calculate Release Date on tickets). Daily IQR Setup holds the thresholds that quality reports use."
        }
      ],
      "products": [
        {
          "heading": "Product Management",
          "bullets": [
            "Add New Product — deliverables that accounts can then be configured for.",
            "Add New Phase Group — reusable sequence used as the ticket's phase list.",
            "Add New Phase — names and order inside a group. Phase names appear on dashboards and reports."
          ],
          "note": "Phases are configured data, not a hardcoded list. Existing tickets keep the sequence they were created with."
        }
      ],
      "infra": [
        {
          "heading": "Version Management",
          "body": "OM stores Product Version and compatible Scrub Version and Extract Version (Extract for PA only). RE scripts insert versions after each PA, CM, HP, and SE release via an API that rejects duplicates. Admin can manually update Scrub Version in the UI (duplicate restricted).",
          "bullets": [
            "Format 00.00.00. Product version = Engine version; Scrub Version = Stage Layout version; Extract = PA Extract version.",
            "PA release writes PrA/PAE (product+scrub) and PA (product+scrub+extract+master table).",
            "CM release writes CM, CME, CMA. HP writes HP. SE writes SE product+master table; Master Table release updates compatible master table for SE product versions.",
            "Create Processing auto-selects latest compatible scrub/product (and master table / SE version for PA), with extra rules when the client has both PA and HP/CM, and for multi-scrub parent+child (minimum latest common scrub).",
            "Incremental PA tickets copy versions from the latest Production-Released Bulk Incremental of the same account/application/product/type. Releasing a Bulk Incremental updates open incrementals.",
            "Client-specific Master Table / Scrub Engine Version set via Process Job overrides generated values."
          ]
        },
        {
          "heading": "Server Management (Processing/SPT landing)",
          "body": "Database Server Info, Server Info, Script List, Add Database. Processing targets selected by Jobs and cluster launches on Processing Dashboard / Autopilot come from this operational configuration."
        }
      ]
    }
  },
  "jobs": {
    "title": "Jobs — user guide",
    "sources": [
      {
        "title": "Jobs Module",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3238756677",
        "id": "3238756677"
      },
      {
        "title": "S3 Jobs Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3146383666",
        "id": "3146383666"
      },
      {
        "title": "Blinding Status",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3365700994",
        "id": "3365700994"
      }
    ],
    "byView": {
      "manage": [
        {
          "heading": "Landing page",
          "body": "Jobs tab on the OM landing page. ROLE_OM_USER is read-only. Two tabs: Manage Jobs and Jobs Status.",
          "bullets": [
            "Manage Jobs: Find S3 Job and Search Files (top right). Account list (Active and Termed) with search. Selecting an account lists applications: Application Name, Acronym, Code, Actions.",
            "Actions: Assign Job Email (hidden from ROLE_OM_USER including Delete Email / Add Email) and Add Jobs."
          ]
        },
        {
          "heading": "Add Jobs tabs",
          "bullets": [
            "S3 Jobs",
            "Stored Procedure Jobs",
            "EDI Parser — Add EDI Parser and Action column hidden from ROLE_OM_USER",
            "Upload Job",
            "Inbound Job",
            "Authorization Job",
            "Script Execution Job",
            "RTI Job — Action column hidden from ROLE_OM_USER"
          ]
        },
        {
          "heading": "S3 Jobs (high level)",
          "body": "Add/Edit S3 Job covers destinations, frequency, expected schedule, Files Required at destination, staging (Production _! / QC $ / None), invocation rules, and account/application updates. Changing frequency, expected schedule, or destination path has additional documented cases. Destination path tokens and pattern matching are documented separately. Archived jobs show Job Id with * in File Inventory."
        }
      ],
      "status": [
        {
          "heading": "Job Status tabs",
          "body": "Completed, Failed, Running for a specified Date (default today) plus Search.",
          "fields": [
            "S.N., Client Name (Account - Application; Account only if names match)",
            "Job Id, Job Name, Sub Job Id, Date Created, Last Updated, Status, Message, Description, Action"
          ]
        },
        {
          "heading": "Actions (hidden from ROLE_OM_USER)",
          "bullets": [
            "Running: Stop Running Job, Delete Job Status",
            "Failed: Rerun from Failed Job, Rerun from Start, Skip Failed Job, Delete Job Status",
            "Completed: Delete Job Status"
          ]
        }
      ]
    }
  },
  "processing": {
    "title": "Processing Dashboard — user guide",
    "sources": [
      {
        "title": "Consolidated Processing Dashboard Page (EMR + Snowflake)",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3499459599",
        "id": "3499459599"
      },
      {
        "title": "Daily IQR Processing Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3133866047",
        "id": "3133866047"
      },
      {
        "title": "File Change Reports Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3133866049",
        "id": "3133866049"
      },
      {
        "title": "JetStore Integration",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3215556842",
        "id": "3215556842"
      }
    ],
    "byView": {
      "monitor": [
        {
          "heading": "UI (QC-observed, Processing persona)",
          "bullets": [
            "Route: /processingDashboard/index",
            "Submodules: Dashboard, Configuration, Report, Account Team Mapping, Processing Report",
            "Filters: Processing Cluster or SnowFlake Cluster, From Date *, To Date *, Search",
            "Process-type tabs include Client Processing, 24*7 Daily IQR, Custom Daily IQR, Splitter, Parser, Daily DSD, CA Fetch, Generic IQR, Bulk Parser, Dailies, Non-Dailies"
          ],
          "note": "The Confluence 'Processing Dashboard' parent page (3166931094) has no extractable body. Behaviour below is from the QC navigation walk and the consolidated EMR+Snowflake tracker documentation."
        },
        {
          "heading": "Consolidated client processing tracker",
          "body": "EMR and Snowflake client processing are shown in one table. EMR rows include process, step, cluster ids, processingId, processingPhase, stepStatus. Snowflake rows include PROCESSING_ID, CLIENT_ACRONYM, PROCESSING_PHASE, PROCESS_NAME, PROCESS_STATUS, PROCEDURE_NAME, STEP_STATUS. Use placeholders for processing IDs in evidence."
        },
        {
          "heading": "Operational actions",
          "body": "Permitted operators can resume, kill, or terminate live runs. Autopilot launches clusters using Hadoop Cluster Settings stored here; missing settings put the ticket On Hold for Processing Team."
        }
      ],
      "ca": [
        {
          "heading": "CA Processing and supporting views",
          "bullets": [
            "CA Fetch appears as a process-type tab on the dashboard and is not driven by an OM processing ticket.",
            "Configuration holds cluster / Hadoop settings used by Autopilot and manual Process Job.",
            "Account Team Mapping ties ownership for processing.",
            "Processing Report summarises execution activity."
          ]
        }
      ],
      "daily-iqr": [
        {
          "heading": "Source",
          "body": "Daily IQR Processing Documentation (3133866047) and File Change Reports Documentation (3133866049)."
        },
        {
          "heading": "When FCRs are produced",
          "bullets": [
            "File Change Reports are generated after the Daily IQR Processing Report is sent.",
            "Only Medical, Eligibility, and Pharmacy record types.",
            "Only files with distribution Y/1; dependent files N/0 are ignored.",
            "Eligibility: Group + Record Count. Medical/Pharmacy: Group + Max Paid Date + Record Count.",
            "A completely new file uses New File Report instead of FCR.",
            "Multiple files same location/date/job: Daily IQR processes all; FCR uses only the latest."
          ]
        }
      ],
      "fcr": [
        {
          "heading": "Source",
          "body": "File Change Reports Documentation — https://confluence.cgt.us/pages/viewpage.action?pageId=3133866049 (updated for OM-5887)."
        },
        {
          "heading": "New Group Report",
          "body": "Compare group code and group name in the current file to active groups from the UM API for the comparison client. Groups in the file that are not in UM are new.",
          "bullets": [
            "Comparison client order (OM-5887): 1) Sandbox Client on the application if set; 2) else application with Sandbox App = Yes on the account; 3) else parent application (PA hierarchy); 4) else same client."
          ]
        },
        {
          "heading": "Missing Group Report",
          "body": "Previous file = Job ID + Client + Vendor + Layout + File Type. Groups in the previous file that are absent from the current file are missing."
        },
        {
          "heading": "File Issue ticket posting",
          "bullets": [
            "Project: Data Production - File Management · Issue Type: File Issue · Status New · Priority Normal · File Required Yes",
            "Subject: <Account Acronym>-<Vendor> - <Type of Report> - <File Received Date>",
            "Assignee: USDM / USDM Work Queue",
            "Skip clients/data types on FileMissingExclusionList",
            "If ticket create fails → email Production Team with the same FCR layout",
            "Forced past-date run: regenerate FCRs forward; create tickets only when regenerated report differs from the prior one"
          ],
          "note": "Use placeholders for account, vendor, and file names in evidence."
        }
      ],
      "jetstore": [
        {
          "heading": "Source",
          "body": "JetStore Integration — https://confluence.cgt.us/pages/viewpage.action?pageId=3215556842 (v42)."
        },
        {
          "heading": "Upload and Run ID",
          "body": "After File Mapping on an Implementation ticket, FME uploads the stage1 dump to JetStore S3 input and posts Processing ID, Job Start Time, uploaded data types (Medical / Eligibility / Pharmacy), and a unique Run ID to an OM endpoint. Environment in the path matches the OM cluster (QC/UAT/PROD)."
        },
        {
          "heading": "Test Harness status callbacks",
          "bullets": [
            "Running → Phase Tracker comment: Test Harness execution in progress for <Data Type>",
            "Completed → Test Harness Output Generation Completed for <Data Type>",
            "Failed → On Hold, assign Data Team User (Team Setup), comment Output Generation Failed",
            "When all uploaded data types have Completed or Failed → PagerDuty (+ Phase Tracker comment), unless Failed arrived with no Input Data Type message (OM-4533)",
            "No output within configured threshold → On Hold + Data Team User; cluster terminate after Backup Job is config-gated"
          ]
        },
        {
          "heading": "Test result evaluation",
          "bullets": [
            "Warning ignored; only rawfilename containing $ is evaluated",
            "All Pass → 'All stage1 test cases Passed!'",
            "All Fails on exclusion list (known Feature Defect Done/Closed for client/ALL + layout + data type + test_id + Known Issue Yes) → exclusion comment",
            "Fail not excluded → Feature Defect Jira at Data Type–Layout–Test Case ID; On Hold; terminate cluster after Backup Job",
            "Jira create fail (no Fix Version / other) → On Hold with documented comments (OM-2653)",
            "On Hold assignees for JetStore failure paths use Data Team User from Team Setup (OM-5747)"
          ],
          "note": "Use placeholders for processing ticket, Run ID, and S3 paths in evidence."
        }
      ]
    }
  },
  "files": {
    "title": "File Management — user guide",
    "sources": [
      {
        "title": "File Inventory Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3067544735",
        "id": "3067544735"
      },
      {
        "title": "Client FM - General FM Documentation",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3087827473",
        "id": "3087827473"
      },
      {
        "title": "FTP Accounts",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3444639119",
        "id": "3444639119"
      },
      {
        "title": "Vendor Schedule",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3189934533",
        "id": "3189934533"
      }
    ],
    "byView": {
      "inventory": [
        {
          "heading": "Overview",
          "body": "Every file placed in dasscrubinput via OM S3 Copy or S3 Parse that meets staging and destination-path rules is listed under File Manager >> File Inventory. File Received Date comes from OM SQS; Expected Date from job frequency (same frequency for files from the same job). Products tracked: PA, CM, HP, CMP, CMA, FME, CC. All dates/times EST. Each tab shows Required/Optional."
        },
        {
          "heading": "S3 Copy / Parse listing criteria",
          "bullets": [
            "File placed in destination bucket dasscrubinput via OM S3 Jobs.",
            "Staging must be Production Files (_!) or QC Files ($) — not None.",
            "Destination path: dasscrubinput/[Onshore|Offshore]/[ClientName]/[ProductAcronym]/[Incremental]/[StageFolder]/[ClientFolder]/[VendorName]/[FileType]/[Layout]/[DateFolder]/[FileName].",
            "ClientName = AccountAcronym_ApplicationAcronym (uppercase); ClientFolder lowercase AccountAcronym or AccountAcronym_ApplicationAcronym.",
            "StageFolder = Stage0 or preFileProcess; DateFolder = %{yyyyMMdd|0}%.",
            "Layout null vs present depends on parameter count and whether Onshore/Offshore or Incremental segments are present.",
            "Criteria not met → untracked_file_inventory (not Inventory UI).",
            "is_destination_removed = 1 in inventory_tracker → hidden from all Inventory tabs."
          ]
        },
        {
          "heading": "S3 Static listing criteria",
          "bullets": [
            "Invocation rule: [ClientBucket]/[dev]/dasscrubinput/EOF/[Onshore|Offshore]/[ClientName]/[ProductAcronym]/[StageFolder]/[ClientFolder]/[VendorName]/[FileType]/[Layout]/[DateFolder]/[FileName].",
            "Layout parsing depends on Onshore/Offshore and /dev/ parameter combinations.",
            "OM-4150: matching Static files list in Inventory, Unstaged, and Missed Production."
          ]
        },
        {
          "heading": "UI search and tabs",
          "body": "File Management lands on File Inventory. Search filters: Account Name *, Application Name *, Product *. Tabs: Staged Implementation, Missed Implementation, Staged Production, Missed Production, Unstaged, Missed while Arranging, Missed Files.",
          "fields": [
            "Job Id (* = archived job), Vendor, Layout, File Type, File Name, Expected Date, File Received Date, Frequency, Grace Period, Required/Optional, File Size, Action"
          ]
        }
      ],
      "staged": [
        {
          "heading": "Staged Implementation vs Production",
          "bullets": [
            "QC Files ($): $ prepended to DateFolder → Staged Implementation (development).",
            "Production Files (_!): _! prepended to DateFolder → Staged Production.",
            "Default frequency if not configured: Implementation Monthly, Production Daily; mixed Imp+Prod jobs default Daily.",
            "Frequency options include N/A and On Hold; Tolerance Days affect next Expected Date.",
            "OM-3075: Action to update Required file status on Staged Implementation/Production (and Missed Imp/Prod)."
          ]
        },
        {
          "heading": "Move to Production",
          "bullets": [
            "Applies at Job + Client + Product level from Staged Implementation.",
            "Keep development copy: file appears in both Staged Imp and Staged Prod tabs.",
            "Do not keep development copy: Production tab only.",
            "Onshore move (OM-3174): also unstage blinded / crosswalk / sample $ folders (not listed in Inventory) and send a separate email.",
            "S3 Refresh Job with Production staging automatically keeps a development copy."
          ]
        },
        {
          "heading": "Role access (write)",
          "bullets": [
            "All OM users: File Manager read-only.",
            "ROLE_OM_CPM: limited write — edit frequency and expected date on staged files.",
            "ROLE_OM_ADMIN and ROLE_OM_PROCESSINGTEAM: full read/write."
          ]
        }
      ],
      "unstaging": [
        {
          "heading": "How files become Unstaged",
          "bullets": [
            "From Staged Production: Set Processing ID (tickets filtered by Account, Application, Product).",
            "From Phase Tracker: set ticket phase to File Unstaging → all listed files for that Account-Application-Product unstage onto that ticket.",
            "S3 Static (OM-4150): matching inventory files list under Unstaged without a processing ticket."
          ]
        },
        {
          "heading": "What unstaging does on S3",
          "bullets": [
            "Remove file from _! DateFolder into the normal (no _!) location.",
            "Remove development $ copy if present.",
            "Incremental / Bulk Incremental: also clear _! from DateFolder in regular and _!Incremental locations; remove $ copies in both.",
            "Feature #601440: Missing File records saved/displayed for tickets that go through file unstaging / re-unstaging (Missed while Arranging).",
            "When the unstaging processing ticket is archived, Inventory UI rows for that lifecycle disappear; database retains them."
          ]
        }
      ],
      "missed": [
        {
          "heading": "Missed Implementation / Production",
          "bullets": [
            "A file is Missed when the latest file for a job exceeds Expected Date and the next file is not received.",
            "Missed Implementation: latest file(s) per job under Staged Implementation.",
            "Missed Production: latest file(s) per job under Staged Production and Unstaged (including S3 Static).",
            "Late-received files stay on Missed Imp/Prod tabs with updated File Received Date and green highlight.",
            "Required status can be updated from Missed Imp/Prod tabs (OM-3075)."
          ]
        },
        {
          "heading": "Missed Files tab (OM-3745)",
          "bullets": [
            "For the Expected Date in search, list missing production files for all clients and products.",
            "Excludes files already received — only still-missing rows.",
            "Columns: Client Name, Product, Job ID, Vendor, Layout, File Type, File Name, Expected Date, File Received Date, Frequency, Ticket ID, No. of Emails Sent, Grace Period, Required/Optional."
          ]
        },
        {
          "heading": "Missing File Report email",
          "bullets": [
            "Daily at 9:15 am NPT (10:30 pm EST).",
            "Title: Missing File Report for Account: <Account> and Application: <Application> for <Date>.",
            "Sections: still missing; and received-after-missed with updated received date.",
            "Only new misses for that day (already-reported rows excluded).",
            "If nothing to report overall: single email 'Missing File Report for <Date>' stating no missing files.",
            "Recipients include processing, CPM, FIT, OM mailing groups and respective CSM when present.",
            "Missing/Duplicate File Issue ticket posting for missing records is automated (related docs under File Inventory tree)."
          ]
        }
      ],
      "unmatched": [
        {
          "heading": "Why files land in FM",
          "bullets": [
            "Incoming file does not uniquely match any non-archived OM job invocation rule, or",
            "A refresh job picked the file but could not replace the old file and this is not the first execution of that refresh job."
          ]
        },
        {
          "heading": "Client FM vs General FM vs Global FTP",
          "bullets": [
            "Regular FTP with Account FTP mapping → Client FM folder under dasscrubinput.",
            "Global FTP (Shared FTP with more than one shared client): identify client from 3-letter Account Acronym subdirectory in the incoming path; must match an OM Account Acronym.",
            "Generic Client FM path: <DestinationBucket>/<AccountAcronym_ApplicationAcronym>/FM/.../{file_received_name} (application acronym same 3 letters as account in this convention).",
            "All Client FM dates in UI are EST. Search: Date from / Date To."
          ]
        },
        {
          "heading": "Documented Client FM actions",
          "bullets": [
            "Link to Job — controlled route back into inventory/job handling.",
            "Send to DA, delete (role-gated).",
            "Split File and FM File Parser, Add S3 Job from FM."
          ]
        }
      ],
      "intake": [
        {
          "heading": "FTP Accounts",
          "body": "Tabs: Active Clients (default), Termed Clients, Shared FTP. Columns: FTP Account, Client Name, Host URL, Username, Vendor, Action (Edit). Add New FTP Account top-right.",
          "bullets": [
            "Automated creation: Cloud IT message on ftp_feed_automation_production with FTP Account, Client Name (Jira client name), Host URL, Username, Vendor (optional). OM saves, rejects duplicates, emails 'FTP Account Status' to CloudOps, Client PMs, File Management Team (success or failure).",
            "Manual Add/Edit: FTP Account *, Client Name * (active OM clients), Host URL *, Username *, Vendor optional, Save/Cancel.",
            "Delete: API for Cloud IT keyed by FTP Account name."
          ],
          "note": "Treat Host URL and Username as operational secrets in evidence — do not paste real values."
        },
        {
          "heading": "Vendor Schedule",
          "body": "Add New Vendor Schedule (Admin or DAC only): Vendor, File Type (from Salesforce), Frequency, then Expected Schedule for that frequency (Override Once and On Hold not offered). Grid: S. No., Vendor, File Type, Frequency, Schedule, Edit (Admin/DAC).",
          "bullets": [
            "When an S3 Job is created from OM Job Automation only, if IFR ticket Vendor + File Type match Vendor Schedule, that expected schedule is applied — unless the account-vendor is on om.vendor_schedule_exception_list."
          ]
        },
        {
          "heading": "Vendor Notification",
          "body": "Defines who is told, and when, that an expected file has not arrived. Paired with inventory Missed tabs and grace period."
        }
      ]
    }
  },
  "blinding": {
    "title": "Blinding Status — user guide",
    "sources": [
      {
        "title": "Blinding Status",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3365700994",
        "id": "3365700994"
      },
      {
        "title": "JetStore Integration",
        "url": "https://confluence.cgt.us/pages/viewpage.action?pageId=3215556842",
        "id": "3215556842"
      }
    ],
    "sections": [
      {
        "heading": "Where it lives",
        "body": "Documented as a tab in the Jobs module, and in current Front navigation as a top-level module at /blindingStatus/index, available to all OM users."
      },
      {
        "heading": "Tabs and columns",
        "bullets": [
          "Failed, Completed, Running. Optional Date Created + Search.",
          "S. No., Job ID (job that sent the file for blinding), Date Created, Last Updated.",
          "Status: Failed or Completed from Jetstore; Running if in progress, no status yet, or Pending.",
          "Message from Jetstore.",
          "Source File Location, Destination File Location.",
          "Blinded File Location: Jetstore generated Blinded, Crosswalk, Shuffle, Summary files. Failed and Running show '-'.",
          "Action: retrigger blinding on Failed. Jetstore DB records retrigger via a flag. Action visible to Processing and Admin only."
        ],
        "note": "Treat file locations as sensitive. Use placeholders in screenshots and defects."
      },
      {
        "heading": "JetStore relationship",
        "body": "Blinding/test-harness runs are executed by JetStore and reported back into this grid. Implementation tickets may wait on a completed blinding run before continuing. Retrigger of a failed Jetstore blind run is a documented enhancement (OM-3419)."
      }
    ]
  }
};
