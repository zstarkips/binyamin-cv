# Design and functional QA

final result: passed

Scope: personalized reproduction of Ryan demo 1 with the user's requested modifications. This result means the implemented design and available functionality passed review; it does not assert literal pixel identity after personalization or real email delivery without credentials.

## Visual comparison

Compared reference and implementation side by side at 1440 × 900, and reviewed mobile at 390 × 844. Local evidence is saved under the gitignored `evidence/` directory (`comparison-before.png`, `comparison-final.png`, and mobile captures).

The main card geometry, desktop navigation, diagonal portrait edge, gradient background, Poppins typography, green accents, split content, borders, and mobile stacked layout match the reference structure. Corrected title sizing/line heights, portrait positioning, gear alignment, dark-mode edge strips, and long contact-email wrapping. No unresolved P0/P1/P2 visual defects found in reviewed views.

Intentional differences: user's portrait and CV content; gear toggles persistent light/dark mode; promotional toolbar removed; truthful empty Works/Blog; unsupported demo pricing/clients/testimonials hidden; map uses a city link instead of the reference's broken map. Longer personal copy changes some section heights. Animated text/background positions vary between screenshots.

## Functional checks

- Production Next.js build and TypeScript checks pass.
- Five automated contact tests pass: validation/header injection, fixed recipient/Reply-To, cross-origin/honeypot rejection, honest missing-configuration error, mocked provider acceptance and failure.
- Browser checks: section navigation, menu, light/dark toggle with persistence on reload, mobile navigation/form, no horizontal overflow at 390px.
- Download CV triggers an actual PDF download. The generated four-page PDF was rendered and reviewed; language groups remain together after pagination adjustment.
- Missing contact configuration returns a visible actionable error. Real Resend delivery remains pending account/API-key setup and an inbox check.
- Vercel production deployment `dpl_6hJRLA8Gs9KtyE9pDnCSwkepAm9A` reached READY. Public site https://binyamin-cv.vercel.app opened successfully without a sign-in gate, with no browser errors observed. Production Download CV downloaded a four-page PDF containing the correct name, email, and employment history. Production contact endpoint correctly reports missing email configuration.

## Content review

Professional details and portrait derive from the supplied CV and image. No invented employers, dates, project outcomes, prices, testimonials, or skill percentages. Sensitive personal details and reference contacts are omitted. Review the content for any updates since the supplied CV, especially the current employment dates.
