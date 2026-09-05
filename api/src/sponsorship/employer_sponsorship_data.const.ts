/**
 * Australian employer sponsorship signals.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY RECORD HERE IS UNVERIFIED SAMPLE DATA. `is_verified` is false on all of
 * them, and the API flags any answer that cites one.
 *
 * A candidate says this out loud in a real interview, so it has to be right.
 * Before the demo, replace these from:
 *
 *   · Home Affairs list of approved Standard Business Sponsors and accredited
 *     sponsors — data.gov.au publishes it
 *   · The employer's own careers page, which usually states whether they
 *     sponsor
 *
 * Then set `is_verified: true` and record the year.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Australia has no equivalent of E-Verify, and no H-1B-style petition count or
 * lottery. What matters instead is whether the employer is an approved sponsor
 * at all, and whether they hold accredited status — accredited sponsors get
 * priority nomination processing, which is a genuinely useful thing for a
 * candidate to know and almost nobody does.
 */

export interface EmployerSponsorshipRecord {
  employer_name: string;
  aliases: string[];
  /** Whether they are an approved Standard Business Sponsor. */
  is_approved_sponsor: boolean | null;
  /** Accredited sponsors get priority processing on nominations. */
  is_accredited_sponsor: boolean | null;
  /** Roughly how many skilled visa nominations they lodged, if published. */
  recent_nomination_count: number | null;
  nomination_data_year: number | null;
  /** False until a human has checked this row against a primary source. */
  is_verified: boolean;
}

export const EMPLOYER_SPONSORSHIP_RECORDS: EmployerSponsorshipRecord[] = [
  {
    employer_name: 'Atlassian',
    aliases: ['Atlassian Pty Ltd'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 300,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Canva',
    aliases: ['Canva Pty Ltd'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 200,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Commonwealth Bank',
    aliases: ['CommBank', 'CBA', 'Commonwealth Bank of Australia'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 250,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Westpac',
    aliases: ['Westpac Banking Corporation'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 180,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'National Australia Bank',
    aliases: ['NAB'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 170,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'ANZ',
    aliases: ['Australia and New Zealand Banking Group'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 160,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Telstra',
    aliases: ['Telstra Group'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 140,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Woolworths',
    aliases: ['Woolworths Group', 'WooliesX'],
    is_approved_sponsor: true,
    is_accredited_sponsor: false,
    recent_nomination_count: 90,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Coles',
    aliases: ['Coles Group'],
    is_approved_sponsor: true,
    is_accredited_sponsor: false,
    recent_nomination_count: 70,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'REA Group',
    aliases: ['realestate.com.au', 'REA'],
    is_approved_sponsor: true,
    is_accredited_sponsor: false,
    recent_nomination_count: 60,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'SEEK',
    aliases: ['SEEK Limited'],
    is_approved_sponsor: true,
    is_accredited_sponsor: false,
    recent_nomination_count: 55,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Xero',
    aliases: ['Xero Australia'],
    is_approved_sponsor: true,
    is_accredited_sponsor: false,
    recent_nomination_count: 50,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Deloitte',
    aliases: ['Deloitte Australia', 'Deloitte Touche Tohmatsu'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 400,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Accenture',
    aliases: ['Accenture Australia'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 350,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'EY',
    aliases: ['Ernst & Young', 'Ernst and Young Australia'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 300,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'PwC',
    aliases: ['PricewaterhouseCoopers', 'PwC Australia'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 280,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'KPMG',
    aliases: ['KPMG Australia'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 260,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Macquarie Group',
    aliases: ['Macquarie Bank', 'Macquarie'],
    is_approved_sponsor: true,
    is_accredited_sponsor: true,
    recent_nomination_count: 200,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'Optus',
    aliases: ['Singtel Optus'],
    is_approved_sponsor: true,
    is_accredited_sponsor: false,
    recent_nomination_count: 80,
    nomination_data_year: 2025,
    is_verified: false,
  },
  {
    employer_name: 'CSIRO',
    aliases: ['Commonwealth Scientific and Industrial Research Organisation'],
    is_approved_sponsor: true,
    is_accredited_sponsor: false,
    recent_nomination_count: 60,
    nomination_data_year: 2025,
    is_verified: false,
  },
];

function normaliseEmployerName(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /\b(pty|ltd|limited|group|australia|inc|corporation|company|co)\b/g,
      '',
    )
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
          normalised_candidate.length > 0 &&
          (normalised_candidate === normalised_query ||
            normalised_query.includes(normalised_candidate))
        );
      });
    }) ?? null
  );
}
