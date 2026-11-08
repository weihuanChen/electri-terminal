# GA4 inquiry funnel

Measurement ID: `G-F5M3QMLTL1`. Public pages use the shared
`RouteAwareAnalytics` provider; admin pages do not send events.

| Event | Trigger |
| --- | --- |
| `rfq_click` | A same-origin link to `/contact#request-quote`, legacy `/rfq`, or `#inquiry-form`; also the contact page's Request a Quote mode button. Localized URLs and query parameters are supported. |
| `rfq_start` | First focus in an inquiry form on the current page. |
| `rfq_submit` | Successful inquiry API response, including the contact page's quote and general inquiry modes. Validation and API failures do not count. |
| `email_click` | Click on an email link. |
| `whatsapp_click` | Click on a WhatsApp link. |

`rfq_click` includes `page_path`, `page_type`, `link_text`, `link_url` (for links),
and `placement`. Placements include `header`, `footer`, `hero`, `bottom_rfq`,
`cta_banner`, `product_hero`, `family_hero`, and `contact_mode_switch`.
Other sections use their section ID when available, otherwise `content`.
Set `data-ga-placement` on a CTA or its container to provide a more specific
placement. A button without a link can declare `data-ga-event="rfq_click"` and
`data-ga-param-placement`; the provider avoids counting that click twice.
Existing events such as `hero_cta_click` remain separate from `rfq_click`.

Contact page submissions include `inquiry_type` (`rfq` or `general`) and attachment
presence flags. Form field contents and attachment names are not sent to GA4.
Clicks and form starts indicate intent; only `rfq_submit` indicates API success.

In GA4, register `placement` and `inquiry_type` as event-scoped custom dimensions
to break reports down by these values. Use `rfq_submit` as the successful inquiry
key event if conversion reporting is needed. Code changes alone do not update
GA4 property settings, and new event code must be deployed before live traffic
can use it.

Verification: `pnpm exec vitest run lib/analytics.test.ts` and
`pnpm exec playwright test tests/e2e/analytics.spec.ts`. Browser tests block the
Google tag and mock the inquiry API, so they do not send test inquiries or
analytics traffic to production.
