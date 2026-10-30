---
title: 'AI & Segmentation: Old school solutions for modern problems'
description: 'AI is speeding up how fast vulnerabilities are found and exploited. Network segmentation is boring, decades old, and one of the few controls that still works on day zero.'
pubDate: 2026-10-30
cover: '../../assets/covers/segmentation-ai.svg'
coverAlt: 'A bar chart of time to exploit shrinking from 63 days to minus 7, an AI chip sending an exploit into a network, and a firewall containing it in the DMZ while clients, servers and admin zones stay locked'
tags: ['segmentation', 'network', 'hardening', 'blue-team']
---

For years the deal was simple: a vendor publishes a fix, you roll it out in your next patch window, and you are reasonably safe in between. That deal is gone. The window between “a vulnerability becomes known” and “someone is exploiting it” has shrunk to days, and for a good share of vulnerabilities it is now zero or less.

AI didn't start that trend: the window was already shrinking years before. But AI is pouring fuel on it. CERT-EU warned in April 2026 that AI now finds and weaponises vulnerabilities faster than the classic discover, disclose, patch, deploy cycle can keep up with.

Patching is still mandatory. But if your security only works *after* the patch is installed, there is a gap you can't close by patching faster. This post is about the control that covers that gap, and it isn't new at all: **network segmentation**.

> Figures are taken from the sources linked at the end and reflect what they reported up to 30 October 2026. Different vendors measure “time to exploit” differently, so compare trends, not single numbers.

## The window is gone

Mandiant has tracked “time to exploit” for years: the average number of days between a patch being released and the first exploitation. A negative number means attackers were in before the patch existed.

![Bar chart of Mandiant's average time to exploit: 63 days in 2018–2019, 32 days in 2021–2022, 5 days in 2023, and an estimated minus 7 days in M-Trends 2026, meaning exploitation before a patch exists](../../assets/diagrams/time-to-exploit.svg)

The 2023 analysis covered 138 vulnerabilities exploited in the wild, and 97 of them were exploited as zero-days. Mandiant calls its figures conservative, and the five-day average leaves out 15 outliers. With them included, it rises to 47 days. The −7 figure comes from Mandiant's M-Trends 2026 report, as cited by CERT-EU.

VulnCheck looks at the same problem from another angle: how many known exploited vulnerabilities showed exploitation **on or before the day the CVE was published**? In 2025 it was **28.93%**. In the first half of 2026 it was **23.43%**, out of 495 newly known exploited vulnerabilities.

Two things are worth keeping in mind:

- **It isn't all fast.** VulnCheck's median time from CVE publication to known exploitation was still 80 days in the first half of 2026. Many vulnerabilities are exploited months or years later. The fast ones are the leading edge, but they are exactly the ones a monthly patch cycle can't catch.
- **The targets are predictable.** Content management systems made up about a third of VulnCheck's newly exploited vulnerabilities, and the list of edge-device vendors (firewalls, VPN gateways, remote access appliances) is long. Those are the systems that face the internet.

Compare that with a typical enterprise patch cycle of 30 to 60 days, a range CERT-EU cites as well. The maths doesn't work out.

## Why an old answer still works

Segmentation is about as unglamorous as security gets. DMZs, VLANs, firewall rules between zones: Humanity has been doing this since the 1990s. That is also its strength:

- **It doesn't care which CVE it is.** A rule that stops the VPN appliance from talking to workstations works on day −7, day 0 and day 300, whether or not a patch exists.
- **It limits the blast radius.** If an exposed system falls, the attacker gets that system and what it is allowed to reach, not the whole network.
- **It buys time.** An attacker who has to break through a second and third boundary needs time and makes noise. That's time for you to patch and noise for you to detect.
- **It creates chokepoints you can watch.** Traffic between zones passes through a few places you can log. A flat network gives you nothing to look at.

For a defender, that last point matters as much as the blocking. The question is no longer only “can we keep them out?” but “when they get in, how far do they get, and will we see it?”.

## What CERT-EU recommends

CERT-EU, the cybersecurity service for the EU institutions, bodies and agencies, addresses exactly this.

**April 2026: “AI is changing the economics of vulnerability discovery”.** The argument: AI finds and exploits vulnerabilities faster than the classic discover, disclose, patch, deploy cycle can handle. The recommendations read like a segmentation brief:

- **Reduce the attack surface:** switch off unnecessary internet-facing services, close unused ports, remove legacy systems and *enforce network segmentation*.
- **Patch exposed systems fast:** for critical vulnerabilities on exposed assets, aim for remediation “within days, not weeks”. Internet-facing systems and edge devices should be patched without delay.
- **Use compensating controls when you can't patch yet:** a web application firewall, network segmentation and temporary access restrictions, deployed immediately.
- **Keep the basics tight:** rotate credentials, keep an accurate asset inventory and deploy **phishing-resistant MFA**.
- **Move towards zero trust:** assume the perimeter is breached. Start with identity and least privilege, then extend to network segmentation, micro-segmentation where feasible, and continuous verification of devices and users.
- **Invest in detection:** behavioural detection, anomaly monitoring and threat hunting.

**March 2022: Security Guidance 22-001.** Older, but concrete about what to build:

- Require **multi-factor authentication for every service that can be reached remotely**, including VPN and RDP.
- Create separate network segments, with VLANs or a similar mechanism, and **filter the traffic between them**.
- Use an endpoint firewall policy that only allows the flows you need, and block lateral-movement protocols (SMB, RDP, WinRM, WMI) **between workstations**, and from workstations to servers that aren't domain controllers or file servers.
- Use privileged accounts only from designated systems, such as privileged access workstations, in **restricted and protected VLANs**.
- Block or severely limit **outbound internet access** for servers and devices that rarely reboot.
- Keep cloud management separate from on-premise management.

Put the two together and the message is clear: patch faster, *and* assume you won't always be fast enough.

## Where I would start

You don't need a zero-trust programme to get most of the benefit. In my experience, these steps give the most protection for the effort:

1. **Know what faces the internet.** VPN gateways, firewalls, mail gateways, web servers, remote access tools. Each of these is a likely first foothold.
2. **Keep a software inventory and run vulnerability management.** You can only patch what you know about. Track which products *and versions* run where, starting with the edge. Follow your vendors' security advisories, and prioritise by what is actually being exploited, using known-exploited lists such as CISA's KEV catalog, and by what is exposed, not by CVSS score alone. CERT-EU's 2022 guidance says the same: put known exploited vulnerabilities on internet-facing assets first.
3. **Put internet-facing systems in their own zone.** A DMZ is old technology because it works. Decide exactly which internal systems each one may talk to, and on which ports.
4. **Phishing-resistant MFA on every edge service.** VPN, remote desktop gateways, webmail, admin portals: anything that accepts a login from the internet. More on this below.
5. **Isolate management.** Management interfaces of firewalls, hypervisors, switches and backup systems belong in a management network, reachable only from admin workstations. Never from the client VLAN, never from the internet.
6. **Stop workstation-to-workstation traffic.** Clients rarely need to talk to each other. Blocking that alone takes away much of an attacker's lateral movement.
7. **Default-deny outbound for servers.** Most servers don't need to browse the internet. Allow updates and the few destinations they need, and block the rest.
8. **Log at the boundaries.** Record what crosses between zones, especially denied traffic from places that shouldn't be talking at all.
9. **Write the allowed flows down.** A simple table of zone A to zone B, port, reason and owner. Anything not in the table is a question worth asking. In practice, this often just means comments on your firewall rules. Everyone knows those rules nobody dares to touch, because nobody remembers where they came from anymore.

## Risk mitigation: you can't hide everything

Segmentation works best for things that don't need to be reachable. But some services exist precisely to face the internet: webmail, Microsoft 365, customer portals, the VPN gateway itself. You can't put those behind a wall. For them, the question changes from *who can reach it?* to *what does it take to get in?*

- **Go passwordless where possible.** Passkeys, FIDO2 security keys, Windows Hello for Business or certificate-based authentication. No password means nothing to phish, spray or reuse from another breach.
- **MFA everywhere else, phishing-resistant where you can.** Codes sent by SMS or approved by push are better than nothing, but they can be phished or spammed until someone taps “approve”. The second one even has a name: **MFA fatigue**. Attackers who already have the password send push request after push request, at night or during a meeting, until a tired or annoyed user approves one just to make it stop. Even the most experienced IT people are vulnerable to this. Number matching helps, but only phishing-resistant methods remove the problem.
- **Keep the exposed part small.** Publish the service, not its admin interface. Management belongs in the management network (step 5).
- **Combine it with segmentation.** Even a valid login should only land in the zone it actually needs.

Segmentation can't stop an attacker who simply logs in with a stolen password. Strong authentication can't stop an unpatched pre-auth exploit on the appliance. Together they cover a lot more than either does alone.

## Where segmentation goes wrong

- **VLANs with any-to-any rules.** Separate subnets that can all reach each other are decoration, not segmentation.
- **Exceptions that never expire.** “Temporary” rules for a migration in 2021 are still there in 2026. Give exceptions an owner and an end date.
- **Management on the user network.** If the firewall's admin interface is reachable from the client VLAN, one phished laptop is enough.
- **Segmentation without monitoring.** Blocked traffic you never look at only tells you something after the incident.
- **Forgetting the edge device itself.** The VPN gateway is often the first thing compromised. Ask what *it* can reach, not only what can reach it.

## Closing thought

The CVE feed is getting faster, and AI is pushing it faster still. Patching alone is a race you will sometimes lose, through no fault of your own.

Segmentation won't make headlines. It is old, it is a bit boring, and it has been working quietly for thirty years. When the exploit arrives before the patch, it is often the thing that decides whether you lose one appliance or the whole network.

## Sources

- [AI is changing the economics of vulnerability discovery. Defenders should adapt now](https://www.cert.europa.eu/blog/ai-vulnerability-discovery-defenders-must-adapt) (CERT-EU, 21 April 2026)
- [Security Guidance 22-001: Cybersecurity mitigation measures against critical threats](https://cert.europa.eu/publications/security-guidance/security-guidance-22-001---cybersecurity-mitigation-measures-against-critical-threats/) (CERT-EU, 9 March 2022)
- [How Low Can You Go? An Analysis of 2023 Time-to-Exploit Trends](https://cloud.google.com/blog/topics/threat-intelligence/time-to-exploit-trends-2023) (Mandiant / Google Cloud)
- [Analysis of Time-to-Exploit Trends: 2021–2022](https://cloud.google.com/blog/topics/threat-intelligence/time-to-exploit-trends-2021-2022/) (Mandiant / Google Cloud)
- [State of Exploitation 1H-2026](https://www.vulncheck.com/blog/state-of-exploitation-1h-2026) (VulnCheck, 28 July 2026)
