Below is a **complete Figma Make prompt / product requirements brief** for the **Vesta Employee iOS app**. It is written so you can paste it directly into Figma Make or give it to a product designer.

---

# Vesta Employee Mobile App Requirements

## 1. Product vision

Design a clean, native-feeling iOS mobile application for restaurant employees to manage their work life in one place.

The app should help employees:

1. Know when and where they work next.
2. Manage their personal and legal information.
3. Join employers/restaurants through invites.
4. Submit availability and unavailability.
5. View schedules and shift details.
6. Clock in and out during work.
7. Upload required documents.
8. View payslips, contracts, tax documents, and employment records.
9. Receive important updates from their employer.
10. Resolve pending tasks quickly.

The app must feel like a premium native iOS application, not a generic web dashboard inside a phone frame.

Use Apple Human Interface Guidelines as the foundation. Prioritize hierarchy, harmony, consistency, platform conventions, SF Symbols, Dynamic Type, system colors, accessibility, and native iOS navigation patterns. Apple’s HIG emphasizes clear hierarchy, platform consistency, system-defined components, accessible text sizing, SF Symbols, and colors that work across light, dark, and increased-contrast modes. ([Apple Developer][1])

---

# 2. Core design principles

## 2.1 Native iOS first

The interface should look and behave like a real iOS app.

Use:

* iOS tab bar navigation.
* Large navigation titles.
* Native list layouts.
* Native forms.
* Native date/time pickers.
* Native bottom sheets only for short, temporary tasks.
* Native alerts for destructive or critical decisions.
* SF Symbols for icons.
* San Francisco as the typeface.
* iOS spacing, corner radius, gestures, and motion patterns.

Apple recommends tab bars for switching between major sections of an app, with clear labels and preferably SF Symbols. Tab bar items should remain stable instead of appearing and disappearing unpredictably. ([Apple Developer][2])

## 2.2 Extremely clean and simple

The product should feel calm, focused, and fast.

Avoid:

* Dense dashboard widgets.
* Overly colorful UI.
* Decorative illustrations unless used rarely in empty states.
* Complex tables.
* Web-app style sidebars.
* Heavy cards everywhere.
* Too many competing CTAs.
* Admin-style terminology.

Prefer:

* White or system grouped background.
* Clear typography.
* One primary action per screen.
* Short labels.
* Plain language.
* Smart defaults.
* Progressive disclosure.
* Status summaries.
* Native iOS grouped lists.

## 2.3 Employee-first, not HR-first

Employees are often busy, on mobile, and may check the app while commuting, before a shift, or during work. The app should not feel like HR software.

Design every screen around this question:

> “What does the employee need to know or do right now?”

## 2.4 Trust and privacy

This app handles sensitive data: SSN/national ID, IBAN, legal documents, payslips, addresses, tax information, employment contracts, and work location data.

The design should communicate:

* Security.
* Clarity.
* Control.
* Transparency.
* No dark patterns.
* No confusing consent flows.

Sensitive information should be partially masked by default where appropriate.

Examples:

* IBAN: `BE•• •••• •••• 1234`
* SSN / national number: `••••••-•••-12`
* Document previews should not expose sensitive thumbnails on the home screen.

---

# 3. Target users

## 3.1 Primary user

Restaurant employees, including:

* Waiters.
* Bartenders.
* Kitchen staff.
* Dishwashers.
* Shift leads.
* Students.
* Flex workers.
* Part-time staff.
* Full-time staff.
* Temporary workers.

## 3.2 User characteristics

Assume users:

* Are not HR experts.
* May be young or first-time employees.
* May work for multiple restaurants.
* May need multilingual support.
* May only use the app a few times per week.
* Need fast access before or during a shift.
* May have low patience for complicated forms.

---

# 4. Navigation structure

Use a bottom tab bar with **5 tabs maximum**.

Recommended tabs:

1. **Home**
2. **Schedule**
3. **Time**
4. **Documents**
5. **Profile**

Use SF Symbols and one-word tab labels. Apple recommends single-word tab labels where possible and SF Symbols for familiar scalable icons. ([Apple Developer][2])

## Tab details

### Home

Purpose: Important information and quick actions.

Icon suggestion: `house.fill`

### Schedule

Purpose: View shifts, availability, unavailability, shift requests.

Icon suggestion: `calendar`

### Time

Purpose: Clock in/out, break tracking, time entries.

Icon suggestion: `clock.fill`

### Documents

Purpose: Legal documents, payslips, contracts, uploads.

Icon suggestion: `doc.text.fill`

### Profile

Purpose: Personal details, employment details, settings, employers.

Icon suggestion: `person.crop.circle.fill`

---

# 5. App-wide layout rules

## 5.1 Screen structure

Each screen should use:

* Native iOS navigation bar.
* Large title on top-level screens.
* Inline title on pushed detail screens.
* Bottom tab bar on top-level screens.
* Scrollable content using iOS safe areas.
* System grouped background for settings/profile areas.
* White cards or grouped list cells for content.

## 5.2 Typography

Use San Francisco / iOS system text styles.

Use Dynamic Type text styles instead of fixed custom font sizes.

Recommended hierarchy:

* Large title: screen title.
* Title 2 / Title 3: section headers.
* Headline: card titles.
* Body: regular information.
* Callout: metadata.
* Footnote / Caption: timestamps, helper text, legal text.

Support large accessibility text sizes. Apple’s accessibility guidance specifically calls out supporting larger text sizes. ([Apple Developer][3])

## 5.3 Color

Use system colors as much as possible.

Recommended palette:

* Background: `systemBackground`
* Grouped background: `systemGroupedBackground`
* Cards: `secondarySystemGroupedBackground`
* Primary brand accent: one restrained Vesta color, used only for primary actions, active states, and important highlights.
* Success: system green.
* Warning: system orange.
* Error: system red.
* Neutral metadata: secondary label.

Colors must work in:

* Light mode.
* Dark mode.
* Increased contrast.
* Reduced transparency.

Apple recommends consistent color meanings and ensuring colors work across light, dark, and increased-contrast contexts. ([Apple Developer][4])

## 5.4 Iconography

Use SF Symbols only unless there is a strong brand reason not to.

All icons should:

* Match iOS symbol weight.
* Use consistent size.
* Use filled symbols in tab bar where appropriate.
* Never be purely decorative if they add visual noise.

SF Symbols integrate with San Francisco, align with text, support multiple weights and scales, and are designed for Apple platforms. ([Apple Developer][5])

## 5.5 Buttons

Use native iOS button styles.

Button hierarchy:

1. Primary filled button: only one per main decision area.
2. Secondary button: text or tinted.
3. Destructive button: red, only for destructive actions.
4. Toolbar button: icon or text in navigation bar.

Avoid multiple large filled buttons on the same screen.

## 5.6 Forms

Forms should be simple and grouped.

Use:

* Native grouped form sections.
* Clear labels.
* Inline validation.
* Helper text only when needed.
* Keyboard type optimized per field.
* Auto-formatting for IBAN, phone, SSN/national number.
* Save button disabled until changes are valid.
* Autosave where low-risk.
* Explicit confirmation for sensitive changes.

## 5.7 Sheets and modals

Use sheets only for short, focused workflows, such as:

* Join employer by invite code.
* Add unavailable time.
* Upload document.
* Request shift swap.
* Add time correction note.

Apple recommends keeping sheet interactions brief and occasional, and not using sheets as general navigation. ([Apple Developer][6])

---

# 6. Main feature set

## 6.1 Account creation and onboarding

### Goals

Allow employees to create an account, verify their identity/contact details, and join one or more employers.

### Screens

#### Welcome screen

Content:

* Vesta logo.
* Short value proposition: “Your work, schedule, documents, and pay in one place.”
* Primary CTA: “Create account”
* Secondary CTA: “Sign in”
* Optional: “I have an invite”

Design:

* Minimal.
* Native iOS.
* No over-designed marketing page.
* Clean white background.
* One subtle brand accent.

#### Create account

Fields:

* First name.
* Last name.
* Email.
* Phone number.
* Password.
* Confirm password.

Optional:

* Sign in with Apple.
* Passkey support.
* Email magic link.

Requirements:

* Use secure password field.
* Show password requirements only when needed.
* Verify email.
* Verify phone via SMS if needed.
* Accept terms and privacy policy.

#### Account verification

States:

* Email verification pending.
* SMS code entry.
* Verification success.
* Verification failed.

#### Join employer

Employees can join a restaurant/employer through:

1. Invite link.
2. Invite code.
3. QR code.
4. Email invitation.
5. Admin-added invitation visible after login.

Fields:

* Invite code.
* Employer confirmation screen.

Employer confirmation should show:

* Restaurant name.
* Location.
* Employer logo/avatar.
* Role offered.
* Start date, if available.
* Employment type.
* CTA: “Join employer”

Important: Do not let users accidentally join the wrong employer. Show a confirmation screen.

#### Multi-employer setup

If the employee belongs to multiple employers, the app should support switching employer context.

Rules:

* Home should show the currently selected employer.
* Schedule can show all employers or filter by employer.
* Time tracking must be employer-specific.
* Documents can be grouped by employer.
* Payslips are employer-specific.

Recommended UI:

* Employer switcher at top of Home, Schedule, Time, and Documents.
* Use a compact pill: restaurant name + chevron.
* Tapping opens a native sheet with employer list.
* Include “All employers” where appropriate, especially Schedule and Home.

---

## 6.2 Home screen

### Purpose

The Home screen is the employee’s daily command center.

It should answer:

1. When do I work next?
2. Where do I need to go?
3. Is there anything urgent I need to do?
4. Can I quickly clock in, view schedule, upload missing documents, or check pay?

### Required sections

#### 1. Top greeting

Example:

“Good morning, Sofia”

Below:

“Bistro Noir”

or

“All employers”

Include employer switcher if multiple employers.

#### 2. Next shift card

This is the most important card.

Show:

* Date.
* Start and end time.
* Role/station.
* Restaurant/location.
* Address.
* Manager/shift lead, if available.
* Status: confirmed, changed, pending acknowledgement.
* Time until shift: “Starts in 3 hours”
* CTA: “View shift”

If shift is today and clock-in is allowed:

* Show primary CTA: “Clock in”
* Secondary: “Directions”

If no upcoming shift:

* Show empty state: “No upcoming shifts”
* CTA: “Set availability” or “View schedule”

#### 3. Important tasks

Show only high-priority actionable items.

Examples:

* “Upload your ID document”
* “Confirm schedule change”
* “Complete bank details”
* “Payslip available”
* “Contract waiting for signature”
* “Time correction requested”
* “Availability missing for next week”

Each task should have:

* Short title.
* Short explanation.
* Status badge.
* CTA.

Do not show more than 3 tasks. Add “View all” if needed.

#### 4. Quick actions

Use compact native buttons or rounded tiles.

Recommended quick actions:

* Clock in/out.
* View schedule.
* Add availability.
* Upload document.
* View payslip.
* Request leave/unavailability.

Keep to 4 to 6 maximum.

#### 5. Announcements / updates

Employer updates:

* Schedule changes.
* Policy updates.
* New document requests.
* Restaurant announcements.
* Payroll updates.

Display:

* Title.
* Employer.
* Timestamp.
* Read/unread state.

#### 6. Pay summary

Optional but useful.

Show:

* Latest payslip.
* Pay period.
* Net amount, if allowed.
* CTA: “View payslip”

If showing net pay is privacy-sensitive, allow the user to hide amounts.

#### 7. Profile completeness

Show only during onboarding or when data is missing.

Example:

“Your profile is 80% complete”

Missing:

* IBAN.
* Address.
* ID document.
* Emergency contact.

---

## 6.3 Schedule

### Purpose

Employees can view their planned shifts, manage availability, mark unavailable periods, and handle schedule changes.

### Main Schedule screen

Use segmented control:

* **Shifts**
* **Availability**
* **Requests**

Alternative: Use one calendar view with a clear filter, but segmented control is cleaner for iOS.

### Shifts view

Required views:

1. List view.
2. Calendar/week view.

Default should be list view because it is simpler and faster.

Each shift card/list item should show:

* Day and date.
* Start/end time.
* Restaurant.
* Role/station.
* Location.
* Status.
* Notes if any.
* Warning if changed recently.
* Acknowledgement required badge if applicable.

Shift statuses:

* Scheduled.
* Confirmed.
* Changed.
* Cancelled.
* Pending confirmation.
* Completed.
* No-show flagged, if applicable.
* Time correction needed.

### Shift detail screen

Show:

* Date.
* Start/end time.
* Breaks.
* Role.
* Team/section.
* Location.
* Address.
* Manager contact.
* Notes.
* Required clothing/equipment.
* Clock-in rules.
* CTA: “Get directions”
* CTA: “Add to calendar”
* CTA: “Request change” if allowed.
* CTA: “Swap shift” if supported.
* CTA: “Call restaurant” if phone available.

### Availability view

Employees can indicate:

* Preferred working times.
* Days they want to work.
* Maximum hours.
* Preferred role/station.
* Recurring availability.
* One-off availability.

Example:

“I want to work Monday 17:00 to 23:00”

Availability types:

* Available.
* Preferred.
* Unavailable.
* Flexible.

UI requirements:

* Native week picker.
* Simple day rows.
* Add time range with a sheet.
* Allow recurring weekly pattern.
* Allow date-specific exceptions.

### Unavailability

Employees can mark when they cannot work.

Use cases:

* School.
* Vacation.
* Medical appointment.
* Personal reason.
* Already working elsewhere.
* Exam period.

Fields:

* Date or date range.
* Start/end time if partial day.
* Reason.
* Optional note.
* Attachment if required.
* Repeat option.

Statuses:

* Draft.
* Submitted.
* Approved.
* Rejected.
* Cancelled.

### Schedule requests

Employees can:

* Request time off.
* Request shift swap.
* Request shift release.
* Request correction.
* Request additional shifts.
* Respond to open shifts.

Each request should show:

* Type.
* Employer.
* Date/time.
* Status.
* Last update.
* Manager note.

---

## 6.4 Time tracking

### Purpose

Employees can clock in/out, track breaks, view time entries, and request corrections.

### Main Time screen

Show current work status prominently.

States:

#### Not clocked in

Show:

* Next eligible shift.
* Clock-in availability.
* CTA: “Clock in”
* Message if too early: “Clock-in opens 15 minutes before your shift”
* Location requirement if enabled.

#### Clocked in

Show:

* Current shift.
* Clock-in time.
* Time worked.
* Break status.
* CTA: “Start break”
* CTA: “Clock out”

#### On break

Show:

* Break start time.
* Break duration.
* CTA: “End break”

#### Clocked out

Show:

* Summary of worked shift.
* Start/end time.
* Breaks.
* Total hours.
* CTA: “Review time entry”

### Clock-in flow

Requirements:

* Confirm employer/restaurant.
* Confirm shift.
* Capture timestamp.
* Optional geolocation validation.
* Optional QR code / restaurant code.
* Optional selfie or manager PIN, only if truly required. Avoid this unless operationally necessary because it adds friction and can feel invasive.
* Show success confirmation.

### Location behavior

If location tracking is required:

* Ask permission only when needed.
* Explain why.
* Do not track constantly unless necessary.
* Use “while using app” permission where possible.
* Show clear failure states.

Example:

“Vesta uses your location only to confirm you are at the restaurant when clocking in or out.”

### Time entries

Employees can view:

* Today.
* This week.
* Previous periods.
* Per employer.

Each entry shows:

* Date.
* Shift.
* Clock-in.
* Clock-out.
* Breaks.
* Total paid time.
* Status.

Statuses:

* Draft.
* Submitted.
* Approved.
* Corrected.
* Disputed.
* Payroll locked.

### Time correction request

Employees can request changes when:

* Forgot to clock in.
* Forgot to clock out.
* Break time wrong.
* Worked longer.
* Shift was cancelled but they worked.
* Wrong location/employer.

Fields:

* Original time.
* Requested correction.
* Reason.
* Optional note.
* Optional attachment.

---

## 6.5 Documents

### Purpose

Employees can upload, view, sign, and manage employment-related documents.

### Document categories

Recommended categories:

1. **Required**
2. **Payslips**
3. **Contracts**
4. **Legal**
5. **Tax**
6. **Certificates**
7. **Other**

### Required documents

Examples:

* ID card or passport.
* Work permit.
* Student employment certificate.
* Bank account proof.
* Tax forms.
* Social security document.
* Medical certificate if needed.
* Food safety certificate.
* Signed contract.
* Emergency contact form.

Each document should show:

* Name.
* Employer.
* Status.
* Due date.
* Uploaded date.
* Expiration date if relevant.
* Rejection reason if rejected.

Statuses:

* Missing.
* Uploaded.
* Under review.
* Approved.
* Rejected.
* Expired.
* Expiring soon.

### Upload document flow

Use a sheet or pushed flow.

Options:

* Take photo.
* Choose file.
* Choose from photo library.
* Scan document.

Fields:

* Document type.
* Employer.
* Expiration date if applicable.
* Optional notes.

Requirements:

* Preview before submit.
* Allow replacing file.
* Show upload progress.
* Show clear errors.
* Compress/optimize uploads.
* Support PDF, JPG, PNG, HEIC.
* Warn users not to upload unrelated files.

### Payslips

Employees can:

* View payslip list.
* Filter by employer.
* Filter by year.
* Open payslip PDF.
* Download/share payslip.
* Hide/show net amount.
* See pay period.
* See payment date.
* See gross/net summary if available.

Payslip list item:

* Month.
* Employer.
* Net amount, optional.
* Payment date.
* Status: available, corrected, pending.

### Contracts

Employees can:

* View active contract.
* View historical contracts.
* Sign pending contracts.
* Download/share contract.
* See contract status.

Statuses:

* Draft.
* Waiting for employee signature.
* Signed.
* Expired.
* Replaced.
* Terminated.

### Document signing

If e-signature is included:

* Present document preview.
* Require confirmation.
* Capture full name.
* Capture checkbox consent.
* CTA: “Sign document”
* Success state.
* Audit trail visible if needed.

---

## 6.6 Profile and personal information

### Purpose

Employees can view and update their personal, contact, bank, legal, and employment information.

### Profile main screen

Sections:

1. Personal information.
2. Contact details.
3. Address.
4. Bank details.
5. Legal information.
6. Emergency contact.
7. Employers.
8. Security.
9. Notifications.
10. Language.
11. Help and support.

Use native grouped list style.

### Personal information

Fields:

* First name.
* Last name.
* Preferred name.
* Date of birth.
* Gender, optional and only if legally needed.
* Nationality.
* Profile photo, optional.

### Contact details

Fields:

* Email.
* Phone number.
* Secondary phone, optional.

Sensitive changes may require verification.

### Address

Fields:

* Street.
* House number.
* Bus/apartment.
* Postal code.
* City.
* Country.

### Bank details

Fields:

* IBAN.
* BIC, if needed.
* Account holder name.

Requirements:

* Format IBAN automatically.
* Validate IBAN.
* Mask IBAN in read mode.
* Require confirmation before saving.
* Show last updated date.

### Legal information

Depending on country requirements:

* National identification number.
* Social security number.
* Tax identification number.
* Work permit status.
* Student status.
* Marital/family status only if legally required for payroll.
* Dependent information only if legally required.

Important: Do not ask for unnecessary sensitive data.

### Emergency contact

Fields:

* Name.
* Relationship.
* Phone.
* Email, optional.

### Employers

Show all connected employers.

Each employer card:

* Restaurant name.
* Location.
* Role.
* Employment status.
* Start date.
* Manager contact.
* Employee number.
* Payroll status.
* Documents required.

Actions:

* Switch employer.
* View employment details.
* Leave employer, if legally/operationally allowed.
* Contact employer.

### Security

Features:

* Change password.
* Passkeys.
* Sign in with Apple.
* Two-factor authentication.
* Face ID / Touch ID app lock.
* Active sessions.
* Delete account request.
* Privacy settings.

### Notifications

Notification preferences:

* Schedule changes.
* Shift reminders.
* Clock-in reminders.
* Payslip available.
* Document requests.
* Employer announcements.
* Request approvals/rejections.
* Time correction updates.

Allow per-employer notification settings.

### Language

Support:

* English.
* Dutch.
* French.
* German, optional.
* Other depending on market.

The UI must support localization and longer translated labels.

---

# 7. Notifications and alerts

## 7.1 Push notifications

Use push notifications for:

* New schedule published.
* Shift changed.
* Shift cancelled.
* Shift reminder.
* Clock-in reminder.
* Clock-out reminder.
* Document rejected.
* Missing document reminder.
* Payslip available.
* Contract ready to sign.
* Availability deadline.
* Time correction response.
* Employer announcement.

## 7.2 In-app notification center

Add a notification center accessible from Home top-right.

Notification types:

* Tasks.
* Announcements.
* Schedule.
* Payroll.
* Documents.
* Time tracking.
* System/security.

Each notification should have:

* Title.
* Description.
* Timestamp.
* Employer.
* Read/unread state.
* Deep link to relevant screen.

---

# 8. Additional useful employee features

These are strong additions for the mobile app.

## 8.1 Open shifts

Employees can view and claim available shifts.

Features:

* Open shifts list.
* Filter by employer/location.
* Filter by date.
* Show role, time, estimated hours.
* CTA: “Request shift”
* Status: requested, approved, rejected, withdrawn.

## 8.2 Shift swap

Employees can request to swap a shift with another employee.

Features:

* Select shift.
* Choose coworker or “open to anyone”.
* Add reason.
* Submit request.
* Track status.

## 8.3 Team / coworker view

Optional, privacy-sensitive.

Show only relevant information:

* Who is working the same shift.
* Shift lead.
* Manager contact.

Do not show private contact details unless allowed.

## 8.4 Inbox / messages

A simple employer communication area.

Features:

* Announcements.
* Direct messages from manager, optional.
* Read receipts, optional.
* Attachments, optional.

Keep it lightweight. Do not build Slack inside the app.

## 8.5 Help center

Employees need support for common issues.

Topics:

* Forgot to clock in.
* Wrong payslip.
* Missing document.
* Cannot join employer.
* Update bank details.
* Change availability.
* Contact manager.
* Contact Vesta support.

## 8.6 Calendar sync

Allow users to add shifts to Apple Calendar.

Options:

* Add single shift.
* Subscribe to schedule calendar, if supported.
* Notify about schedule changes.

## 8.7 Widgets and Live Activities

Future enhancement, not MVP.

Possible iOS widgets:

* Next shift.
* Clocked-in status.
* Today’s schedule.

Possible Live Activity:

* Active shift timer.
* Break timer.

Only implement if core app experience is already excellent.

---

# 9. Core user flows

## 9.1 Create account and join employer

Flow:

1. Welcome.
2. Create account.
3. Verify email/phone.
4. Enter invite code or open invite link.
5. Confirm employer.
6. Complete required profile basics.
7. Upload required documents.
8. Land on Home.

Success state:

“Joined Bistro Noir. Your next steps are ready.”

## 9.2 Existing user joins another employer

Flow:

1. Profile or Home employer switcher.
2. Tap “Join employer”.
3. Enter invite code / scan QR.
4. Confirm restaurant.
5. Accept.
6. Employer added.
7. App asks whether to switch to new employer.

## 9.3 Complete profile

Flow:

1. Home task: “Complete your bank details”.
2. Opens Bank details screen.
3. User enters IBAN.
4. App validates.
5. Confirmation screen.
6. Save.
7. Task disappears.

## 9.4 Upload required document

Flow:

1. Home task or Documents tab.
2. Select missing document.
3. Choose source: camera, files, photos.
4. Preview document.
5. Submit.
6. Status becomes “Under review”.
7. User receives approval/rejection notification later.

## 9.5 View next shift

Flow:

1. Home next shift card.
2. Tap “View shift”.
3. Shift detail.
4. User can view location, notes, coworkers, and clock-in rules.
5. User can get directions or add to calendar.

## 9.6 Submit availability

Flow:

1. Schedule tab.
2. Availability segment.
3. Choose week.
4. Tap day.
5. Add available/preferred/unavailable time range.
6. Save.
7. Overview updates.

## 9.7 Request unavailability

Flow:

1. Schedule tab.
2. Availability.
3. Tap “Add unavailable time”.
4. Select date/range.
5. Select time if partial day.
6. Add reason.
7. Submit.
8. Status becomes “Pending”.

## 9.8 Clock in

Flow:

1. Time tab or Home CTA.
2. App shows eligible shift.
3. User taps “Clock in”.
4. App validates time/location.
5. Confirmation.
6. Active shift screen starts.

Failure states:

* Too early.
* Too far from restaurant.
* No scheduled shift.
* Missing permission.
* Already clocked in.
* Network error.

## 9.9 Clock out

Flow:

1. Active shift screen.
2. Tap “Clock out”.
3. Confirm breaks.
4. Add optional note.
5. Submit.
6. Show summary.

## 9.10 View payslip

Flow:

1. Documents tab.
2. Payslips.
3. Select payslip.
4. PDF opens.
5. User can share/download.

---

# 10. Screen-by-screen requirements

## 10.1 Welcome

Elements:

* Logo.
* Short intro.
* Create account button.
* Sign in button.
* Invite code shortcut.

Tone:

Simple, trustworthy, not marketing-heavy.

## 10.2 Sign in

Elements:

* Email.
* Password.
* Sign in.
* Forgot password.
* Sign in with Apple.
* Passkey option.

## 10.3 Home

Elements:

* Greeting.
* Employer switcher.
* Notification icon.
* Next shift card.
* Important tasks.
* Quick actions.
* Updates.
* Pay summary.
* Profile completeness if needed.

## 10.4 Schedule

Elements:

* Large title.
* Employer filter.
* Segmented control.
* Shift list/calendar.
* Add availability CTA.
* Requests.

## 10.5 Shift detail

Elements:

* Shift status.
* Date/time.
* Location.
* Role.
* Notes.
* Team.
* Actions.

## 10.6 Availability editor

Elements:

* Week selector.
* Day rows.
* Time ranges.
* Add button.
* Recurrence option.
* Save.

## 10.7 Time

Elements:

* Work status.
* Clock-in/out CTA.
* Break controls.
* Current shift.
* Recent time entries.
* Correction request.

## 10.8 Active shift

Elements:

* Timer.
* Shift details.
* Break button.
* Clock out button.
* Safety/help link.

## 10.9 Documents

Elements:

* Required document tasks.
* Category list.
* Payslips.
* Contracts.
* Upload button.
* Search/filter.

## 10.10 Document detail

Elements:

* Preview.
* Status.
* Employer.
* Upload date.
* Expiration date.
* Rejection reason.
* Replace/upload action.

## 10.11 Payslip list

Elements:

* Year filter.
* Employer filter.
* Monthly payslips.
* Net amount toggle.
* PDF access.

## 10.12 Profile

Elements:

* User avatar/name.
* Profile completeness.
* Personal info.
* Contact.
* Address.
* Bank.
* Legal.
* Emergency contact.
* Employers.
* Security.
* Notifications.
* Language.
* Help.

## 10.13 Edit personal info

Elements:

* Native form.
* Validation.
* Save button.
* Sensitive-change confirmation.

## 10.14 Employer detail

Elements:

* Restaurant name.
* Location.
* Role.
* Employment type.
* Start date.
* Manager.
* Employee ID.
* Documents required.
* Payroll info.

## 10.15 Notifications

Elements:

* List grouped by date.
* Unread indicators.
* Filter by type.
* Deep links.

## 10.16 Help

Elements:

* Search.
* Common topics.
* Contact employer.
* Contact Vesta support.
* Report issue.

---

# 11. Data requirements

## Employee profile

* Employee ID.
* First name.
* Last name.
* Preferred name.
* Date of birth.
* Email.
* Phone.
* Address.
* Nationality.
* Legal identifiers.
* Bank details.
* Emergency contact.
* Profile photo.
* Language.
* Notification preferences.

## Employer relation

* Employer ID.
* Restaurant name.
* Location.
* Role.
* Employment type.
* Start date.
* End date.
* Status.
* Employee number.
* Manager contact.
* Payroll configuration.
* Required documents.

## Shift

* Shift ID.
* Employer ID.
* Location ID.
* Start time.
* End time.
* Break rules.
* Role.
* Station.
* Notes.
* Status.
* Acknowledgement required.
* Clock-in window.
* Location requirement.

## Availability

* Employee ID.
* Employer ID, optional.
* Date/range.
* Time range.
* Type.
* Recurrence.
* Reason.
* Status.

## Time entry

* Time entry ID.
* Shift ID.
* Employer ID.
* Clock-in time.
* Clock-out time.
* Breaks.
* Total hours.
* Location validation.
* Status.
* Correction requests.

## Document

* Document ID.
* Employee ID.
* Employer ID.
* Type.
* File.
* Status.
* Upload date.
* Expiration date.
* Review note.
* Rejection reason.

## Payslip

* Payslip ID.
* Employer ID.
* Pay period.
* Payment date.
* Gross amount.
* Net amount.
* File.
* Status.

---

# 12. Permissions

## Required permissions

Only request permissions when needed.

### Notifications

Ask after the user has joined an employer and understands why notifications are useful.

Permission explanation:

“Get notified about schedule changes, shift reminders, payslips, and document requests.”

### Location

Ask only before first clock-in if location validation is enabled.

Permission explanation:

“Vesta uses your location only when clocking in or out to confirm you are at the restaurant.”

### Camera

Ask when uploading or scanning a document.

### Photos/files

Ask when selecting a document.

### Calendar

Ask when adding shifts to Apple Calendar.

---

# 13. Empty states

Every empty state should be useful and actionable.

Examples:

## No upcoming shifts

Title: “No upcoming shifts”

Text: “Your schedule will appear here when your employer publishes it.”

CTA: “Set availability”

## No documents

Title: “No documents yet”

Text: “Payslips, contracts, and uploaded documents will appear here.”

## No payslips

Title: “No payslips available”

Text: “Your payslips will appear here once your employer publishes them.”

## No employer joined

Title: “Join your employer”

Text: “Use an invite code or link from your restaurant.”

CTA: “Enter invite code”

---

# 14. Error states

Use plain language.

Examples:

## Invite code invalid

“Invite code not found. Check the code and try again.”

## Location too far

“You seem to be away from the restaurant. Move closer or ask your manager for help.”

## Upload failed

“Upload failed. Check your connection and try again.”

## IBAN invalid

“This IBAN does not look valid. Check the number and try again.”

## Clock-in too early

“Clock-in opens 15 minutes before your shift.”

## Payroll locked

“This time entry can’t be changed because payroll has already been processed.”

---

# 15. Accessibility requirements

The app must support:

* Dynamic Type.
* VoiceOver labels.
* Sufficient color contrast.
* Reduce Motion.
* Dark Mode.
* Increased Contrast.
* Larger tap targets.
* Clear focus order.
* No color-only status communication.
* Plain language.
* Localized text expansion.

All icons must have accessible labels where needed.

Status badges should include text, not only color.

---

# 16. Privacy and security requirements

## Sensitive data

Mask sensitive information by default.

Examples:

* IBAN.
* SSN / national ID.
* Tax number.
* Document thumbnails.
* Payslip amounts, optionally.

## Authentication

Support:

* Secure login.
* Passkeys, ideally.
* Face ID / Touch ID app lock.
* Session management.
* Two-factor authentication, optional but recommended.

## Auditability

For important changes, store:

* Who changed it.
* When it changed.
* Previous value, where legally allowed.
* Verification status.

Important changes:

* IBAN.
* Legal identifiers.
* Address.
* Contract signature.
* Time corrections.
* Document uploads.

---

# 17. MVP scope

## Must-have for MVP

1. Account creation and login.
2. Join employer through invite.
3. Multi-employer support.
4. Home screen with next shift, tasks, quick actions.
5. View schedule.
6. Submit availability/unavailability.
7. Clock in/out.
8. View time entries.
9. Upload documents.
10. View required document status.
11. View payslips.
12. Edit personal/contact/bank/legal info.
13. Notifications.
14. Basic help/support.
15. Dark mode and accessibility support.

## Should-have after MVP

1. Shift swaps.
2. Open shifts.
3. Calendar sync.
4. Contract e-signing.
5. Advanced time correction.
6. Team view.
7. Per-employer notification preferences.
8. Face ID / Touch ID app lock.

## Later

1. iOS widgets.
2. Live Activities.
3. In-app messaging.
4. AI assistant for employee questions.
5. Smart schedule suggestions.
6. Expense claims.
7. Tips tracking.
8. Training modules.

---

# 18. Figma design system requirements

Create a lightweight iOS-native design system.

## Components

Design the following components:

### Navigation

* Bottom tab bar.
* Navigation bar with large title.
* Inline detail navigation bar.
* Employer switcher.
* Notification button.

### Cards

* Next shift card.
* Task card.
* Announcement card.
* Payslip card.
* Document status card.
* Time status card.

### Lists

* Grouped settings list.
* Shift list item.
* Document list item.
* Time entry list item.
* Employer list item.
* Notification list item.

### Forms

* Text field row.
* Date picker row.
* Time range row.
* Select row.
* Toggle row.
* Upload row.
* Validation message.
* Save footer.

### Status indicators

* Missing.
* Pending.
* Approved.
* Rejected.
* Expired.
* Confirmed.
* Changed.
* Clocked in.
* On break.
* Payroll locked.

### Buttons

* Primary filled button.
* Secondary tinted button.
* Text button.
* Destructive button.
* Icon button.
* Floating or bottom sticky action button where appropriate.

### Empty states

* No shifts.
* No documents.
* No payslips.
* No employer.
* No time entries.

### Permission screens

* Notifications.
* Location.
* Camera/documents.
* Calendar.

---

# 19. Visual style direction

## Overall feel

Clean, calm, premium, native, efficient.

The app should feel closer to:

* Apple Wallet.
* Apple Health.
* Apple Calendar.
* Linear’s mobile cleanliness.
* Notion’s simplicity, but more native.
* Revolut’s clarity for sensitive data, but less flashy.

Avoid:

* Corporate HR dashboard aesthetic.
* Excessive gradients.
* Heavy shadows.
* Neon colors.
* Large illustrations everywhere.
* Overly playful UI.
* Dense admin tables.
* Web app patterns.

## Spacing

Use generous spacing.

Recommended:

* 16 pt horizontal screen padding.
* 12 to 16 pt between cards.
* 8 pt internal spacing for related content.
* 20 to 24 pt between major sections.

## Corners

Use native-feeling rounded corners.

Recommended:

* Cards: 16 to 20 pt.
* Buttons: 12 to 16 pt.
* Small pills/badges: capsule.

## Shadows

Use minimal shadows.

Prefer separation through:

* Background contrast.
* Grouped sections.
* Hairline dividers.
* Subtle material effects.

## Motion

Use subtle native motion.

Examples:

* Smooth sheet presentation.
* Button press feedback.
* List row transitions.
* Pull-to-refresh.
* Haptics for clock-in success.

Respect Reduce Motion.

---

# 20. Figma Make prompt

Use this as the direct prompt:

```text
Design a complete iOS mobile app for Vesta, an employee app for restaurant workers.

The app helps employees manage their work life: create an account, join one or more restaurant employers through invites, view their schedule, submit availability and unavailability, clock in/out, track time entries, upload legal documents, view contracts, view payslips, manage personal/contact/bank/legal information, receive employer updates, and complete important tasks.

The design must strictly follow Apple Human Interface Guidelines and feel extremely clean, native, modern, intuitive, and simple. It should look like a real premium iOS app, not a web dashboard. Use San Francisco typography, SF Symbols, iOS tab bar navigation, large navigation titles, grouped lists, native forms, native sheets, system colors, Dynamic Type-friendly layouts, light mode and dark mode support, and accessible contrast.

Create the following main tabs:
1. Home
2. Schedule
3. Time
4. Documents
5. Profile

Use a native iOS bottom tab bar with SF Symbols and single-word labels.

HOME SCREEN:
Create a daily command center for the employee. Include:
- Greeting with employee name.
- Employer switcher for multi-employer users.
- Notification icon.
- Large “Next shift” card showing date, time, role, restaurant, location, shift status, and time until shift.
- Primary action on shift card: Clock in if eligible, otherwise View shift.
- Quick actions: Clock in/out, View schedule, Add availability, Upload document, View payslip.
- Important tasks section with max 3 urgent tasks: missing document, schedule change confirmation, complete bank details, contract signature, time correction.
- Employer updates/announcements.
- Latest payslip/pay summary section.
- Profile completeness card if information is missing.

SCHEDULE TAB:
Include:
- Employer filter.
- Segmented control: Shifts, Availability, Requests.
- Shifts list with date, time, employer, role, location, status.
- Shift detail screen with date/time, role, break rules, location, notes, manager contact, team, get directions, add to calendar, request change.
- Availability editor with week selector, day rows, time ranges, preferred/available/unavailable states.
- Unavailability request flow with date range, time range, reason, note, status.
- Requests list for time off, shift swap, open shift, schedule change.

TIME TAB:
Include:
- Current work status card.
- States: not clocked in, clocked in, on break, clocked out.
- Big primary CTA for Clock in / Start break / End break / Clock out.
- Active shift timer.
- Current shift details.
- Recent time entries list.
- Time entry detail with clock-in, clock-out, breaks, total hours, status.
- Request correction flow with original time, requested time, reason, note.

DOCUMENTS TAB:
Include:
- Required documents section.
- Categories: Required, Payslips, Contracts, Legal, Tax, Certificates, Other.
- Document list items with status: Missing, Uploaded, Under review, Approved, Rejected, Expired, Expiring soon.
- Upload document flow with take photo, choose file, scan document, preview, submit.
- Payslip list by year/employer with month, pay period, payment date, optional net amount, PDF preview.
- Contract list with active contract, pending signature, signed, expired.
- Document detail screen with preview, status, employer, upload date, expiration date, rejection reason, replace/upload action.

PROFILE TAB:
Use native grouped settings style. Include:
- User avatar/name.
- Profile completeness.
- Personal information.
- Contact details.
- Address.
- Bank details with masked IBAN.
- Legal information with masked sensitive IDs.
- Emergency contact.
- Employers list.
- Security.
- Notifications.
- Language.
- Help and support.
- Privacy/legal.

PERSONAL INFO:
Fields include first name, last name, preferred name, date of birth, nationality, profile photo.

CONTACT:
Email, phone, secondary phone.

ADDRESS:
Street, house number, apartment/bus, postal code, city, country.

BANK:
IBAN, BIC, account holder name. Mask IBAN in read mode. Validate and confirm before saving.

LEGAL:
National number/social security number, tax number, work permit status, student status if needed. Sensitive fields must be masked in read mode.

EMPLOYERS:
Show connected restaurants with name, location, role, employment status, start date, employee number, manager contact, required documents.

ONBOARDING FLOW:
Design screens for:
- Welcome.
- Create account.
- Sign in.
- Email/phone verification.
- Enter invite code.
- Scan QR invite.
- Confirm employer/restaurant.
- Complete profile basics.
- Upload required documents.
- Success screen leading to Home.

MULTI-EMPLOYER:
Support employees working for multiple restaurants. Add an employer switcher on Home, Schedule, Time, and Documents. Allow “All employers” view where appropriate. Time tracking and documents must remain employer-specific.

NOTIFICATIONS:
Design notification center with unread states and deep links. Notification types: schedule changes, shift reminders, clock-in reminders, payslip available, document requests, document rejected, contract ready to sign, availability deadline, time correction updates, employer announcements.

DESIGN STYLE:
The app should feel clean, calm, premium, and native. Use:
- System grouped backgrounds.
- White or secondary grouped cards.
- Minimal shadows.
- Clear typography hierarchy.
- 16 pt horizontal padding.
- Rounded cards around 16 to 20 pt.
- One restrained brand accent color.
- Status colors using system green, orange, red, and gray.
- Plain language.
- No heavy gradients.
- No corporate dashboard look.
- No dense tables.
- No unnecessary decoration.

ACCESSIBILITY:
Support Dynamic Type, VoiceOver labels, large tap targets, dark mode, increased contrast, reduced motion, and no color-only status communication.

PRIVACY:
Sensitive data like IBAN, national ID, SSN, tax number, payslips, and legal documents should be masked or hidden by default where appropriate. Use clear explanations for permissions. Ask for location only when clocking in/out if location validation is required.

Create a complete clickable prototype with all major screens, empty states, error states, and key flows. Prioritize clarity, speed, and native iOS quality.
```

---

# 21. Critical product recommendation

Do **not** start by designing every possible HR feature. The employee app wins if the core daily loop is excellent:

1. **Know my next shift.**
2. **Clock in/out without friction.**
3. **Submit availability fast.**
4. **Fix missing documents/details.**
5. **View payslips.**

Everything else should support that loop. If the Home screen becomes a dumping ground for HR, payroll, documents, announcements, tasks, schedules, and messages, the app will feel heavy. Keep Home brutally focused on “what matters now.”

[1]: https://developer.apple.com/design/human-interface-guidelines/?utm_source=chatgpt.com "Human Interface Guidelines | Apple Developer Documentation"
[2]: https://developer.apple.com/design/human-interface-guidelines/tab-bars/?utm_source=chatgpt.com "Tab bars | Apple Developer Documentation"
[3]: https://developer.apple.com/design/human-interface-guidelines/accessibility?utm_source=chatgpt.com "Accessibility | Apple Developer Documentation"
[4]: https://developer.apple.com/design/human-interface-guidelines/color?utm_source=chatgpt.com "Color | Apple Developer Documentation"
[5]: https://developer.apple.com/design/human-interface-guidelines/sf-symbols?utm_source=chatgpt.com "SF Symbols | Apple Developer Documentation"
[6]: https://developer.apple.com/design/human-interface-guidelines/sheets?utm_source=chatgpt.com "Sheets | Apple Developer Documentation"
