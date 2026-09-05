/**
 * Pre-built starting points, one per common field.
 *
 * Pasting a CV and a job ad is thirty seconds of dead air at the start of a
 * session, and on stage it is thirty seconds of watching somebody paste. These
 * are the fields Vietnamese students in Australia actually graduate into —
 * accounting and business are far and away the largest, which is why they lead
 * rather than software.
 *
 * Part 6 of the spec applies to all of it: no lorem, no "Acme Corp". Every CV
 * is a plausible Vietnamese student in Australia, every posting is written the
 * way Australian graduate ads actually read, and every one leaves requirements
 * the CV does not cover so the gap analysis has something real to find.
 */

export interface CareerTrack {
  track_id: string;
  label: string;
  /** One line for the picker card. */
  summary: string;
  /** Emoji marker — cheap, legible at small sizes, no icon dependency. */
  icon: string;
  employer_name: string;
  resume_text: string;
  job_posting_text: string;
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    track_id: 'accounting-finance',
    label: 'Accounting & Finance',
    summary: 'Graduate accountant at a Big Four firm, CA pathway.',
    icon: '📊',
    employer_name: 'KPMG',
    resume_text: `TRAN MINH ANH
minh.anh.tran@student.monash.edu · Melbourne VIC

EDUCATION
Monash University — Master of Professional Accounting, expected Jun 2026
  WAM 74. CPA Australia foundation exams: 4 of 6 completed.
Foreign Trade University (Hanoi) — Bachelor of International Business,
  2023. GPA 3.4/4.0.

EXPERIENCE
Accounts Assistant, Nguyen & Co Accountants (Richmond VIC)
  Mar 2025 to present, part time
  Prepare BAS and IAS lodgements for about 40 small business clients.
  Reconcile accounts in Xero and MYOB; flagged a GST coding error
  across six months of a client's transactions that had gone unnoticed.

Finance Intern, Techcombank (Hanoi) — Jun 2022 to Dec 2022
  Supported the monthly close for the retail lending division. Built
  the reconciliation spreadsheet the team still uses for provisioning.

Casual Team Member, Coles Glen Waverley — Feb 2024 to Feb 2025
  Weekend shifts alongside full-time study.

SKILLS
Xero, MYOB, Excel (advanced — Power Query, pivot models), SQL basics
Vietnamese (native), English (IELTS 7.0)`,
    job_posting_text: `Graduate Accountant — Audit & Assurance
KPMG Australia · Melbourne · Feb 2027 intake

ABOUT THE PROGRAM
Our graduate program puts you on client engagements from your first
month. You'll test controls, build working papers, and sit in the room
when we take findings back to a client's finance team.

You will be supported through the CA Program, with study leave and
fees covered.

WHAT WE'RE LOOKING FOR
· A completed degree in accounting, commerce or finance, eligible for
  CA Program entry
· Genuine curiosity about how a business actually makes money — we can
  teach the standards, not the interest
· Ability to explain a technical finding to someone who does not have
  an accounting background
· Comfort raising a concern with someone more senior than you, early,
  when something does not reconcile
· Attention to detail under deadline pressure during busy season
· Experience with audit software or data analytics tools is welcome
  but not expected

WHAT THE ROLE IS NOT
This is not a back-office role. You will be client-facing from the
start and expected to hold your own in meetings.

KPMG is an approved sponsor.`,
  },
  {
    track_id: 'business-analysis',
    label: 'Business & Management',
    summary: 'Graduate business analyst in a bank transformation team.',
    icon: '💼',
    employer_name: 'Commonwealth Bank',
    resume_text: `LE THANH HUONG
huong.le@student.unsw.edu.au · Sydney NSW · linkedin.com/in/huonglethanh

EDUCATION
UNSW Sydney — Master of Commerce (Business Analytics), expected Dec 2026
  WAM 76.
National Economics University (Hanoi) — Bachelor of Business
  Administration, 2023.

EXPERIENCE
Business Analyst Intern, Suncorp (Sydney) — Nov 2025 to Feb 2026
  Mapped the current-state process for a claims intake team of 30.
  Ran 12 stakeholder interviews and produced the requirements pack
  that fed a workflow redesign.
  Found that 22% of claims were being re-keyed between two systems;
  the fix removed about 6 hours of manual work a week.

Operations Coordinator, Tiki (Ho Chi Minh City) — Aug 2023 to Nov 2024
  Coordinated between warehouse and customer service for the
  electronics category. Built the weekly exception report that
  reduced unresolved delivery escalations from 90 to under 30.

Student Representative, UNSW Business School — 2025 to 2026
  Elected by the postgraduate cohort. Ran the feedback forum with the
  faculty each term.

SKILLS
SQL, Excel, Tableau, Jira, Confluence, BPMN process mapping
Vietnamese (native), English (IELTS 7.5)`,
    job_posting_text: `Graduate Business Analyst — Business Banking Technology
Commonwealth Bank · Sydney · Hybrid

ABOUT THE ROLE
You'll sit between our business bankers and the engineering teams that
build their tools. Your job is to work out what is actually needed,
which is rarely what was first asked for, and to write it down clearly
enough that a team can build it.

You'll be in the room for discovery workshops, you'll write user
stories, and you'll be the person a stakeholder rings when they
disagree with a scoping decision.

WHAT WE'RE LOOKING FOR
· A completed degree in business, commerce, IT or a related field
· Experience gathering requirements from people who do not agree with
  each other
· Ability to write clearly and briefly — most of this job is written
· Comfort saying "no, not in this release" and explaining why
· Familiarity with SQL and the confidence to interrogate data yourself
  rather than waiting for an analyst
· Exposure to regulated environments and change governance is a plus

CommBank is an accredited sponsor.`,
  },
  {
    track_id: 'software-engineering',
    label: 'Software Engineering',
    summary: 'Graduate backend engineer at an Australian product company.',
    icon: '⌨️',
    employer_name: 'Atlassian',
    resume_text: `PHAM QUOC BAO
bao.pham@student.uts.edu.au · Sydney NSW · github.com/baopq

EDUCATION
University of Technology Sydney — Master of Information Technology,
  expected Nov 2026. WAM 79.
Ho Chi Minh City University of Technology (HCMUT) — Bachelor of
  Software Engineering, 2023.

EXPERIENCE
Software Engineering Intern, Canva (Sydney) — Nov 2025 to Feb 2026
  Worked on the template search service. Added a caching layer in
  front of the ranking call that cut p95 latency from 340ms to 90ms.
  Wrote the load test that caught a connection-pool exhaustion bug
  before it reached production.

Backend Engineer, VNG Corporation (Ho Chi Minh City)
  Jul 2023 to Dec 2024
  Owned two services in the Zalo payments stack. Migrated one from a
  synchronous flow to an event-driven one, which took checkout errors
  during peak from about 2% to under 0.3%.
  On-call rotation, one week in four.

PROJECTS
sched-cli — an open-source cron expression debugger. 340 stars.

SKILLS
Go, Java, TypeScript, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS
Vietnamese (native), English (IELTS 7.0)`,
    job_posting_text: `Software Engineer — Graduate
Atlassian · Sydney · Hybrid

ABOUT THE ROLE
You'll join a team that owns a service end to end: you design it, you
ship it, you're on the roster when it pages. We deploy many times a
day and expect engineers to have opinions about the systems they run.

You'll spend real time in code review — giving it as well as getting
it — and you'll be expected to push back on a design you think is
wrong, including one proposed by someone senior.

WHAT WE'RE LOOKING FOR
· A completed degree in computer science, software engineering or
  equivalent practical experience
· Strong fundamentals: data structures, concurrency, and an
  understanding of what your code does at runtime
· Experience with distributed systems and the failure modes that come
  with them — retries, idempotency, partial failure
· A track record of writing tests that would actually have caught
  something
· Ability to explain a technical trade-off to a product manager
· Experience operating a service in production, including incident
  response, is highly regarded

Atlassian is an accredited sponsor.`,
  },
  {
    track_id: 'data-analytics',
    label: 'Data & Analytics',
    summary: 'Graduate data engineer on a warehouse platform team.',
    icon: '📈',
    employer_name: 'REA Group',
    resume_text: `NGUYEN THI MAI LINH
mai.linh.nguyen@student.unimelb.edu.au · Melbourne VIC · github.com/mailinhng

EDUCATION
University of Melbourne — Master of Data Science, expected Nov 2026
  WAM 78. Capstone: short-horizon demand forecasting for a campus
  microgrid, supervised by the Energy Systems group.
Ho Chi Minh City University of Technology (HCMUT) — Bachelor of
  Computer Science, 2023. GPA 8.1/10.

EXPERIENCE
Data Engineering Intern, REA Group (Melbourne) — Nov 2025 to Feb 2026
  Rebuilt the listing-enrichment batch job in Airflow. Cut the nightly
  run from 4h10m to 1h20m by partitioning on state and removing two
  redundant joins.
  Added row-count and null-rate checks across twelve upstream tables.
  Caught a silent schema change in a vendor feed in the first week.

Research Assistant, Melbourne Energy Institute — Mar 2025 to Oct 2025
  Built the ingestion path for 40Hz sensor telemetry from twelve campus
  buildings into TimescaleDB. Wrote the outlier-handling policy the
  forecasting team still uses.

Software Engineer, FPT Software (Ho Chi Minh City)
  Jul 2023 to Dec 2024
  Owned the export pipeline for a reporting product used by four
  enterprise clients. Moved it from synchronous CSV generation to a
  queued worker; p99 export time went from 38s to 4s.

Casual Team Member, Woolworths Carlton — Feb 2025 to Nov 2025

PROJECTS
grid-forecast — LSTM and gradient-boosted baselines for campus load.
  Forecast error 12% lower with sensor outliers retained rather than
  dropped, which was the finding the capstone turned on.

SKILLS
Python, SQL, Airflow, dbt, Kafka, PostgreSQL/TimescaleDB, Spark, AWS
Vietnamese (native), English (IELTS 7.5)`,
    job_posting_text: `Data Engineer — Data Platform
REA Group · Melbourne · Hybrid

ABOUT THE ROLE
You'll build and run the pipelines that move listing, audience and
billing data into the warehouse that finance, analytics and our
product teams rely on. You'll own datasets end to end: schema,
freshness, correctness, and the on-call that comes with them.

You'll work directly with analysts whose dashboards sit on your
tables, and you'll be the person who explains to a non-technical
stakeholder why a number moved.

WHAT WE'RE LOOKING FOR
· 2+ years building production data pipelines
· Strong SQL and Python; comfortable with orchestration (Airflow,
  Dagster or similar)
· Experience with streaming systems — Kafka, Kinesis or Flink — and an
  understanding of exactly-once semantics and late-arriving data
· A track record of owning data quality: tests, contracts, alerting,
  and the judgement to know which failures matter
· Comfort working with financial data and the review processes that
  come with it
· Ability to influence without authority across analytics and product

NICE TO HAVE
· dbt at scale
· Incident response experience on data systems
· Mentoring junior engineers

We are an approved sponsor and welcome applications from candidates on
a Temporary Graduate visa.`,
  },
  {
    track_id: 'ecommerce-marketing',
    label: 'E-commerce & Marketing',
    summary: 'Digital marketing coordinator at an online retailer.',
    icon: '🛒',
    employer_name: 'Woolworths',
    resume_text: `DO NGOC HA
ha.do@student.rmit.edu.au · Melbourne VIC

EDUCATION
RMIT University — Master of Marketing, expected Jul 2026. WAM 77.
University of Economics Ho Chi Minh City — Bachelor of Marketing, 2023.

EXPERIENCE
Digital Marketing Intern, Kogan.com (Melbourne)
  Jul 2025 to Dec 2025
  Ran the weekly EDM calendar for the home and kitchen category.
  Rewrote subject lines using a two-week A/B cycle; open rate went
  from 18% to 24% over the internship.
  Built the UTM tagging convention the category team now uses, which
  fixed attribution for about a third of paid traffic.

Marketing Executive, Shopee Vietnam (Ho Chi Minh City)
  Aug 2023 to Feb 2025
  Managed campaign pages for the 9.9 and 11.11 sales in the beauty
  category. Coordinated with 20+ sellers on assets and pricing.
  Grew category page conversion from 2.1% to 3.0% over four campaigns
  by changing how bundles were merchandised above the fold.

Content Creator, freelance — 2022 to 2023
  Built a TikTok following of 12,000 reviewing Vietnamese skincare
  brands. Managed brand partnerships end to end.

SKILLS
Google Analytics 4, Google Ads, Meta Ads Manager, Klaviyo, Shopify,
SQL basics, Looker Studio
Vietnamese (native), English (IELTS 7.0)`,
    job_posting_text: `Digital Marketing Coordinator — Online
Woolworths Group · Sydney · Hybrid

ABOUT THE ROLE
You'll work on the campaigns that bring customers to woolworths.com.au
and keep them coming back. That means owning parts of the email and
paid social calendar, briefing creative, and reporting honestly on
what worked.

You'll present campaign results to a category manager who cares about
sales, not impressions, and you'll be asked to defend a
recommendation with data.

WHAT WE'RE LOOKING FOR
· A completed degree in marketing, communications, business or
  similar
· Hands-on experience running paid or lifecycle campaigns, with
  numbers you can talk about
· Comfort in GA4 and the ability to build your own reporting rather
  than requesting it
· Understanding of what actually drives conversion in retail
  e-commerce — merchandising, pricing, delivery promise
· Ability to work with category and supply teams who have competing
  priorities
· Experience with retail media or marketplace platforms is a plus

Woolworths Group is an approved sponsor.`,
  },
  {
    track_id: 'cybersecurity',
    label: 'Cybersecurity',
    summary: 'Graduate security analyst in a SOC.',
    icon: '🔐',
    employer_name: 'Telstra',
    resume_text: `VU HOANG NAM
nam.vu@student.griffith.edu.au · Brisbane QLD · tryhackme.com/p/namvu

EDUCATION
Griffith University — Master of Cyber Security, expected Oct 2026
  GPA 6.2/7. Studied at the Gold Coast campus.
Posts and Telecommunications Institute of Technology (Hanoi) —
  Bachelor of Information Security, 2023.

CERTIFICATIONS
CompTIA Security+ (2024). Working toward AWS Security Specialty.

EXPERIENCE
SOC Analyst Intern, CyberCX (Brisbane) — Nov 2025 to Feb 2026
  Triaged tier-1 alerts on a managed detection service. Wrote three
  Sigma rules that reduced false positives on a noisy alert by 60%.
  Escalated a genuine credential-stuffing attempt against a client's
  VPN that had been auto-closed twice as benign.

IT Support Officer, Griffith University — 2025, part time
  Front-line support for staff and students. Handled about 25 tickets
  a day, including account lockouts and phishing reports.

Security Intern, Viettel Cyber Security (Hanoi) — 2022 to 2023
  Assisted with internal phishing simulations and wrote the reporting
  template used for the quarterly awareness review.

SKILLS
Splunk, Microsoft Sentinel, Wireshark, Python, Linux, MITRE ATT&CK,
Sigma, basic malware triage
Vietnamese (native), English (IELTS 6.5)`,
    job_posting_text: `Graduate Security Analyst — Cyber Defence Centre
Telstra · Melbourne or Sydney · Rotating roster

ABOUT THE ROLE
You'll work in our Cyber Defence Centre triaging and investigating
alerts across a very large network. You'll be part of a rotating
roster, including some out-of-hours work, and you'll be the first
person to look at something that may or may not be an incident.

Most of what you look at will be nothing. The job is staying careful
on the one that is not.

WHAT WE'RE LOOKING FOR
· A completed degree in cyber security, IT or a related field
· Working knowledge of a SIEM and the discipline to document your
  investigation as you go
· Understanding of common attack techniques and the ability to map
  what you're seeing to a framework such as MITRE ATT&CK
· Scripting ability — Python or PowerShell — to avoid doing the same
  thing twice
· The judgement to escalate early when unsure, and the confidence to
  say "I don't know yet" to someone senior
· Clear written English: your handover notes are read by people who
  were not there

Telstra is an accredited sponsor.`,
  },
];

export function findCareerTrack(track_id: string): CareerTrack | null {
  return CAREER_TRACKS.find((track) => track.track_id === track_id) ?? null;
}
