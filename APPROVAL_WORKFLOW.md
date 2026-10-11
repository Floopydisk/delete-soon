# Single-Click Approval Workflow

This document describes the simplified single-click approval process for Zonal Coordinators and Regional Pastors.

## Overview

The approval workflow has been simplified to allow fast approvals with minimal friction:

- **Zonal Coordinator**: Single button click to approve (optional comments)
- **Regional Pastor**: Single button click to approve (optional comments)
- **Family Life**: Receives notification on every successful submission

## API Endpoints - Single Click Approvals

### Zonal Coordinator Approval

**Endpoint:**

```
POST /api/courtship/verify-zonal/:id
```

**Minimal Request (Just the button):**

```json
{}
```

**Optional (with comments):**

```json
{
  "comments": "Applicants are well known in the zone"
}
```

**Response:**

```json
{
  "message": "Zonal verification completed successfully",
  "form": {
    /* updated form data */
  }
}
```

**Requirements:**

- Must be authenticated
- Role: `admin` or `zonal-coordinator`
- For Daystar members: Membership verification must be completed first
- Non-Daystar members can skip membership verification

### Regional Pastor Approval

**Endpoint:**

```
POST /api/courtship/approve-regional/:id
```

**Minimal Request (Just the button):**

```json
{}
```

**Optional (with comments):**

```json
{
  "comments": "Application meets all requirements"
}
```

**Response:**

```json
{
  "message": "Application approved successfully",
  "form": {
    /* updated form data */
  }
}
```

**Requirements:**

- Must be authenticated
- Role: `admin` or `regional-pastor`
- Zonal verification must be completed first

## Frontend Implementation Example

### Simple Button Component

```tsx
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ApprovalButtonProps {
  formId: string;
  onSuccess: () => void;
}

export function ZonalApprovalButton({
  formId,
  onSuccess,
}: ApprovalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courtship/verify-zonal/${formId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // Empty body for single-click
        },
      );

      if (response.ok) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleApprove} disabled={isLoading} size="lg">
      {isLoading ? "Approving..." : "✓ Approve"}
    </Button>
  );
}
```

## Email Notifications

### On Form Submission

When a courtship form is successfully submitted:

1. **Respondent (Applicant) Email**
   - Reference number
   - "Verification in Progress" message
   - List of upcoming verification stages

2. **Family Life Team Email**
   - Form ID
   - Applicant names
   - Contact information
   - Church zone
   - Supervising counselor (if assigned)
   - Status tracking for records

3. **Festus (if Daystar Member)**
   - Membership verification request
   - Applicant details
   - Verification link

### On Approvals

**After Zonal Coordinator Approves:**

- Form moves to Regional Pastor for final approval
- Regional Pastor receives approval request email

**After Regional Pastor Approves:**

- Form marked as fully approved
- Respondents receive final approval email
- Family Life team is notified of completion

## Approval Status Flow

```
Form Submitted
    ↓
Respondent Email ✓
Family Life Email ✓
Festus Email (if Daystar) ✓
    ↓
[ZONAL COORDINATOR] ← Single Click Approve
    ↓
Regional Pastor Email ✓
    ↓
[REGIONAL PASTOR] ← Single Click Approve
    ↓
Respondent Final Email ✓
    ↓
APPROVED ✓
```

## Key Improvements

✅ **Faster Processing**

- No form filling required
- Just one button click per approver
- Optional comments for notes

✅ **Better UX**

- Minimal required fields
- Clear next-step notifications
- Progress tracking for all parties

✅ **Accountability**

- All approvals tracked with timestamps
- Approver names recorded
- Optional comments for audit trail

✅ **Flexibility**

- Comments still available for detailed feedback
- Can reject applications if needed
- Automatic email routing between stages

## Testing Single-Click Approval

### Using cURL:

```bash
# Zonal Coordinator Approval (no comments)
curl -X POST \
  http://localhost:5000/api/courtship/verify-zonal/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Regional Pastor Approval (no comments)
curl -X POST \
  http://localhost:5000/api/courtship/approve-regional/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# With optional comments
curl -X POST \
  http://localhost:5000/api/courtship/verify-zonal/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comments": "Ready to proceed"}'
```

## Family Life Email Configuration

The Family Life team receives notification emails on every successful submission.

**Environment Variable:**

```env
FAMILY_LIFE_EMAIL=familylife@daystar.org
```

**Email Contents:**

- Applicant information (names, emails)
- Form reference number
- Church zone
- Supervising counselor assignment
- Status tracking

**Update Email Address:**

1. Contact IT to update `FAMILY_LIFE_EMAIL` in `.env`
2. Can be changed without code modifications
3. Multiple emails can be added (comma-separated if supported)

## Admin Dashboard Integration

For admin dashboard, the single-click flow enables:

1. **Quick Approval Queue**
   - Show pending approvals with one action button
   - Sort by date, zone, or priority

2. **Batch Processing**
   - Multiple applications on one page
   - Quick approve multiple applications

3. **Verification Progress**
   - Visual status indicators
   - Clear next steps

## Architecture Benefits

- ✅ Reduced cognitive load on approvers
- ✅ Faster application processing
- ✅ Fewer form submission errors
- ✅ Better mobile experience
- ✅ Maintains accountability with email trails
- ✅ Audit-friendly with timestamps
