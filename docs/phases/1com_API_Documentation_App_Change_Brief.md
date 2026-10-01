# 1com API Documentation App — Final Change & Implementation Brief

Prepared for direct execution by Claude / coding agent

General execution principle: Preserve existing working functionality unless a change is explicitly requested below. Make customer-facing changes without breaking the underlying API integration, request formats, routes, or internal identifiers. If a requested customer-facing rename appears to affect backend/integration code, ask before changing the backend behavior.

## Scope and Priority

The application is a customer-facing API documentation and developer experience portal for 1com. The source PBX platform is Mirta PBX, but end customers must see 1com branding and only customer-relevant API capabilities.

## 1. Replace customer-facing Mirta branding with 1com

Objective: The customer must experience the portal as a 1com product, not as Mirta PBX.

- Search the entire customer-facing application for visible occurrences of “Mirta”, “Mirta PBX”, or equivalent Mirta branding in UI text, labels, headings, documentation, examples, guides, tooltips, cards, demo text, API Reference content, Playground content, and other visible copy.

- Replace customer-facing Mirta branding with the exact brand name: 1com (digit 1 + “com”, connected).

- Do not use “OneCom”, “One Com”, “1 Com”, or any other variation unless the user explicitly requests it.

- Do not blindly rename internal package names, API URLs, source-code symbols, vendor-specific backend identifiers, or integration fields if that could break functionality. If an internal Mirta identifier is not customer-visible and changing it may affect the integration, leave it unchanged or ask the user first.

Acceptance criteria:

  - No customer-facing page or documentation content exposes Mirta branding unless there is a confirmed technical reason and the user has approved it.

  - All visible branding uses exactly “1com”.

## 2. Normalize all customer-facing API key terminology

Objective: Use one simple and consistent API key label everywhere.

- In UI fields, forms, documentation, descriptions, code/example annotations, guides, demos, API Reference, Playground, and helper text, normalize customer API-key wording to exactly “API Key”.

- Remove unnecessary variants such as “Sample API Key”, “Tenant API Key”, and similar qualifiers when they refer to the normal customer API key.

- Keep capitalization consistent: “API Key”.

Acceptance criteria:

  - A global customer-facing search should not find alternate labels for the normal customer API key unless the distinction is technically required and approved by the user.

## 3. Remove all SysAdmin / Admin API key documentation from the customer portal

Objective: Customers must not see internal system-administration API capabilities or instructions.

- Identify every customer-visible section, endpoint, guide, demo, example, text block, form, parameter explanation, or workflow that requires or describes an Admin API Key / SysAdmin API Key / system-wide administrative key.

- Remove those customer-facing blocks entirely from the application. Do not merely hide them behind a visual toggle if they remain discoverable in normal customer navigation.

- Examples of content that must not be exposed include instructions such as entering an Admin API Key to list or manage all tenants/customers across the system.

- Do not document internal server-wide administration APIs in this customer-facing portal.

Acceptance criteria:

  - A customer browsing the portal cannot discover internal SysAdmin/Admin API-key instructions or system-wide tenant-management API documentation through normal UI/navigation/search.

Important: Do not delete or alter internal backend functionality unless required for the customer-facing removal. If the implementation architecture makes that distinction unclear, ask first.

## 4. Replace SRVxx prefixes in customer-facing IDs with PBX

Objective: Customer-facing examples must use PBX-based identifiers instead of server-specific SRV01/SRV02-style identifiers.

- Search customer-visible sample IDs and example values for prefixes such as SRV01, SRV02, or other SRV + number variants.

- Replace the visible SRVxx prefix with PBX.

- Example intent: a visible value such as “SRV02-<unique-id>” should be presented as “PBX-<unique-id>”.

- SRV01 / SRV02 / SRVxx should not appear in customer-facing sample identifiers.

Acceptance criteria:

  - Customer-facing examples use PBX as the visible prefix.

  - No SRVxx sample prefix remains in customer-visible documentation or demos.

Important: If a real API response returns SRVxx as an immutable live value, do not falsify the live response. Ask the user whether only examples/labels should be transformed or whether an application-level presentation mapping is required.

## 5. Remove the Console button

Objective: The Console control is not required in the customer application.

- Remove the Console button from the application UI.

- Remove its normal customer navigation entry and any dead UI space created by the removal.

- Ensure the removal does not leave broken links or layout gaps.

Acceptance criteria:

  - The Console button is no longer visible or reachable from normal customer UI.

## 6. Remove Change Log from the top navigation

Objective: Change Log is not relevant to the end customer and should not appear in the customer-facing navigation.

- Remove the Change Log section/link from the top navigation menu.

- Remove any customer-facing navigation path or menu affordance that exposes Change Log as a normal product section.

- Do not remove internal release-history data or developer-maintenance files unless that is required to eliminate the customer-facing entry point. If internal usage is unclear, ask before deleting underlying functionality.

- Ensure the removal does not leave an empty navigation slot, separator, broken route, or layout gap.

Acceptance criteria:

  - Change Log no longer appears in the top menu or normal customer-facing navigation.

## 7. Use date/time pickers instead of manual date/time typing

Objective: Reduce typing errors and improve usability wherever the user must provide a date and/or time.

- Audit the whole application for user-editable date, time, and date-time inputs.

- Replace manual free-text entry with an appropriate picker control: calendar for date, time selector for time, and a combined date-time picker where both are required.

- The picker must allow the user to select the required day, month, year, and time without manually typing the complete value.

- Preserve the exact format expected by the API when submitting the request. UI convenience must not change the backend request contract.

- Where timezone handling matters, preserve the application’s existing API semantics. If the expected timezone is unclear, ask the user before changing behavior.

Acceptance criteria:

  - Users can select dates/times visually.

  - Requests still send valid values in the API-required format.

## 8. Make Open API the primary and default API everywhere

Objective: Open API is the current primary API. Proxy API is legacy/secondary and remains available mainly for existing customers who still use it.

- Wherever Open API and Proxy API are shown together, Open API must appear first.

- Open API must be the default selection on landing/demo areas, API Reference, Guides, Playground, dropdowns/selectors, and any other relevant page.

- Proxy API must be secondary in ordering and presentation.

- Do not remove Proxy API completely; existing customers may still require it.

- If the app remembers a user’s explicit previous selection, preserve that behavior unless it conflicts with first-time/default behavior. First-time/default state must be Open API.

Acceptance criteria:

  - Open API appears first and is selected by default wherever an API type choice exists.

  - Proxy API remains accessible as a secondary/legacy option.

## 9. Add a “Most Used Cases” entry point on the landing page

Objective: Give developers immediate access to the most common integration scenarios.

- Add a professional landing-page card/entry point titled “Most Used Cases” (or keep that exact wording unless the user later chooses another label).

- Clicking the card must take the user directly to the Most Used Cases guide/section.

- The initial confirmed use cases are: Click to Call; viewing/retrieving CDRs; inbound-call popup/window integration.

- Design the card consistently with the existing product visual language; do not create a disconnected or overly decorative component.

Acceptance criteria:

  - The landing page provides a clear one-click path to the common use cases.

## 10. Add “Most Used Cases” to Guides

Objective: The same common-use-case content must also be reachable through the normal Guides navigation.

- Add “Most Used Cases” as a guide in the Guides section/menu.

- The landing-page card and the Guides entry should lead to the same canonical content unless there is a strong architectural reason not to.

- The guide must prioritize Open API examples/content by default, consistent with the global API-priority rule.

Acceptance criteria:

  - “Most Used Cases” is reachable both from the landing page and from Guides.

## 11. Add an Open API / Proxy API selector to Guides and migrate default guide references to Open API

Objective: Guides currently contain legacy Proxy API references; Open API must become the default guide context.

- Add a small API-type dropdown/selector in Guides, similar in behavior and visual style to the selector used in API Reference or Playground.

- Default selection: Open API.

- When Open API is selected, show/use the Open API guide content and references.

- Allow the user to switch explicitly to Proxy API for legacy content.

- Audit existing Guides content and update legacy Proxy API references so the default Open API view references Open API endpoints, authentication, examples, and terminology.

- Do not silently invent mappings from a Proxy endpoint to an Open API endpoint. If the correct Open API equivalent is uncertain, ask the user immediately.

Acceptance criteria:

  - Guides open in Open API mode by default.

  - Proxy API is available only when the user deliberately selects it.

  - Default guide links/examples no longer point to legacy Proxy API where an Open API equivalent is required.

## 12. Open item — MUST ask the user before implementation

Topic: Post-call data delivery / sending call details to the customer after a call ends.

- This was explicitly marked as an open topic. Do not invent the mechanism, endpoint, payload, webhook behavior, event name, authentication method, example JSON, or documentation wording.

- Before implementing this use case in “Most Used Cases”, ask the user exactly how 1com sends the data after the call, which API/event is involved, what payload is expected, and what example should be shown.

## Implementation & QA Checklist

- Perform a global search/audit across all customer-facing UI, docs, examples, Guides, API Reference, Playground, demos, labels, tooltips, and navigation — do not patch only the first visible occurrence.

- After the changes, verify both desktop and responsive/mobile layouts for broken spacing, overflow, missing labels, and navigation regressions.

- Check every API-type selector to confirm Open API is first/default and Proxy API remains selectable where required.

- Check that removing the Console control, Change Log navigation, and internal Admin/SysAdmin content does not leave empty containers, dead routes in visible navigation, separators, or broken links.

- Check all date/time controls by submitting actual requests and verifying the request format remains valid.

- Run the project’s existing lint/tests/build and any relevant end-to-end tests. Fix regressions caused by these changes.

- Do not “improve” unrelated screens, business logic, API behavior, or design patterns outside this scope unless the user approves it.

- For every ambiguity encountered during the audit or implementation, ask the user instead of guessing.

## Explicitly Out of Scope / Cancelled

Do NOT implement the previously discussed Playground/Demo audit for missing JSON responses after “Send Request”. That item was explicitly cancelled for now and must not be included in this change set.

## Suggested Execution Order

1. First audit the current codebase and create an internal checklist of affected files/components/content.

1. Apply global terminology/branding cleanup: 1com, API Key, SRVxx → PBX examples.

1. Remove customer-facing Admin/SysAdmin API content, the Console button, and the Change Log top-navigation entry.

1. Implement date/time picker controls and verify request serialization.

1. Make Open API first/default throughout the application.

1. Implement Guides API selector and update Open API guide references.

1. Add the Most Used Cases landing card and guide with the three confirmed use cases.

1. Ask the user for the missing post-call data-delivery details before adding that fourth use case.

1. Run full regression checks, build/tests, and review the application for any remaining inconsistent terminology or legacy defaults.
