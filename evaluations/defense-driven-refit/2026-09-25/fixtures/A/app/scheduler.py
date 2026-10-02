"""定期ジョブの起動プロセス。deploy/scheduler.yaml で動く。"""
import time

import schedule

from app.cleanup import purge_expired_sessions
from app.renewal_worker import run_due_renewals

schedule.every(1).hours.do(purge_expired_sessions)
schedule.every(10).minutes.do(run_due_renewals)

while True:
    schedule.run_pending()
    time.sleep(1)
