import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.worker import celery_app
from app.core.config import settings


def send_email(to_email: str, subject: str, body: str):
    """Helper function to send email via SMTP"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        
        # Add HTML body
        html_part = MIMEText(body, "html")
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        return False


@celery_app.task(name="send_welcome_email")
def send_welcome_email(email: str, username: str):
    """Send welcome email to new user"""
    subject = f"Welcome to {settings.APP_NAME}!"
    body = f"""
    <html>
        <body>
            <h2>Welcome to {settings.APP_NAME}!</h2>
            <p>Hi {username},</p>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>You can now start exploring our products and services.</p>
            <br>
            <p>Best regards,<br>The {settings.APP_NAME} Team</p>
        </body>
    </html>
    """
    
    send_email(email, subject, body)
    return {"status": "sent", "email": email}