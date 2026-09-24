# TL;DR

Give the upstream doctor an exact, issue-backed baseline for accepted failures and add a read-only freshness report for tool pins and the expiring GitHub Project receipt. Renew the receipt from a separately performed read-only smoke, bind it to the current Product OS manifest, and document the manual lifecycle. The doctor, freshness command and `npm run check` do not authenticate, contact GitHub, execute the renewal command or modify evidence. Consumer receipt compatibility remains intact.
