from celery import shared_task

from server.services.notification_service import notification_service


@shared_task(name="dispatch.notify_engineer")
def notify_engineer(phone: str, message: str) -> str:
    notification_service.send_sms(phone, message)
    return "sent"


@shared_task(name="dispatch.push_operator")
def push_operator(token: str, title: str, body: str) -> str:
    notification_service.send_push(token, title, body)
    return "sent"
