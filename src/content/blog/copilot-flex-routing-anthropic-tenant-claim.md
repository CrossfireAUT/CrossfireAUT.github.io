---
title: 'Copilot, Flex Routing and Anthropic: Is your data really “inside the tenant”?'
description: 'A source-by-source look at what Microsoft documents about where Copilot processes EU data, and why “it stays in our tenant” is too simple.'
pubDate: 2026-10-23
cover: '../../assets/covers/copilot-flow-v3.svg'
coverAlt: 'Prompts, connected services such as SharePoint, and memes feed into Copilot inside a dashed tenant boundary, with lines leading out to Flex Routing and Anthropic'
tags: ['copilot', 'microsoft-365', 'privacy', 'compliance']
---

A sentence I keep hearing when Microsoft 365 Copilot comes up: *“We use Copilot because our data stays inside our tenant.”*

It's a reasonable thing to believe, and parts of it are true. But as a blanket statement it is not what Microsoft's documentation says, and two features make the gap concrete: **Flex Routing** and **Anthropic as a subprocessor**. This post goes through what is documented, what isn't, and what an admin should check.

For a defender this is more than a question about privacy: data flows you don't know about are attack surface you don't manage, and settings nobody chose are configuration drift.

> This post is a **snapshot as of 30 October 2026**, checked against Microsoft Learn on that date. Microsoft's pages are reviewed on a 180-day cycle and defaults change, so check the linked pages and your own tenant before you rely on anything here. This is a technical reading, not legal advice.

## TL;DR

- **At rest**, Copilot data for EU tenants is stored inside the EU Data Boundary, apart from limited pseudonymized data.
- **During inference** (the model actually reading your prompt and content), it depends on two settings:
  - With **Flex Routing** allowed, inference may run in the **United States, Canada or Australia** during peak load.
  - **Anthropic** models are **excluded from the EU Data Boundary**. In the EU, EFTA and UK they are off by default and need an admin opt-in.
- **In my experience, many tenants have both settings on without the admins knowing.** (Anecdotal, see below.)
- **You can't prove it afterwards.** The documented Copilot audit record has no field for where a prompt was processed, and none that says whether Flex Routing was used. You can only show your settings, not the route of an individual prompt.
- **What you *can* log:** when a Copilot setting was changed, and which users used Anthropic models. Queries are [below](#what-you-can-monitor).
- “Inside the tenant” is a permissions concept. The model runs in Microsoft's (and, for Claude, a subprocessor's) infrastructure, not in a box that belongs to you.

## What is true about the claim

Microsoft documents several real protections, and they matter:

- Copilot only surfaces content the user already has permission to see. It uses your existing Microsoft 365 permissions and honours sensitivity labels.
- Prompts, responses and Microsoft Graph data are **not used to train** the foundation models.
- Interaction history is stored under the same contractual commitments as your other Microsoft 365 content, can be searched with Purview, and is subject to your retention policies.
- Microsoft Copilot is described as an EU Data Boundary service for EU customers.

If someone means “nobody trains on our data and users can't see what they aren't allowed to see”, the claim holds up.

## Where “inside the tenant” breaks down

### 1. Storing data is not the same as processing it

A tenant is an identity and permission boundary. To answer a prompt, Copilot sends the prompt plus grounding content to an LLM running in a datacenter. Microsoft's privacy page says LLM calls go to the closest datacenters in your region, **but can also be sent to other regions when capacity is tight**. So the real question is not “is it in my tenant?” but “where is it processed, and by whom?”

### 2. Flex Routing

Flex Routing is an admin setting for **EU and EFTA** customers. When allowed, LLM inference may happen **outside the EU Data Boundary during periods of peak demand**. Microsoft's FAQ names the possible locations: the **United States, Canada or Australia**.

What the documentation says about it:

| Topic | Documented behaviour |
| --- | --- |
| Data in transit and at rest | Encrypted regardless of where inference runs |
| Data at rest | Stays in the EU Data Boundary, except limited pseudonymized data that may be stored outside it for security and operational purposes |
| Default | **On** for eligible tenants created after **25 March 2026**. Older tenants are told to check their setting |
| Peak periods | Described as typically limited in duration, not continuous. No numbers are given |
| Where to change it | Microsoft 365 admin center → Copilot → Settings → View all → *Flex routing during peak load periods* (AI Administrator role) |
| If you choose “Do not allow” | Inference stays inside the EU Data Boundary, even at peak |
| Power Platform | A separate setting covers Copilot Studio, Power Platform and Dynamics 365. It follows the Microsoft 365 setting unless it is stricter |

One detail that surprised me: customers who have **purchased or used Multi-Geo** are out of scope for the EU Data Boundary for Microsoft 365, even if their tenant sits in an EU country. For them the Flex Routing setting does not appear in the Microsoft 365 admin center at all.

### 3. Anthropic as a subprocessor

Microsoft added Anthropic as a **subprocessor**. That has real consequences, some good and some limiting:

**The good:** for the standard Anthropic models, Microsoft's Product Terms and Data Protection Addendum apply, and the use is covered by Enterprise Data Protection. This is a contractual wrapper, not a loophole.

**The limiting:**

- Anthropic models in Copilot, Researcher, Copilot Studio, Power Platform and Copilot in Microsoft 365 apps are, in Microsoft's words, “currently excluded from the EU Data Boundary”, and from in-country processing commitments where those apply.
- **EU, EFTA and UK tenants have Anthropic disabled by default.** For most other commercial-cloud customers it is on by default.
- Opting in is a deliberate admin action: Copilot → Settings → *AI providers operating as Microsoft subprocessors*. You can scope access to specific users or Entra groups. In the EU, EFTA and UK, tenants that opted in earlier under Anthropic's separate terms had to opt in again.
- Since April 2026 there is a further setting, *Copilot in Microsoft 365 apps with Anthropic models*, that makes Anthropic the default model in the Office apps for EU/EFTA and UK tenants. It is a separate decision, so check it separately.
- **“Anthropic models with Data Retention”** are a different category. Anthropic then acts as an **independent processor** under Anthropic's own commercial terms and DPA, **not** under the Microsoft DPA. Microsoft's page says Anthropic, not Microsoft, stores most inputs and outputs for up to 30 days, up to two years if its safety classifiers flag a possible violation, and classification scores for up to seven years. These models are off for everyone until an admin explicitly opts in.

### 4. Other paths out

Web search sends a generated query to the Bing Search service, and agents and connectors come with their own terms. Neither is the topic here, but both are worth a line in a data-flow review.

### 5. And you can't prove where a given prompt went

This is the part that bothers me most. Copilot interactions are written automatically to the Purview audit log, but the documented record describes *who*, *when*, *which app*, *which files were accessed* and *which plugins were used*. What it does not describe is the processing location.

- `ClientRegion` is the **user's** region when they performed the action, not where the model ran. It is easy to misread as evidence of EU processing.
- `ModelTransparencyDetails` describes the **model**, not the location. It holds `ModelProviderName`, `ModelName` and `ModelVersion`. Microsoft's audit page is not consistent about what gets filled in: its field table says every Microsoft 365 Copilot scenario includes `ModelProviderName` but `ModelName` is *“not available in Microsoft 365 Copilot scenarios”*, while a later section of the same page says Copilot Chat logs include provider **and** model name, with an Anthropic model as the example. The same page also says that when a user leaves the model on *Auto*, provider and model may be missing for some requests. So treat the provider as the field to rely on, the model name as a bonus, and an empty value as “unknown”, not as “Microsoft”.
- I found **no documented field** that records the datacenter, region or country that handled a request, or that marks a request as Flex-routed.

From a blue-team view, this is a visibility gap: if you can't log it, you can't detect or verify it.

So the honest position is a **configuration argument**, not a **log-based one**. If Flex Routing is off and Anthropic is off, the documentation supports saying inference stays inside the EU Data Boundary. If either one is on, there is no per-request evidence you can pull out later to show that a particular prompt stayed in the EU. That is a limitation of the evidence, and it applies regardless of what happened to any single prompt.

## What you can monitor

The location gap stays, but two things are logged and worth watching: **setting changes** and **which model provider was used**.

### Alert on Copilot setting changes

Microsoft's list of audited activities has one operation for this: **Updated a Copilot setting**, operation `UpdateTenantSettings` (*“An admin (or system on behalf of an admin) updated a Copilot setting.”*). It is a generic event. The documentation doesn't say which settings write it or how the record names the setting that changed, so alert on all of them and read the record's details. They are rare, so the noise is low.

In the Purview portal: **Audit** → search → *Activities – operation names* → `UpdateTenantSettings`.

Or as a script, with the audit search API in Microsoft Graph. It needs the Microsoft Graph PowerShell SDK and the `AuditLogsQuery.Read.All` permission. The search runs on Microsoft's side and can take a few minutes, so the helper below starts it, waits and then collects the results:

```powershell
Connect-MgGraph -Scopes 'AuditLogsQuery.Read.All'

# Starts an audit search, waits until it has finished and returns all records
function Invoke-AuditSearch([hashtable]$Filter, [int]$Days = 90) {
  $body = $Filter + @{
    filterStartDateTime = (Get-Date).ToUniversalTime().AddDays(-$Days).ToString('o')
    filterEndDateTime   = (Get-Date).ToUniversalTime().ToString('o')
  }
  $query = Invoke-MgGraphRequest -Method POST -Uri 'v1.0/security/auditLog/queries' `
    -Body ($body | ConvertTo-Json) -ContentType 'application/json'
  do {
    Start-Sleep -Seconds 30
    $query = Invoke-MgGraphRequest -Uri "v1.0/security/auditLog/queries/$($query.id)"
  } while ($query.status -in 'notStarted', 'running')
  if ($query.status -ne 'succeeded') { throw "Audit search ended with status '$($query.status)'" }
  if ($query.isRecordCountLimitExceeded) { Write-Warning 'Record limit reached, results are incomplete. Use a shorter time range.' }

  $uri = "v1.0/security/auditLog/queries/$($query.id)/records"
  while ($uri) {
    $page = Invoke-MgGraphRequest -Uri $uri
    $page.value | ForEach-Object { [pscustomobject]$_ }
    $uri = $page.'@odata.nextLink'
  }
}

Invoke-AuditSearch -Filter @{
  displayName      = 'Copilot setting changes'
  operationFilters = @('UpdateTenantSettings')
} | Select-Object createdDateTime, userPrincipalName, operation,
    @{ n = 'details'; e = { $_.auditData | ConvertTo-Json -Depth 10 -Compress } }
```

Because it is Graph, this also works with an app registration instead of a signed-in admin, which is what you want for scheduled checks or many tenants.

If you ingest Copilot audit data into Microsoft Sentinel, it lands in the `CopilotActivity` table, where the table reference gives `UpdateCopilotSettings` as an example record type:

```kql
CopilotActivity
| where RecordType == "UpdateCopilotSettings"
| project TimeGenerated, ActorName, ActorUserType, SrcIpAddr, LLMEventData
```

Turn that into an analytics rule and every change to Copilot settings becomes an incident someone has to look at. That is the closest thing to “nobody flips the switch unnoticed” you can get today.

Two limits: Audit (Standard) keeps records for 180 days by default, so a setting changed before that leaves no trail. And I have not found documentation confirming that the Flex Routing toggle specifically writes this event. Test it once by changing the setting and checking for the record.

### Find out who used Anthropic models

Each `CopilotInteraction` record carries `CopilotEventData.ModelTransparencyDetails`. Filtering on the provider tells you **who** used **which provider**, and when:

```powershell
Invoke-AuditSearch -Days 30 -Filter @{
  displayName      = 'Copilot interactions with Anthropic'
  operationFilters = @('CopilotInteraction')
  keywordFilter    = 'Anthropic'
} |
  Where-Object {
    @($_.auditData.CopilotEventData.ModelTransparencyDetails |
      ForEach-Object { $_.ModelProviderName }) -contains 'Anthropic'
  } |
  Group-Object userPrincipalName | Sort-Object Count -Descending |
  Select-Object Count, Name
```

The `keywordFilter` lets Microsoft's side do the rough filtering: it matches “Anthropic” anywhere in the record details. That would also catch a file called *Anthropic.docx*, so the `Where-Object` step keeps only records where Anthropic is the model provider.

In Sentinel, without depending on how the nested fields are laid out:

```kql
CopilotActivity
| where TimeGenerated > ago(30d)
| where RecordType == "CopilotInteraction"
| where tostring(LLMEventData) has "Anthropic"
| summarize Interactions = count(), LastSeen = max(TimeGenerated) by ActorName
| order by Interactions desc
```

Read the result as a **lower bound**. Requests on *Auto* may have no provider recorded, so “no Anthropic hits” does not prove that no Anthropic model was used. A hit, on the other hand, is solid evidence that data went to a model Microsoft documents as excluded from the EU Data Boundary. If your settings say Anthropic is off, it is also evidence that the settings are not what you think.

### Checking many tenants

If you manage many tenants, you'll want to read these settings with a script. As far as I can find, **you can't.** The Copilot admin settings in Microsoft Graph currently expose only one setting (`limitedMode`, for Teams meetings), and I found no documented Graph endpoint or PowerShell cmdlet for Flex Routing or the AI provider settings. Both Microsoft Learn pages describe only the admin center.

So for these two settings, checking means opening the admin center tenant by tenant. That supports the point of this post: a setting you can't read at scale won't be reviewed at scale. The audit log is the part you *can* automate across tenants, so start there.

## In practice: often on! ...and nobody knows

Everything above comes from documentation. This part is **my own experience**, so treat it as an observation and not a measurement: **in many tenants I have looked at, both Flex Routing and Anthropic were enabled, and the admins were not aware of it.** Your tenant may be different. That is exactly why you should look.

Why would that happen when the documentation says Anthropic is off by default in the EU, EFTA and UK? These are guesses, not documented causes:

- **Flex Routing:** it is on by default for eligible tenants created after 25 March 2026, and the documentation only “encourages” older tenants to check. A setting that was never actively chosen is easy to leave as it is.
- **Anthropic:** an admin may have switched it on to try a feature and never revisited it, or enabled it for a group of testers, or the tenant may not be classed as EU, EFTA or UK for this setting.
- **Nobody owns it:** these settings sit in a new *Copilot → Settings* area, outside the places admins usually review, so they can go unnoticed.

The result is that a sentence like “our data stays in the EU” is being said in good faith about tenants where the settings say otherwise. That is the reason to check the settings, not only to read the policy.

## The claim, rewritten

| Statement | Supported by the documentation? |
| --- | --- |
| “Our data is not used to train the models.” | Yes |
| “Copilot only shows users what they already have access to.” | Yes |
| “Our Copilot data is stored in the EU.” | Yes, with the pseudonymized-data exception |
| “Processing happens inside the EU.” | Only if Flex Routing is off **and** Anthropic models are not enabled |
| “We can show from the logs that a prompt was processed in the EU.” | No. The documented audit record has no processing-location field |
| “Our data never leaves our tenant.” | I found no such statement in the documentation I read. Microsoft talks about the service boundary and the EU Data Boundary, not the tenant |

A more accurate one-liner: ***“Our Copilot data is governed by Microsoft's DPA and stored in the EU. Where inference runs depends on two admin settings, and we have set them deliberately.”***

## What is not documented

I'd rather be clear about the gaps than guess:

- The pages I read do not say **where Anthropic processes** the data for Copilot, only that it is outside the EU Data Boundary.
- How often **peak periods** happen is not stated.
- Whether any log, report or API shows **which region processed a specific request**. The audit schema I read doesn't list one. If you know of one, I'd like to hear about it.
- Whether the Flex Routing and AI provider settings can be **read through an API**. I found none.
- **Which settings** write the `UpdateTenantSettings` audit event, and how the record names them.
- The privacy page's EU Data Boundary section does not mention Flex Routing in the part I read. The Flex Routing page is the one that qualifies it, so read the two together.

If your decision depends on these points, put the question to your Microsoft account team in writing.

## Admin checklist

1. Check **Flex routing during peak load periods** and choose allow or don't allow on purpose. Don't rely on the default.
2. Check **AI providers operating as Microsoft subprocessors** and see whether Anthropic is on, off, or scoped to a group.
3. Check **Copilot in Microsoft 365 apps with Anthropic models** if you are in the EU, EFTA or UK.
4. Check the **Power Platform admin center** settings for Copilot Studio and agents.
5. Make sure nobody has enabled **Anthropic models with Data Retention** without a decision on record.
6. Update your **DPIA and records of processing** to describe inference location and the subprocessor accurately.
7. Record **when** you set Flex Routing and the Anthropic settings, and keep the change history. Per-request routing evidence isn't documented, so this timeline is what you have.
8. **Alert** on `UpdateTenantSettings` / `UpdateCopilotSettings`, and run the Anthropic usage query regularly, especially if your settings say Anthropic is off.
9. Review again on a schedule, because the defaults and the documentation both move.

## Closing thought

None of this makes Copilot unsafe, and none of it means you can't use it in the EU.

But from the admin side, Copilot is still a bit of a **black box**. You see what goes in and what comes out, but not where the thinking happened. And the switches that decide it are scattered across the **Microsoft 365 settings jungle**, in an admin center that grows a new branch every few months.

That's why “our data stays inside the tenant” bothers me. Not because it's a lie, but because it's **too simple**. Privacy rarely fits in one sentence. The honest version is a little longer: *which* data, stored *where*, processed *where*, by *whom*, and who flipped the switch.

Grab a coffee, open the admin center and check your settings. If you're not the admin, bring them one too. And when someone asks where Copilot processes your data, say the longer sentence.

## Sources

- [Data, Privacy, and Security for Microsoft Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-privacy) (Microsoft Learn)
- [Flex routing (EU and EFTA)](https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-flex-routing) (Microsoft Learn)
- [Anthropic models in Microsoft Online Services](https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor) (Microsoft Learn)
- [Audit logs for Copilot and AI applications](https://learn.microsoft.com/en-us/purview/audit-copilot) (Microsoft Learn, Purview)
- [Audit log activities: Microsoft 365 Copilot admin activities](https://learn.microsoft.com/en-us/purview/audit-log-activities#microsoft-365-copilot-admin-activities) (Microsoft Learn, Purview)
- [Create auditLogQuery](https://learn.microsoft.com/en-us/graph/api/security-auditcoreroot-post-auditlogqueries?view=graph-rest-1.0) (Microsoft Graph, audit search API)
- [CopilotInteraction audit schema](https://learn.microsoft.com/en-us/office/office-365-management-api/copilot-schema) (Office 365 Management API)
- [CopilotActivity table reference](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/copilotactivity) (Azure Monitor / Microsoft Sentinel)
- [copilotAdminSetting resource type](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/admin-settings/resources/copilotadminsetting) (Microsoft Graph)
