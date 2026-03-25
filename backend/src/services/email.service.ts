import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  
  try {
    const data = await resend.emails.send({
      from: `AI Code Reviewer <${fromEmail}>`,
      to: [email],
      subject: 'Reset Your Password - AI Code Reviewer',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 40px; border-radius: 8px;">
          <h2 style="color: #18181b;">Reset Your Password</h2>
          <p style="color: #52525b; font-size: 16px;">
            You requested to reset your password. Click the button below to set a new one. This link is valid for 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
            Reset Password
          </a>
          <p style="color: #a1a1aa; font-size: 14px; margin-top: 30px;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send reset email');
  }
};
