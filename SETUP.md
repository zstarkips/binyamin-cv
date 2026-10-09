# Vercel and contact email setup

## Deployment

Connect `zstarkips/binyamin-cv` in Vercel. Select **Next.js**, repository root, and Node.js **24.x**. Default build/install settings work: `npm run build` and `npm ci`. Pushes to `main` deploy production.

Current setup: the initial site was submitted directly through Vercel's file deployment API because the connected Vercel account lacks a GitHub Login Connection. To enable automatic updates, add GitHub under Vercel Account Settings → Authentication, then connect this repository under the project's Settings → Git. Until linked, a GitHub push alone will not update the live site.

Project: `binyamin-cv`, team: `odestar`. The Vercel connector also rejected environment-variable writes, and the local CLI was logged out. Add both variables yourself using the dashboard link below; no email variables have been installed automatically.

[Vercel environment settings](https://vercel.com/odestar/binyamin-cv/settings/environment-variables)

## Environment variables

Add these in the Vercel project under **Settings → Environment Variables**. Use Production and Preview; add Development only if needed locally. Redeploy after changing variables.

| Name | Value | Handling |
| --- | --- | --- |
| `RESEND_API_KEY` | Your actual Resend API key | Secret; enter directly in Vercel, never GitHub or client code |
| `CONTACT_FROM` | `Binyamin Portfolio <onboarding@resend.dev>` for testing | Test sender; recipient must match your Resend account email |

The recipient comes from `content/profile.json`: **binyaminmughal@outlook.com**. No separate recipient environment variable is required. Neither variable uses a `NEXT_PUBLIC_` prefix.

## Start without owning a domain

1. Create a [Resend account](https://resend.com/signup) using **binyaminmughal@outlook.com**, and verify the email. Complete password and account agreements yourself.
2. In [Resend API Keys](https://resend.com/api-keys), create a key with sending permission. Copy it directly into Vercel as `RESEND_API_KEY`.
3. Set `CONTACT_FROM` to the test sender shown above, then redeploy.
4. Submit a message through the deployed Contact page. Check Resend's email logs and your Outlook inbox/spam folder to confirm delivery. A successful API response means the provider accepted the message, not that it necessarily reached the inbox.

Resend's shared domain is for testing and only sends to the email associated with the account. If you register with another email, the current recipient will be rejected. [Official restriction](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

## Switch to your own domain later

Add a domain you own in Resend, add the exact DNS records Resend provides at your DNS host, and wait for verification. Change `CONTACT_FROM` to an address on that verified domain, for example `Binyamin Portfolio <contact@your-domain.com>`, and redeploy. Do not use that example literally. The recipient can remain Outlook. A free `vercel.app` site address does not provide an email sending domain you control.

## Local secrets

Copy `.env.example` to `.env.local` and fill values locally. `.env.local` is gitignored. No API key has been generated or stored in this repository.
