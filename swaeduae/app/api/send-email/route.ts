import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  host: process.env.ZOHO_MAIL_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.ZOHO_MAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL || '',
    pass: process.env.ZOHO_PASSWORD || '',
  },
};

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, attachments } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransporter(EMAIL_CONFIG);

    const mailOptions = {
      from: `"SwaedUAE" <${EMAIL_CONFIG.auth.user}>`,
      to,
      subject,
      html,
      text: text || undefined,
      attachments: attachments || undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
