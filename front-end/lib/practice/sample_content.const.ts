/**
 * Seed content for the demo.
 *
 * Part 6 of the spec is explicit: no lorem, no "Acme Corp". This is a
 * believable CV for a Vietnamese student in Australia and a posting written
 * the way Australian graduate ads actually are — requirements the CV only
 * partly covers, so the gap analysis has something real to find.
 */

export const SAMPLE_RESUME = `NGUYEN THI MAI LINH
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

Software Engineer, FPT Software (Ho Chi Minh City) — Jul 2023 to Dec 2024
  Owned the export pipeline for a reporting product used by four
  enterprise clients. Moved it from synchronous CSV generation to a
  queued worker; p99 export time went from 38s to 4s and timeout
  tickets stopped.

Casual Team Member, Woolworths Carlton — Feb 2025 to Nov 2025
  Weekend shifts alongside full-time study.

PROJECTS
grid-forecast — LSTM and gradient-boosted baselines for campus load.
  Forecast error 12% lower with sensor outliers retained rather than
  dropped, which was the finding the capstone turned on.

SKILLS
Python, SQL, Airflow, dbt, Kafka, PostgreSQL/TimescaleDB, Spark, AWS
Vietnamese (native), English (IELTS 7.5)`;

export const SAMPLE_JOB_POSTING = `Data Engineer — Data Platform
Atlassian · Sydney or Melbourne · Hybrid

ABOUT THE ROLE
You'll build and run the pipelines that move product and billing data
into the warehouse that finance, analytics and our product teams rely
on. You'll own datasets end to end: schema, freshness, correctness, and
the on-call that comes with them.

You'll work directly with analysts whose dashboards sit on your tables,
and you'll be the person who explains to a non-technical stakeholder why
a number moved.

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
a Temporary Graduate visa.`;
