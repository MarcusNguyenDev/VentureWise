/**
 * Seed content for the demo.
 *
 * Part 6 of the spec is explicit: no lorem, no "Acme Corp". This is a
 * believable international-student resume and a posting written the way real
 * ones are — requirements the resume only partly covers, so the gap analysis
 * has something real to find.
 */

export const SAMPLE_RESUME = `PRIYA RAMANATHAN
priya.ramanathan@uw.edu · Seattle, WA · github.com/priyarm

EDUCATION
University of Washington — MS Data Science, expected May 2027
  Capstone: short-horizon load forecasting for the campus microgrid
  Coursework: distributed systems, applied statistics, ML systems
Anna University — BE Computer Science, 2024

EXPERIENCE
Data Engineering Intern, Zillow (Seattle) — Jun 2026 to Sep 2026
  Rebuilt the listing-enrichment batch job in Airflow; cut the nightly
  run from 4h10m to 1h20m by partitioning on region and dropping two
  redundant joins.
  Added row-count and null-rate checks on twelve upstream tables. Caught
  a silent schema change in a vendor feed on day three of the season.

Research Assistant, UW Applied Physics Lab — Jan 2026 to May 2026
  Built the ingestion path for 40Hz sensor telemetry from twelve campus
  buildings into TimescaleDB. Wrote the outlier-handling policy the
  forecasting team still uses.

Software Engineer, Freshworks (Chennai) — Jul 2024 to Dec 2025
  Owned the export pipeline for the reporting product. Moved it from
  synchronous CSV generation to a queued worker; p99 export time went
  from 38s to 4s and support tickets about timeouts stopped.

PROJECTS
grid-forecast — LSTM and gradient-boosted baselines for campus load.
  Forecast error 12% lower with sensor outliers retained rather than
  dropped, which was the finding the capstone turned on.

SKILLS
Python, SQL, Airflow, dbt, Kafka, PostgreSQL/TimescaleDB, Spark, AWS`;

export const SAMPLE_JOB_POSTING = `Data Engineer, Payments Data Platform
Stripe — Seattle, WA (hybrid)

WHAT YOU'LL DO
Build and operate the pipelines that move payments data from our
transactional systems into the warehouse that finance, risk and product
analytics all depend on. You will own datasets end to end: schema,
freshness, correctness, and the on-call that comes with them.

You will work directly with risk analysts whose models consume your
tables, and you will be the person who explains to a non-technical
stakeholder why a number moved.

WHAT WE'RE LOOKING FOR
· 2+ years building production data pipelines
· Strong SQL and Python; comfortable with orchestration (Airflow,
  Dagster, or similar)
· Experience with streaming systems — Kafka, Kinesis, or Flink — and an
  understanding of exactly-once semantics and late-arriving data
· Track record of owning data quality: tests, contracts, alerting, and
  the judgement to know which failures matter
· Experience working with financial or regulated data, and comfort with
  the review processes that come with it
· Ability to influence without authority across analytics and product

NICE TO HAVE
· dbt at scale
· Incident response experience on data systems
· Experience mentoring junior engineers

Stripe participates in E-Verify. We sponsor work visas for qualified
candidates.`;
