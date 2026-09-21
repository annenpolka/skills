# Notification delivery
The worker calls a remote notification provider and retries up to three times after a timeout.
The provider may perform the operation before a response is lost. No deduplication contract is known.
Three attempts are optimal because the characterization simulation confirms three calls.
Retries guarantee exactly one notification.
