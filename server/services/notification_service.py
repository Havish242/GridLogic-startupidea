from __future__ import annotations

import logging

from firebase_admin import credentials, initialize_app, messaging
from twilio.rest import Client

from server.config import settings


logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self) -> None:
        self.twilio_client: Client | None = None
        if settings.twilio_account_sid and settings.twilio_auth_token:
            self.twilio_client = Client(settings.twilio_account_sid, settings.twilio_auth_token)

        self.firebase_enabled = False
        if settings.firebase_service_account_path:
            try:
                cred = credentials.Certificate(settings.firebase_service_account_path)
                initialize_app(cred)
                self.firebase_enabled = True
            except Exception as exc:  # noqa: BLE001
                logger.warning("Firebase init failed: %s", exc)

    def send_sms(self, to_number: str, body: str) -> None:
        if not self.twilio_client or not settings.twilio_from_number:
            logger.info("Twilio not configured. SMS skipped: %s", body)
            return

        self.twilio_client.messages.create(
            body=body,
            from_=settings.twilio_from_number,
            to=to_number,
        )

    def send_push(self, device_token: str, title: str, body: str) -> None:
        if not self.firebase_enabled:
            logger.info("Firebase not configured. Push skipped: %s", title)
            return

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=device_token,
        )
        messaging.send(message)


notification_service = NotificationService()
