/* AWS Lambda flows discovered across local OM repos.
   Sources: repo_om_patches (lamdba_function, R_10.6.0), repo_om_processingcalendar/lambdas,
   Snowflake CALL_LAMBDA_API_OM, repo_om_frontv2 report controllers, design diagrams.
   Identifiers and hosts are placeholders — no secrets. */

const LAMBDA_FLOWS = {
  map: {
    title: "Lambda landscape",
    summary:
      "OM uses a small set of AWS Lambdas for file intake, FTP account automation, processing-cluster notifications, and (via Snowflake) external API calls. Open a module to see the flow that belongs there.",
    flows: [
      {
        id: "catalog-files",
        name: "File intake Lambdas",
        moduleJump: "files",
        repo: "repo_om_patches/lamdba_function",
        steps: [
          { label: "S3 / SNS event", kind: "trigger" },
          { label: "AWSOMFileMovement / awsSyncDailyIQR", kind: "lambda" },
          { label: "Copy → om-sqs / deerwalk-iqr", kind: "aws" },
          { label: "File Manager dailyIQR/save", kind: "om" },
        ],
      },
      {
        id: "catalog-ftp",
        name: "FTP account automation",
        moduleJump: "files",
        repo: "repo_om_patches/R_10.6.0/*/lambda",
        steps: [
          { label: "SQS ftp_feed_automation", kind: "trigger" },
          { label: "FTP automation Lambda", kind: "lambda" },
          { label: "OM API Application / Vendor / FtpAccount", kind: "om" },
        ],
      },
      {
        id: "catalog-proc",
        name: "Processing notification Lambdas",
        moduleJump: "processing",
        repo: "repo_om_processingcalendar/lambdas",
        steps: [
          { label: "EMR / engine SNS", kind: "trigger" },
          { label: "sns_filter → SQS", kind: "lambda" },
          { label: "sqs_reader", kind: "lambda" },
          { label: "omproservice saveNotification", kind: "om" },
        ],
      },
      {
        id: "catalog-spot",
        name: "Spot termination notify",
        moduleJump: "processing",
        repo: "repo_om_processingcalendar/lambdas/om-spot-termination",
        steps: [
          { label: "EC2 Spot interruption SNS", kind: "trigger" },
          { label: "om-spot-termination", kind: "lambda" },
          { label: "Enrich + notify OM", kind: "om" },
        ],
      },
      {
        id: "catalog-snow",
        name: "Snowflake → Lambda API",
        moduleJump: "jobs",
        repo: "repo_om_patches/Snowflake/…/CALL_LAMBDA_API_OM.sql",
        steps: [
          { label: "Snowflake EXTERNAL FUNCTION", kind: "trigger" },
          { label: "API Gateway /qc", kind: "aws" },
          { label: "Lambda (OM integration)", kind: "lambda" },
        ],
      },
    ],
  },

  files: {
    title: "File Management — Lambda flows",
    summary:
      "Inbound files reach File Inventory through S3-triggered copy Lambdas that register movement with File Manager. A separate SQS-triggered Lambda creates FTP accounts used by Vendor Schedule / FTP Accounts.",
    flows: [
      {
        id: "file-movement",
        name: "AWSOMFileMovement (S3 copy → File Manager)",
        handler: "exports.awsCopyHandler",
        repo: "repo_om_patches/lamdba_function/AWSOMFileMovement",
        trigger: "SNS wrapping S3 ObjectCreated (source bucket put)",
        steps: [
          { label: "S3 ObjectCreated", kind: "trigger" },
          { label: "SNS notification", kind: "aws" },
          { label: "AWSOMFileMovement", kind: "lambda" },
          { label: "Skip 0-byte / multi-part if large", kind: "decision" },
          { label: "Copy to om-sqs dated key", kind: "aws" },
          { label: "POST …/fileManager/dailyIQR/save", kind: "om" },
          { label: "File Inventory / Daily IQR intake", kind: "exit" },
        ],
        notes: [
          "Destination key is derived from the source path and processing date (+1 day in code).",
          "File Manager URL is environment-specific (example host pattern omfm.<env>.…).",
          "Related redesign diagrams (Inventory Tracker) still show a Lambda node as Pending for newer automation.",
        ],
      },
      {
        id: "daily-iqr-sync",
        name: "awsSyncDailyIQR (variant copy handler)",
        handler: "exports.awsCopyHandler",
        repo: "repo_om_patches/lamdba_function/awsSyncDailyIQR",
        trigger: "SNS / S3 records (same pattern as AWSOMFileMovement)",
        steps: [
          { label: "S3 / SNS event", kind: "trigger" },
          { label: "awsSyncDailyIQR", kind: "lambda" },
          { label: "Copy → deerwalk-iqr", kind: "aws" },
          { label: "POST …/fileManager/dailyIQR/save", kind: "om" },
        ],
        notes: [
          "Same architectural pattern as AWSOMFileMovement with a different output bucket name in source.",
          "Feeds Daily IQR / File Change Report paths visible under Processing Dashboard.",
        ],
      },
      {
        id: "ftp-automation",
        name: "FTP feed automation (account provisioning)",
        handler: "lambda_handler",
        repo: "repo_om_patches/R_10.6.0/{QC,UAT,PROD}/lambda",
        trigger: "SQS queue ftp_feed_automation_<ENV>",
        steps: [
          { label: "Cloud IT / feed message → SQS", kind: "trigger" },
          { label: "FTP automation Lambda", kind: "lambda" },
          { label: "Lookup Application + Vendor in OM API", kind: "om" },
          { label: "POST FtpAccount/save", kind: "om" },
          { label: "Email FTP Account Status", kind: "exit" },
        ],
        notes: [
          "Payload fields: Client_Name, FTP_Name, Host_URL, UserName, Vendor.",
          "Per-environment config and email templates live under R_10.6.0/<ENV>/lambda.",
          "UI surface: File Management → FTP Accounts (Active / Termed / Shared).",
        ],
      },
    ],
  },

  processing: {
    title: "Processing Dashboard — Lambda flows",
    summary:
      "Cluster and engine events reach OM through SNS → (optional env filter) → SQS → Lambda → omproservice. Spot interruption warnings are a separate Lambda that enriches the EC2 event and notifies OM.",
    flows: [
      {
        id: "sns-filter",
        name: "lam_om_<env>_sns_filter",
        handler: "handler",
        repo: "repo_om_processingcalendar/lambdas/lam_om_qc_sns_filter (+ env siblings)",
        trigger: "SNS processing-notifications topic",
        steps: [
          { label: "EMR / processing SNS", kind: "trigger" },
          { label: "sns_filter Lambda", kind: "lambda" },
          { label: "Resolve env from DynamoDB / EMR tags", kind: "decision" },
          { label: "Match topic ARN to environment?", kind: "decision" },
          { label: "Forward to env SQS queue", kind: "aws" },
        ],
        notes: [
          "Uses DynamoDB cluster record table when present; otherwise describes the EMR cluster tags for Processing Environment.",
          "Mismatched environment is dropped (no SQS send).",
        ],
      },
      {
        id: "sqs-reader",
        name: "lam_om_<env>_sqs_reader",
        handler: "handler",
        repo: "repo_om_processingcalendar/lambdas/lam_om_{qc,uat,prod}_sqs_reader",
        trigger: "SQS sqs-om-<env>-processing_notification-queue",
        steps: [
          { label: "SQS notification message", kind: "trigger" },
          { label: "sqs_reader Lambda", kind: "lambda" },
          { label: "Cluster event vs engine event", kind: "decision" },
          { label: "POST omproservice …/processing/saveNotification", kind: "om" },
          { label: "Optional …/processing/terminate", kind: "om" },
          { label: "Delete SQS message", kind: "exit" },
        ],
        notes: [
          "triggerBy is set to the Lambda name (e.g. lam_om_qc_sqs_reader).",
          "Surfaces on Processing Dashboard execution monitoring and related ticket phase updates.",
        ],
      },
      {
        id: "spot",
        name: "om-spot-termination",
        handler: "handler",
        repo: "repo_om_processingcalendar/lambdas/om-spot-termination",
        trigger: "SNS EC2 Spot Instance Interruption Warning (~2 min)",
        steps: [
          { label: "Spot interruption SNS", kind: "trigger" },
          { label: "om-spot-termination", kind: "lambda" },
          { label: "Describe EC2 + EMR instance group", kind: "aws" },
          { label: "Notify OM (MASTER vs CORE)", kind: "om" },
        ],
        notes: [
          "Adds InstanceType, AvailabilityZone, and InstanceGroup before notifying OM.",
          "Relevant when Processing Dashboard / Autopilot clusters run on spot capacity.",
        ],
      },
    ],
  },

  jobs: {
    title: "Jobs — Lambda flows",
    summary:
      "Job automation redesigns (IFR Job Automation) reference a Lambda step that is still Pending in design diagrams. Snowflake can call an OM Lambda API via an external function used by master executor procedures.",
    flows: [
      {
        id: "ifr-pending",
        name: "IFR Job Automation Lambda (design)",
        handler: "—",
        repo: "repo_om_patches/development/diagram/draw.io/IFR_Job_Automation_Redesign.drawio",
        trigger: "Documented as pending in redesign",
        steps: [
          { label: "IFR / job automation trigger", kind: "trigger" },
          { label: "Lambda [Status: Pending]", kind: "lambda" },
          { label: "OM Jobs / S3 job create", kind: "om" },
        ],
        notes: [
          "Treat as planned architecture, not a shipped handler in the scanned repos.",
          "Live S3 Copy/Parse job creation today is still primarily OM Jobs + OM Job Automation paths.",
        ],
      },
      {
        id: "snowflake-lambda",
        name: "CALL_LAMBDA_API_OM (Snowflake external function)",
        handler: "API Gateway → Lambda",
        repo: "repo_om_patches/Snowflake/V_17.8.0/…/CALL_LAMBDA_API_OM.sql",
        trigger: "Snowflake CALL / master executor procedures",
        steps: [
          { label: "Snowflake procedure", kind: "trigger" },
          { label: "EXTERNAL FUNCTION CALL_LAMBDA_API_OM", kind: "aws" },
          { label: "API Gateway …/qc (env-specific)", kind: "aws" },
          { label: "OM Lambda integration", kind: "lambda" },
          { label: "Variant response to Snowflake", kind: "exit" },
        ],
        notes: [
          "API_INTEGRATION name pattern: OM_<ENV>_LAMBDA_API_INTEGRATION.",
          "Used from master executor client/custom procedures that orchestrate downstream work.",
        ],
      },
    ],
  },

  admin: {
    title: "Admin — Lambda touchpoints",
    summary:
      "No Admin-owned Lambda package was found. FTP automation writes through OM API endpoints that Admin/DAC personas also maintain in File Management.",
    flows: [
      {
        id: "admin-ftp",
        name: "FTP automation → OM API (shared with File Management)",
        moduleJump: "files",
        repo: "repo_om_patches/R_10.6.0/*/lambda",
        steps: [
          { label: "SQS ftp_feed_automation", kind: "trigger" },
          { label: "FTP Lambda", kind: "lambda" },
          { label: "OM API FtpAccount/save", kind: "om" },
        ],
        notes: ["See File Management Lambda section for the full step list."],
      },
    ],
  },

  reports: {
    title: "Reports — Lambda touchpoints",
    summary:
      "Front-end Report controllers treat a backend status message of \"lambda\" as an async generation path for Groupwise Ad hoc SQR-style extracts.",
    flows: [
      {
        id: "sqr-lambda",
        name: "Groupwise Ad hoc extract (async Lambda path)",
        handler: "server returns message: \"lambda\"",
        repo: "repo_om_frontv2 …/report/controllers.js (+ reportapi)",
        trigger: "User starts Groupwise Ad hoc generation in Reports",
        steps: [
          { label: "Reports UI request", kind: "trigger" },
          { label: "Report API accepted", kind: "om" },
          { label: "message = lambda (async)", kind: "lambda" },
          { label: "UI: data is being generated", kind: "exit" },
        ],
        notes: [
          "Distinct from message inProgress (dialog) vs lambda (button message) in the controller.",
          "Exact Lambda function name is not declared in the front-end; confirm against reportapi / infra if needed.",
        ],
      },
    ],
  },

  production: {
    title: "Production Manager — Lambda touchpoints",
    summary:
      "No Production Manager–specific Lambda package was found. Ticket phase progress still depends on processing notification Lambdas (Processing Dashboard) and file unstaging from File Inventory.",
    flows: [
      {
        id: "prod-via-processing",
        name: "Cluster notifications that update processing work",
        moduleJump: "processing",
        repo: "repo_om_processingcalendar/lambdas",
        steps: [
          { label: "EMR / engine event", kind: "trigger" },
          { label: "sns_filter + sqs_reader", kind: "lambda" },
          { label: "omproservice notification", kind: "om" },
          { label: "Visible on ticket / dashboard", kind: "exit" },
        ],
      },
    ],
  },

  home: {
    title: "Home Dashboard — Lambda flows",
    summary: "No AWS Lambda packages in the scanned OM repos map directly to Home Dashboard.",
    flows: [],
  },
  login: {
    title: "Login — Lambda flows",
    summary: "Authentication is CAS-based. No Lambda is involved in the scanned OM sign-on path.",
    flows: [],
  },
  accounts: {
    title: "Accounts — Lambda flows",
    summary:
      "No Accounts-module Lambda was found. FTP automation resolves Application records via OM API when provisioning FTP accounts.",
    flows: [],
  },
  sla: {
    title: "SLA Report — Lambda flows",
    summary: "No SLA-specific Lambda was found in the scanned OM repos.",
    flows: [],
  },
  blinding: {
    title: "Blinding Status — Lambda flows",
    summary:
      "Blinding Status is driven by JetStore callbacks into OM. No dedicated Blinding Lambda package was found under the scanned repos (JetStore integration is documented under Processing Dashboard).",
    flows: [],
  },
};
