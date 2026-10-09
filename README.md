# Binyamin — Personal Portfolio

Next.js portfolio personalized from Binyamin's CV, with the Ryan demo's card layout, responsive navigation, light/dark gear switch, downloadable full-profile PDF, and a server-side Resend contact endpoint.

## Run locally

Use Node.js 22 or 24.

```sh
npm ci
npm run dev
```

Open http://localhost:3100. For production: `npm run build` then `npm start`. Run `npm test` for contact validation/provider behavior tests.

## Edit your details

Edit `content/profile.json` and commit to GitHub. After completing the Git connection described in SETUP.md, Vercel rebuilds the website from that repository. There is no admin login or database to configure.

- `name`, `roles`, `description`, `biography`, `email`, `phone`, `address`, `socials`: main profile and contact details. `description` is the short website introduction; `biography` is the complete PDF introduction.
- `experience`, `education`, `services`, `skills`, `strengths`, `interests`: CV sections.
- `works` and `blog`: currently empty, ready for your real content. See `content/profile.example.json` for object structure only; its sample claims are not your profile.
- `pricing`, `clients`, `testimonials`: hidden until populated.
- Images belong in `public/images`; use paths such as `/images/my-project.jpg`.
- `mapEmbedUrl`: optional trusted map embed URL. Without it, the site shows your city and a Maps link.

Download CV generates a PDF from this same data on the server, including all populated profile sections. The original uploaded CV is not publicly hosted. Family details, financial details, precise home address, and third-party reference contacts were omitted from the public profile.

## Email and deployment

See [SETUP.md](SETUP.md) for Vercel variables and Resend setup. Email delivery needs a real API key. Without it, the form reports that email is unconfigured and provides your direct email address; it never pretends to send.

## Implementation notes

- App Router, TypeScript, React, local Poppins fonts, pdf-lib/fontkit.
- Contact recipient is always the profile email, never a visitor-supplied destination. Replies go to the visitor's validated email.
- Basic spam controls: honeypot, minimum submission time, bounded input, same-origin checks, and best-effort per-instance throttling. For sustained public traffic, configure Vercel Firewall rate limits; memory counters do not coordinate across server instances.
- No analytics, database, payment integrations, or fabricated portfolio entries.
- See [design-qa.md](design-qa.md) for verification and intentional differences.

## Design assets

Visual reference and original theme CSS/assets: [Ryan by bslthemes](https://bslthemes.com/html/ryan/index-new-demo-1.html). Original theme assets remain subject to their owners' license terms; this repository does not grant a commercial theme license. Obtain the applicable Ryan license for production use. The user's supplied portrait is used as provided. Font Awesome, Ionicons, and Poppins retain their upstream licenses.
