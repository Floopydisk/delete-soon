# Courtship Form Verification Workflow

This document describes the multi-stage verification and approval workflow for courtship form submissions.

## Overview

The courtship form submission triggers an automated verification workflow that involves multiple approval stages:

1. **Initial Submission** - Form submitted by applicants
2. **Membership Verification** - Verified by Festus (configurable admin)
3. **Zonal Coordinator Review** - Reviewed by zonal coordinator
4. **Regional Pastor Approval** - Final approval by regional pastor

## Workflow Stages

### Stage 1: Form Submission

When a courtship form is submitted:

- Form is saved with status `pending`
- **Email sent to respondent**: "Verification in Progress" confirmation
- **Email sent to Festus** (if either applicant is a Daystar member): Membership verification request
- Internal notification created for district pastor

**Respondent receives:**

- Reference number for tracking
- Confirmation that verification is in progress
- List of verification stages

### Stage 2: Membership Verification

**Who:** Festus (configurable via `MEMBERSHIP_VERIFIER_EMAIL` env variable)

**When:** Only if either applicant is a Daystar member

**Action:**

- Verify Daystar membership status
- Enter membership ID(s) in the system
- Add optional comments

**API Endpoint:**

```
POST /api/courtship/verify-membership/:id
```

**Request Body:**

```json
{
  "brotherMembershipId": "optional-membership-id",
  "sisterMembershipId": "optional-membership-id",
  "comments": "optional-comments"
}
```

**What happens next:**

- Form status updated: `membershipVerificationStatus = 'verified'`
- **Email sent to respondent**: "Membership Verified" confirmation
- **Email sent to Zonal Coordinator**: Zonal verification request (if zonal coordinator info exists)

### Stage 3: Zonal Coordinator Review

**Who:** Zonal Coordinator assigned to the applicants

**When:** After membership verification is complete

**Action:**

- Review the application details
- Verify applicants' involvement in zone activities
- Add optional comments

**API Endpoint:**

```
POST /api/courtship/verify-zonal/:id
```

**Request Body:**

```json
{
  "comments": "optional-comments"
}
```

**What happens next:**

- Form status updated: `zonalVerificationStatus = 'verified'`
- **Email sent to Regional Pastor**: Regional approval request (if regional pastor info exists)

### Stage 4: Regional Pastor Approval

**Who:** Regional Pastor assigned to the applicants

**When:** After zonal verification is complete

**Action:**

- Final review of the application
- Provide final approval or request modifications
- Add optional comments

**API Endpoint:**

```
POST /api/courtship/approve-regional/:id
```

**Request Body:**

```json
{
  "comments": "optional-comments"
}
```

**What happens next:**

- Form status updated: `regionalApprovalStatus = 'approved'`
- **Email sent to respondent**: "Application Approved" with next steps
- Supervising counselor information included in the email

## Email Templates

All emails are HTML formatted with branded styling. Templates include:

1. **Submission Confirmation** - Sent to respondent immediately
2. **Membership Verification Request** - Sent to Festus
3. **Verification Confirmation** - Sent to respondent after membership verified
4. **Zonal Verification Request** - Sent to zonal coordinator
5. **Regional Approval Request** - Sent to regional pastor
6. **Final Approval Notification** - Sent to respondent after full approval

## Non-Daystar Members

For non-Daystar members, the workflow is slightly different:

- **No membership verification stage** (skipped)
- **Pastor information required**:
  - Pastor name
  - Pastor church
  - Pastor phone/email
- **Letter of recommendation required** (PDF/image upload)
- Workflow proceeds directly to zonal and regional verification

## Checking Verification Status

**API Endpoint:**

```
GET /api/courtship/verification-status/:id
```

**Response:**

```json
{
  "formId": "form-id",
  "couple": {
    "brother": "Brother Name",
    "sister": "Sister Name"
  },
  "submittedAt": "2024-01-01T00:00:00.000Z",
  "membershipVerification": {
    "status": "verified",
    "verifiedBy": "Festus",
    "verifiedAt": "2024-01-01T00:00:00.000Z",
    "comments": "Membership confirmed"
  },
  "zonalVerification": {
    "status": "verified",
    "verifiedBy": "Zonal Coordinator Name",
    "verifiedAt": "2024-01-01T00:00:00.000Z",
    "comments": "Zone verification complete"
  },
  "regionalApproval": {
    "status": "approved",
    "approvedBy": "Regional Pastor Name",
    "approvedAt": "2024-01-01T00:00:00.000Z",
    "comments": "Application approved"
  }
}
```

## Environment Configuration

Required environment variables:

```env
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@daystar.org
FROM_NAME=Daystar Christian Centre

# Workflow Configuration
MEMBERSHIP_VERIFIER_EMAIL=festus@daystar.org
FRONTEND_URL=http://localhost:3000
```

## Database Schema

### Verification Fields Added to CourtshipForm

```typescript
// Membership Verification
membershipVerificationStatus: 'pending' | 'verified' | 'rejected'
membershipVerifiedBy: string
membershipVerifiedAt: Date
membershipVerificationComments: string

// Zonal Verification
zonalVerificationStatus: 'pending' | 'verified' | 'rejected'
zonalVerifiedBy: string
zonalVerifiedAt: Date
zonalVerificationComments: string

// Regional Approval
regionalApprovalStatus: 'pending' | 'approved' | 'rejected'
regionalApprovedBy: string
regionalApprovedAt: Date
regionalApprovalComments: string

// Non-Daystar Member Fields
brother.pastorName: string
brother.pastorChurch: string
brother.pastorPhone: string
brotherLetterOfRecommendationUrl: string

sister.pastorName: string
sister.pastorChurch: string
sister.pastorPhone: string
sisterLetterOfRecommendationUrl: string
```

## Authorization

- **Membership Verification**: `admin` role only
- **Zonal Verification**: `admin` or `zonal-coordinator` roles
- **Regional Approval**: `admin` or `regional-pastor` roles
- **View Status**: All authenticated users

## Next Steps for Implementation

### TODO Items:

1. **Email Lookup System**
   - Implement zonal coordinator email lookup from ChurchZone collection
   - Implement regional pastor email lookup from user/pastor collection
   - Create admin interface to manage coordinator/pastor contact information

2. **Admin Dashboard**
   - Create verification dashboard for Festus
   - Create zonal coordinator dashboard
   - Create regional pastor dashboard
   - Display pending verifications/approvals

3. **Notification System**
   - In-app notifications for pending verifications
   - Email reminders for pending actions (after 48 hours)
   - Status tracking visualization

4. **Testing**
   - Test email delivery with real SMTP credentials
   - Test complete workflow end-to-end
   - Test error handling (failed emails, missing data)

5. **Documentation**
   - User guide for verifiers and approvers
   - Troubleshooting guide for common issues
   - Video tutorials for each role

## Installation Instructions

1. **Install nodemailer:**

   ```bash
   cd backend
   npm install nodemailer @types/nodemailer
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in SMTP credentials
   - Set `MEMBERSHIP_VERIFIER_EMAIL`

3. **Test email service:**
   ```bash
   # Create a test script in backend/src/scripts/test-email.ts
   npm run test-email
   ```

## Support

For issues or questions about the verification workflow:

- Contact: IT Support
- Email: support@daystar.org
- Documentation: See `VERIFICATION_WORKFLOW.md`
