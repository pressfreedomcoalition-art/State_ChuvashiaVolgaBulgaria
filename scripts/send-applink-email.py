#!/usr/bin/env python3
"""Send AppLink listing email from CHV VPS. MX hostname is NXDOMAIN — use SPF MTA IP + SMTPS."""
from __future__ import annotations

import smtplib
import ssl
import sys
from email.message import EmailMessage
from pathlib import Path

TO = "hello@miniapplink.online"
FROM_ADDR = "catalog@chv.blc.cab"
SUBJECT = "List Mini App: CHV DAO Cabinet (@bulgaria_state_bot)"
BODY_PATH = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/applink-body.txt")

# mail.miniapplink.online → NXDOMAIN; SPF advertises this MTA
HOST = "144.124.251.27"


def main() -> int:
    body = BODY_PATH.read_text(encoding="utf-8")
    msg = EmailMessage()
    msg["From"] = f"CHV Catalog <{FROM_ADDR}>"
    msg["To"] = TO
    msg["Reply-To"] = FROM_ADDR
    msg["Subject"] = SUBJECT
    msg.set_content(body)

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print(f"try {HOST}:465 (SMTPS)", flush=True)
    try:
        with smtplib.SMTP_SSL(HOST, 465, timeout=45, context=ctx) as s:
            s.ehlo("chv.blc.cab")
            s.send_message(msg)
        print(f"SENT via {HOST}:465", flush=True)
        return 0
    except Exception as e:
        print(f"fail 465: {type(e).__name__}: {e}", flush=True)

    # Fallback: plain 25 (often blocked on DigitalOcean)
    print(f"try {HOST}:25", flush=True)
    try:
        with smtplib.SMTP(HOST, 25, timeout=45) as s:
            s.ehlo("chv.blc.cab")
            s.send_message(msg)
        print(f"SENT via {HOST}:25", flush=True)
        return 0
    except Exception as e:
        print(f"fail 25: {type(e).__name__}: {e}", flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
