import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List, Dict
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("airindex.email")
logger.setLevel(logging.INFO)

# In-memory store for recent dev emails to facilitate testing without external SMTP credentials
DEV_RECENT_EMAILS: List[Dict] = []

def _record_dev_email(email: str, subject: str, otp: str, purpose: str):
    record = {
        "timestamp": datetime.utcnow().isoformat(),
        "email": email,
        "subject": subject,
        "otp": otp,
        "purpose": purpose
    }
    DEV_RECENT_EMAILS.insert(0, record)
    if len(DEV_RECENT_EMAILS) > 50:
        DEV_RECENT_EMAILS.pop()
    print(f"\n=======================================================")
    print(f" [EMAIL DISPATCHED] To: {email}")
    print(f" [PURPOSE]: {purpose}")
    print(f" [AIRINDEX OTP CODE]: {otp}")
    print(f" [VALIDITY]: {settings.OTP_EXPIRE_MINUTES} minutes")
    print(f"=======================================================\n")

def _send_raw_email(to_email: str, subject: str, text_content: str, html_content: str) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.info(f"SMTP not fully configured. Using simulated delivery for {to_email}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to_email

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        logger.info(f"Successfully delivered email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

def _build_html_template(title: str, message: str, otp: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
    .header {{ text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 24px; }}
    .logo {{ font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }}
    .logo span {{ color: #0284c7; }}
    .tagline {{ font-size: 13px; color: #64748b; margin-top: 4px; }}
    .content {{ text-align: center; margin-bottom: 24px; }}
    .message {{ font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 24px; }}
    .otp-box {{ background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 8px; padding: 18px 24px; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0369a1; display: inline-block; margin: 12px 0 24px; }}
    .validity {{ font-size: 14px; font-weight: 500; color: #dc2626; margin-bottom: 16px; }}
    .footer {{ font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Air<span>Index</span> India</div>
      <div class="tagline">National Real-Time Airfare Intelligence Platform</div>
    </div>
    <div class="content">
      <p class="message">{message}</p>
      <div class="otp-box">{otp}</div>
      <div class="validity">This OTP is valid for {settings.OTP_EXPIRE_MINUTES} minutes.</div>
      <p style="font-size: 13px; color: #64748b;">If you did not request this code, please ignore this email. Never share this code with anyone.</p>
    </div>
    <div class="footer">
      &copy; {datetime.utcnow().year} AirIndex India. Automated Statistical Airfare Monitoring System.<br>
      Government of India &bull; Permitted Data Aggregation Protocol
    </div>
  </div>
</body>
</html>"""

def send_verification_otp(email: str, otp: str) -> bool:
    _record_dev_email(email, "Verify Your AirIndex India Account", otp, "EMAIL_VERIFICATION")
    subject = "AirIndex India - Your Email Verification Code"
    text_content = f"""AirIndex India

Your verification OTP is: {otp}

This OTP is valid for {settings.OTP_EXPIRE_MINUTES} minutes.

If you did not request this code, please ignore this email."""
    html_content = _build_html_template(
        "Verify Your Email",
        "Thank you for registering with AirIndex India. Please enter the verification code below to activate your statistical access account.",
        otp
    )
    return _send_raw_email(email, subject, text_content, html_content)

def send_password_reset_otp(email: str, otp: str) -> bool:
    _record_dev_email(email, "Reset Your AirIndex India Password", otp, "PASSWORD_RESET")
    subject = "AirIndex India - Password Reset Code"
    text_content = f"""AirIndex India

Your password reset OTP is: {otp}

This OTP is valid for {settings.OTP_EXPIRE_MINUTES} minutes.

If you did not request this code, please ignore this email."""
    html_content = _build_html_template(
        "Reset Your Password",
        "We received a request to reset your password for AirIndex India. Use the code below to complete your password update.",
        otp
    )
    return _send_raw_email(email, subject, text_content, html_content)

def send_login_otp(email: str, otp: str) -> bool:
    _record_dev_email(email, "Your AirIndex India Login OTP", otp, "LOGIN_OTP")
    subject = "AirIndex India - One-Time Login Code"
    text_content = f"""AirIndex India

Your login OTP is: {otp}

This OTP is valid for {settings.OTP_EXPIRE_MINUTES} minutes.

If you did not request this code, please ignore this email."""
    html_content = _build_html_template(
        "One-Time Login Code",
        "Enter the secure one-time passcode below to authenticate into your AirIndex India session.",
        otp
    )
    return _send_raw_email(email, subject, text_content, html_content)

def get_recent_dev_emails() -> List[Dict]:
    return DEV_RECENT_EMAILS
