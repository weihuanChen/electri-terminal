This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## SMTP for Inquiry Forms

Inquiry forms (`/contact`, `/rfq`, product inquiry form) now submit to `POST /api/inquiries`.

Set these environment variables in `.env.local`:

```bash
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-mailbox@your-domain.com
SMTP_PASS=your-mailbox-password
SMTP_FROM=Electri Pro <your-mailbox@your-domain.com>
SMTP_TO=sales@your-domain.com
# Optional:
SMTP_CC=manager@your-domain.com
```

Notes:
- `SMTP_TO` is the destination mailbox that receives inquiry emails.
- The submitter email is set as `replyTo`.
- If Convex is available, inquiry records are also written into the `inquiries` table.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
