import { Resend } from "resend";

const EMAIL_CONFIG = {
  MEMBERSHIP_VERIFIER_EMAIL:
    process.env.MEMBERSHIP_VERIFIER_EMAIL || "festus@daystar.org",
  FROM_EMAIL: "forms@daystarng.ibukun.dev",
  FROM_NAME: "Daystar Christian Centre",
};

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
}

/** Send email through Resend. */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
    });

    if (error) {
      console.error("Error sending email through Resend:", error);
      return false;
    }

    console.log("Email sent successfully through Resend:", data?.id);
    return true;
  } catch (error) {
    console.error("Error sending email through Resend:", error);
    return false;
  }
}

/**
 * Send initial submission confirmation to respondent
 */
export async function sendSubmissionConfirmation(
  email: string,
  brotherName: string,
  sisterName: string,
  formId: string,
): Promise<boolean> {
  const subject =
    "Courtship Form Submission Received - Verification in Progress";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .highlight { color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Courtship Form Submission Received</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${brotherName}</strong> and <strong>${sisterName}</strong>,</p>
          
          <p>Thank you for submitting your courtship application form to Daystar Christian Centre.</p>
          
          <div class="info-box">
            <p><strong>Reference Number:</strong> <span class="highlight">${formId}</span></p>
            <p><strong>Status:</strong> Verification in Progress</p>
          </div>
          
          <p>Your application is currently undergoing verification. This process includes:</p>
          <ul>
            <li>Membership verification (if applicable)</li>
            <li>Zonal Coordinator review</li>
            <li>Regional Pastor approval</li>
          </ul>
          
          <p>You will receive email updates as your application progresses through each stage.</p>
          
          <p>If you have any questions, please contact your cell leader or zonal coordinator.</p>
          
          <p>God bless you!</p>
          
          <div class="footer">
            <p>Daystar Christian Centre<br>
            This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send verification request to membership verifier (Festus)
 */
export async function sendMembershipVerificationRequest(
  formId: string,
  brotherName: string,
  sisterName: string,
  brotherIsMember: string | boolean,
  sisterIsMember: string | boolean,
  verificationLink: string,
): Promise<boolean> {
  const subject = "Courtship Form - Membership Verification Required";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f5576c; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Membership Verification Required</h1>
        </div>
        <div class="content">
          <p>Dear Festus,</p>
          
          <p>A new courtship application requires membership verification.</p>
          
          <div class="info-box">
            <p><strong>Reference Number:</strong> ${formId}</p>
            <p><strong>Brother:</strong> ${brotherName} ${brotherIsMember === true || brotherIsMember === "yes" ? "(Daystar Member)" : "(Non-Member)"}</p>
            <p><strong>Sister:</strong> ${sisterName} ${sisterIsMember === true || sisterIsMember === "yes" ? "(Daystar Member)" : "(Non-Member)"}</p>
          </div>
          
          <p>Please verify the membership status and enter the Membership ID(s) in the system.</p>
          
          <a href="${verificationLink}" class="button">Verify Membership</a>
          
          <p>This verification is required before the application can proceed to zonal and regional review.</p>
          
          <div class="footer">
            <p>Daystar Christian Centre - Courtship Application System</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: EMAIL_CONFIG.MEMBERSHIP_VERIFIER_EMAIL,
    subject,
    html,
  });
}

/**
 * Send verification confirmation to respondent
 */
export async function sendVerificationConfirmation(
  email: string,
  brotherName: string,
  sisterName: string,
  membershipId: string,
  formId: string,
): Promise<boolean> {
  const subject = "Membership Verified - Courtship Application Update";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4facfe; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Membership Verified</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${brotherName}</strong> and <strong>${sisterName}</strong>,</p>
          
          <div class="success-box">
            <p><strong>✓ Your membership has been successfully verified!</strong></p>
          </div>
          
          <div class="info-box">
            <p><strong>Reference Number:</strong> ${formId}</p>
            <p><strong>Membership ID:</strong> ${membershipId}</p>
            <p><strong>Next Step:</strong> Zonal Coordinator Review</p>
          </div>
          
          <p>Your application is now being reviewed by your Zonal Coordinator. You will receive an update once this review is complete.</p>
          
          <p>God bless you!</p>
          
          <div class="footer">
            <p>Daystar Christian Centre</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send zonal verification request to Zonal Coordinator
 */
export async function sendZonalVerificationRequest(
  zonalCoordinatorEmail: string,
  zonalCoordinatorName: string,
  formId: string,
  brotherName: string,
  sisterName: string,
  verificationLink: string,
): Promise<boolean> {
  const subject = "Courtship Application - Zonal Verification Required";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #fa709a; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 30px; background: #fa709a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Zonal Verification Required</h1>
        </div>
        <div class="content">
          <p>Dear ${zonalCoordinatorName},</p>
          
          <p>A courtship application from your zone requires your review and verification.</p>
          
          <div class="info-box">
            <p><strong>Reference Number:</strong> ${formId}</p>
            <p><strong>Couple:</strong> ${brotherName} & ${sisterName}</p>
            <p><strong>Status:</strong> Membership Verified</p>
          </div>
          
          <p>Please review the application details and provide your verification.</p>
          
          <a href="${verificationLink}" class="button">Review Application</a>
          
          <p>After your verification, the application will be forwarded to the Regional Pastor for final approval.</p>
          
          <div class="footer">
            <p>Daystar Christian Centre - Courtship Application System</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: zonalCoordinatorEmail, subject, html });
}

/**
 * Send regional approval request to Regional Pastor
 */
export async function sendRegionalApprovalRequest(
  regionalPastorEmail: string,
  regionalPastorName: string,
  formId: string,
  brotherName: string,
  sisterName: string,
  approvalLink: string,
): Promise<boolean> {
  const subject = "Courtship Application - Regional Approval Required";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Regional Approval Required</h1>
        </div>
        <div class="content">
          <p>Dear Pastor ${regionalPastorName},</p>
          
          <p>A courtship application requires your final approval.</p>
          
          <div class="info-box">
            <p><strong>Reference Number:</strong> ${formId}</p>
            <p><strong>Couple:</strong> ${brotherName} & ${sisterName}</p>
            <p><strong>Status:</strong> Membership Verified ✓ | Zonal Verified ✓</p>
          </div>
          
          <p>Both membership and zonal verification have been completed. Please review and provide your final approval.</p>
          
          <a href="${approvalLink}" class="button">Review & Approve</a>
          
          <p>Your approval will complete the verification process for this courtship application.</p>
          
          <div class="footer">
            <p>Daystar Christian Centre - Courtship Application System</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: regionalPastorEmail, subject, html });
}

/**
 * Send final approval notification to respondent
 */
export async function sendFinalApprovalNotification(
  email: string,
  brotherName: string,
  sisterName: string,
  formId: string,
  supervisingCounselor?: string,
): Promise<boolean> {
  const subject = "Courtship Application Approved - Next Steps";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; margin: 15px 0; border-radius: 8px; text-align: center; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #11998e; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Application Approved!</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${brotherName}</strong> and <strong>${sisterName}</strong>,</p>
          
          <div class="success-box">
            <h2>✓ Congratulations!</h2>
            <p>Your courtship application has been fully approved.</p>
          </div>
          
          <div class="info-box">
            <p><strong>Reference Number:</strong> ${formId}</p>
            ${supervisingCounselor ? `<p><strong>Supervising Counselor:</strong> ${supervisingCounselor}</p>` : ""}
            <p><strong>Status:</strong> Approved ✓</p>
          </div>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Your supervising counselor will contact you to schedule your first counseling session</li>
            <li>Please review the courtship guidelines again</li>
            <li>Prepare to attend all scheduled counseling sessions</li>
          </ol>
          
          <p>We pray God's blessings upon your relationship as you walk through this important season.</p>
          
          <p>God bless you!</p>
          
          <div class="footer">
            <p>Daystar Christian Centre</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send form submission notification to Family Life email
 */
export async function sendFamilyLifeNotification(
  formId: string,
  brotherName: string,
  sisterName: string,
  brotherEmail: string,
  sisterEmail: string,
  churchZone?: string,
  supervisingCounselor?: string,
): Promise<boolean> {
  const familyLifeEmail =
    process.env.FAMILY_LIFE_EMAIL || "familylife@daystar.org";

  const subject = `New Courtship Form Submitted - ${brotherName} & ${sisterName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px; border: 1px solid #ddd; }
        th { background: #667eea; color: white; padding: 10px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Courtship Application Received</h1>
        </div>
        <div class="content">
          <p>Dear Family Life Team,</p>
          
          <p>A new courtship application has been submitted and is now in the verification workflow.</p>
          
          <div class="info-box">
            <table>
              <tr>
                <th colspan="2">Applicant Information</th>
              </tr>
              <tr>
                <td><strong>Form ID:</strong></td>
                <td>${formId}</td>
              </tr>
              <tr>
                <td><strong>Brother:</strong></td>
                <td>${brotherName}</td>
              </tr>
              <tr>
                <td><strong>Sister:</strong></td>
                <td>${sisterName}</td>
              </tr>
              <tr>
                <td><strong>Brother Email:</strong></td>
                <td>${brotherEmail}</td>
              </tr>
              <tr>
                <td><strong>Sister Email:</strong></td>
                <td>${sisterEmail}</td>
              </tr>
              ${churchZone ? `<tr><td><strong>Church Zone:</strong></td><td>${churchZone}</td></tr>` : ""}
              ${supervisingCounselor ? `<tr><td><strong>Supervising Counselor:</strong></td><td>${supervisingCounselor}</td></tr>` : ""}
              <tr>
                <td><strong>Status:</strong></td>
                <td>Verification in Progress</td>
              </tr>
            </table>
          </div>
          
          <p>This notification is sent for your records and tracking purposes. The application will proceed through the standard verification workflow.</p>
          
          <p><strong>Action Items:</strong></p>
          <ul>
            <li>Track application progress through verification stages</li>
            <li>Prepare counseling resources if application is approved</li>
            <li>Contact respondents if additional information is needed</li>
          </ul>
          
          <div class="footer">
            <p>Daystar Christian Centre - Courtship Application System<br>
            This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: familyLifeEmail, subject, html });
}

/** Send a plain-language notification to a courtship workflow signatory. */
export async function sendCourtshipSignatoryNotification(
  recipientEmail: string,
  recipientName: string,
  role: "Zonal Coordinator" | "Regional Pastor",
  formId: string,
  brotherName: string,
  sisterName: string,
  zoneName: string,
): Promise<boolean> {
  const subject = `New Courtship Form: ${brotherName} & ${sisterName}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:600px;margin:auto">
      <h2>New Courtship Form Submitted</h2>
      <p>Dear ${recipientName},</p>
      <p>A courtship form for <strong>${brotherName}</strong> and <strong>${sisterName}</strong> has been submitted for <strong>${zoneName}</strong>.</p>
      <p><strong>Your role:</strong> ${role}<br/><strong>Reference:</strong> ${formId}</p>
      <p>Please log in to the forms portal to review and complete your required signatory step.</p>
      <p>Daystar Christian Centre</p>
    </div>`;

  return sendEmail({ to: recipientEmail, subject, html });
}

/** Send the coordinator-issued completion link to the applicants. */
export async function sendCourtshipInitiation(
  recipientEmail: string,
  completionUrl: string,
  zoneName: string,
): Promise<boolean> {
  const subject = "Your Courtship Form Is Ready to Complete";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:600px;margin:auto">
      <h2>Complete your Courtship Form</h2>
      <p>Your Zonal Coordinator has initiated a courtship form for ${zoneName}.</p>
      <p><a href="${completionUrl}">Open the courtship form</a></p>
      <p>This link is personal and expires in 14 days. Please do not forward it.</p>
      <p>Daystar Christian Centre</p>
    </div>`;

  return sendEmail({ to: recipientEmail, subject, html });
}

export default {
  sendSubmissionConfirmation,
  sendMembershipVerificationRequest,
  sendVerificationConfirmation,
  sendZonalVerificationRequest,
  sendRegionalApprovalRequest,
  sendFinalApprovalNotification,
  sendFamilyLifeNotification,
  sendCourtshipSignatoryNotification,
  sendCourtshipInitiation,
};
