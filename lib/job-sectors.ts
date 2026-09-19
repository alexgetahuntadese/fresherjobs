export const JOB_SECTORS = [
  'ICT & Technology',
  'Banking & Finance',
  'Healthcare',
  'Education',
  'Engineering & Construction',
  'Government & Public Sector',
  'NGO & Development',
  'Agriculture',
  'Manufacturing',
  'Telecommunications',
  'Hospitality & Tourism',
  'Sales & Marketing',
  'Accounting & Audit',
  'Legal & Compliance',
  'Human Resources',
  'Logistics & Transport',
  'Media & Creative',
  'Retail & Consumer Goods',
  'Other',
] as const;

export type JobSector = (typeof JOB_SECTORS)[number];