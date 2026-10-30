---
title: 'Detecting Suspicious PowerShell with Script Block Logging'
description: 'A practical starting point for hunting encoded and obfuscated PowerShell using Windows event logs.'
pubDate: 2026-10-20
cover: '../../assets/covers/powershell.svg'
coverAlt: 'A terminal window showing suspicious encoded PowerShell commands'
tags: ['detection', 'windows', 'powershell']
draft: true
---

PowerShell is a favorite of attackers precisely because it is already on every Windows host. The good news: it is also one of the best-instrumented tools on the platform.

## Turn on the telemetry

Enable **Script Block Logging** via Group Policy (`Administrative Templates → Windows Components → Windows PowerShell`). Events land in `Microsoft-Windows-PowerShell/Operational` as **Event ID 4104**.

## Hunt for common signals

```powershell
Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-PowerShell/Operational'
  Id      = 4104
} | Where-Object {
  $_.Message -match '-enc|FromBase64String|IEX|Invoke-Expression|DownloadString'
} | Select-Object TimeCreated, Message -First 20
```

| Signal | Why it matters |
| --- | --- |
| `-EncodedCommand` | Hides the payload from casual command-line review |
| `FromBase64String` | Decoding staged content in memory |
| `DownloadString` + `IEX` | Classic download-and-execute cradle |

## Tune before you alert

Admin tooling and software deployment use the same primitives. Baseline your environment first, then alert on **combinations** (encoded command + network access + unusual parent process) rather than single keywords.
