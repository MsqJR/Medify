# Feature Specification: Backend Review System

**Feature Branch**: `[001-backend-review-system]`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Implement the backend Review system..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit a Review (Priority: P1)

A patient who has completed an appointment wants to submit a review (rating and comment) using a secure link they received, so that they can share their feedback about the doctor and hospital.

**Why this priority**: Core functionality of the review system.

**Independent Test**: Can be tested by generating a valid token for a completed appointment and submitting a rating and comment via the API.

**Acceptance Scenarios**:

1. **Given** a valid secure review token for a completed appointment with no existing review, **When** the user submits a valid rating (1-5) and comment, **Then** the review is saved successfully, associated with the appointment, patient, doctor, and hospital, and a success response is returned.
2. **Given** a review token for an appointment that already has a review, **When** the user attempts to submit another review, **Then** the system rejects the submission with an appropriate error.
3. **Given** an invalid or expired review token, **When** the user attempts to submit a review, **Then** the system rejects the request with an authorization error.
4. **Given** a valid token but the appointment is not completed/confirmed, **When** the user attempts to submit a review, **Then** the system rejects the submission with a validation error.

---

### User Story 2 - Retrieve Review Information for Submission (Priority: P2)

When a patient clicks the review link, the frontend needs to retrieve the appointment details using the secure token to display the context (doctor, hospital) before the user submits the review.

**Why this priority**: Essential for providing a good user experience on the review form.

**Independent Test**: Can be tested by querying the GET API with a valid token and verifying the returned data.

**Acceptance Scenarios**:

1. **Given** a valid secure review token, **When** the system requests review information, **Then** the system returns the relevant appointment, doctor, and hospital details.
2. **Given** an invalid token, **When** the system requests review information, **Then** the system returns an appropriate error.

---

### Edge Cases

- What happens if the rating submitted is outside the 1-5 range?
- What happens if the comment is excessively long?
- How does the system handle concurrent review submissions for the same appointment?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow retrieving appointment context information using a secure, unique review token.
- **FR-002**: System MUST allow submitting a review containing a rating (1-5) and an optional comment using the secure review token.
- **FR-003**: System MUST link a submitted review to the specific Appointment, Patient, Doctor, and Hospital.
- **FR-004**: System MUST enforce that only ONE review can exist per appointment.
- **FR-005**: System MUST validate that the appointment associated with the token exists and is in a "completed" or "confirmed" state before accepting a review.
- **FR-006**: System MUST track whether a review request email has been sent for a given appointment.
- **FR-007**: System MUST return appropriate success and error responses for all API interactions.

### Key Entities

- **Review**: Represents feedback given for an appointment. Contains rating (1-5), comment, and creation timestamp. Relates to Appointment, Patient, Doctor, and Hospital.
- **Appointment**: Represents a scheduled visit. Updated to track if a review email has been sent.
- **Review Token**: A secure, unique identifier (e.g., UUID or signed token) generated for a specific appointment to authorize review submission.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully submit a valid review using a valid token, resulting in the review being stored with all correct associations.
- **SC-002**: System correctly rejects 100% of review submissions that use invalid tokens, duplicate tokens for the same appointment, or tokens for uncompleted appointments.
- **SC-003**: System successfully tracks the `review_email_sent` status on appointments.

## Assumptions

- Generating and sending the email itself is out of scope for this specific task, but tracking if it was sent is in scope.
- Existing Appointment, Patient, Doctor, and Hospital entities are already defined in the system.
- The review comment is plain text.
