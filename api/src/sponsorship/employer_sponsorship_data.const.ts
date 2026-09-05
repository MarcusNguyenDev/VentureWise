/**
 * H-1B filing history and E-Verify enrolment for well-known employers.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY RECORD HERE IS UNVERIFIED SAMPLE DATA. `is_verified` is false on all of
 * them, and the API flags any answer that cites one.
 *
 * A candidate says this number out loud in a real interview, so it has to be
 * right. Before the demo, replace these with the real figures from:
 *
 *   · USCIS H-1B Employer Data Hub — https://www.uscis.gov/h-1b-data-hub
 *   · DOL Office of Foreign Labor Certification disclosure data
 *   · E-Verify employer search — https://www.e-verify.gov/
 *
 * Then set `is_verified: true` and record the year you pulled it from.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * E-Verify enrolment matters beyond the talking point: the 24-month STEM OPT
 * extension is only available where the employer is enrolled.
 */

export interface EmployerSponsorshipRecord {
  /** Matched case-insensitively against the employer name in the posting. */
  employer_name: string;
  /** Alternate spellings and legal entity names seen on postings. */
  aliases: string[];
  h1b_petitions_last_year: number | null;
  petition_data_year: number | null;
  is_e_verify_enrolled: boolean | null;
  /** False until a human has checked this row against a primary source. */
  is_verified: boolean;
}

export const EMPLOYER_SPONSORSHIP_RECORDS: EmployerSponsorshipRecord[] = [
  {
    employer_name: 'Amazon',
    aliases: ['Amazon Web Services', 'AWS', 'Amazon.com Services'],
    h1b_petitions_last_year: 4000,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Google',
    aliases: ['Alphabet', 'Google LLC'],
    h1b_petitions_last_year: 2500,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Microsoft',
    aliases: ['Microsoft Corporation'],
    h1b_petitions_last_year: 2000,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Meta',
    aliases: ['Facebook', 'Meta Platforms'],
    h1b_petitions_last_year: 1500,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Apple',
    aliases: ['Apple Inc'],
    h1b_petitions_last_year: 1400,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Deloitte',
    aliases: ['Deloitte Consulting'],
    h1b_petitions_last_year: 1800,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Capgemini',
    aliases: ['Capgemini America'],
    h1b_petitions_last_year: 1200,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'JPMorgan Chase',
    aliases: ['JPMorgan', 'JP Morgan', 'Chase'],
    h1b_petitions_last_year: 900,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Goldman Sachs',
    aliases: ['Goldman Sachs & Co'],
    h1b_petitions_last_year: 700,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Nvidia',
    aliases: ['NVIDIA Corporation'],
    h1b_petitions_last_year: 800,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Salesforce',
    aliases: ['Salesforce.com'],
    h1b_petitions_last_year: 600,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Intel',
    aliases: ['Intel Corporation'],
    h1b_petitions_last_year: 900,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'IBM',
    aliases: ['International Business Machines'],
    h1b_petitions_last_year: 1000,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Oracle',
    aliases: ['Oracle America'],
    h1b_petitions_last_year: 700,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Qualcomm',
    aliases: ['Qualcomm Technologies'],
    h1b_petitions_last_year: 600,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Uber',
    aliases: ['Uber Technologies'],
    h1b_petitions_last_year: 400,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Stripe',
    aliases: ['Stripe Inc'],
    h1b_petitions_last_year: 200,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Databricks',
    aliases: ['Databricks Inc'],
    h1b_petitions_last_year: 250,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Snowflake',
    aliases: ['Snowflake Computing'],
    h1b_petitions_last_year: 200,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
  {
    employer_name: 'Accenture',
    aliases: ['Accenture LLP'],
    h1b_petitions_last_year: 2200,
    petition_data_year: 2024,
    is_e_verify_enrolled: true,
    is_verified: false,
  },
];

function normaliseEmployerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findEmployerSponsorshipRecord(
  employer_name: string | null,
): EmployerSponsorshipRecord | null {
  if (!employer_name) return null;

  const normalised_query = normaliseEmployerName(employer_name);
  if (normalised_query.length === 0) return null;

  return (
    EMPLOYER_SPONSORSHIP_RECORDS.find((record) => {
      const candidate_names = [record.employer_name, ...record.aliases];

      return candidate_names.some((candidate) => {
        const normalised_candidate = normaliseEmployerName(candidate);

        return (
          normalised_candidate === normalised_query ||
          normalised_query.includes(normalised_candidate)
        );
      });
    }) ?? null
  );
}
