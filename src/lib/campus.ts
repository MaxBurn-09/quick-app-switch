export const CAMPUS_DOMAIN = "mdu.edu.in";

/** Domains allowed to hold an account. The .test domain only exists for internal QA accounts. */
const ALLOWED = [CAMPUS_DOMAIN, "searchingeyes.test"];

export function emailDomain(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase().split("@")[1] ?? "";
}

export function isCampusEmail(email: string | null | undefined) {
  const domain = emailDomain(email);
  return ALLOWED.some((d) => domain === d || domain.endsWith(`.${d}`));
}

export const CAMPUS_EMAIL_MESSAGE = `Only official college email addresses (@${CAMPUS_DOMAIN}) can be used here.`;
