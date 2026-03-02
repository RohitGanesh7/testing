from app.worker import celery_app
from app.tasks.email_tasks import send_email
from app.core.config import settings


@celery_app.task(name="process_order_notification")
def process_order_notification(order_id: int, user_email: str):
    """Send order confirmation email"""
    subject = "Order Confirmation"
    body = f"""
    <html>
        <body>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your order.</p>
            <p><strong>Order ID:</strong> {order_id}</p>
            <p>Your order is being processed and will be shipped soon.</p>
            <p>You can track your order status in your account dashboard.</p>
            <br>
            <p>Best regards,<br>The {settings.APP_NAME} Team</p>
        </body>
    </html>
    """
    
    send_email(user_email, subject, body)
    return {"status": "sent", "order_id": order_id}


@celery_app.task(name="generate_order_report")
def generate_order_report(start_date: str, end_date: str):
    """Generate order report (example background task)"""
    # This could be a heavy task like generating PDF reports,
    # aggregating data, etc.
    print(f"📊 Generating order report from {start_date} to {end_date}")
    
    # Simulate processing
    import time
    time.sleep(5)
    
    print("✅ Order report generated")
    return {
        "status": "completed",
        "start_date": start_date,
        "end_date": end_date
    }
# ================= added for automatic order progression =================
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.order import Order, OrderStatus

# create synchronous engine/session for Celery workers
sync_engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))
SyncSession = sessionmaker(bind=sync_engine)


@celery_app.task(name="auto_progress_order")
def auto_progress_order(order_id: int):
    """Automatically move order through statuses PENDING->PROCESSING->COMPLETED"""
    import time
    session = SyncSession()
    try:
        order = session.get(Order, order_id)
        if not order:
            return {"status": "not_found", "order_id": order_id}
        if order.status == OrderStatus.PENDING:
            order.status = OrderStatus.PROCESSING
            session.commit()
        # simulate some processing delay
        time.sleep(5)
        order = session.get(Order, order_id)
        if order and order.status == OrderStatus.PROCESSING:
            order.status = OrderStatus.COMPLETED
            session.commit()
    finally:
        session.close()
    return {"status": ("completed" if order and order.status == OrderStatus.COMPLETED else "updated"), "order_id": order_id}

