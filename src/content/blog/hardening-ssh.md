---
title: 'Hardening SSH on Linux Servers: A Sysadmin Checklist'
description: 'Ten minutes of sshd_config changes that remove most of the noise from your auth logs.'
pubDate: 2026-10-12
cover: '../../assets/covers/ssh.svg'
coverAlt: 'A padlock connected to a network of servers'
tags: ['linux', 'ssh', 'hardening']
draft: true
---

Every internet-facing SSH server gets hammered by password-guessing bots within minutes. A few config changes make that noise irrelevant.

## The changes

Edit `/etc/ssh/sshd_config.d/10-hardening.conf`:

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
AllowGroups ssh-users
MaxAuthTries 3
LoginGraceTime 20
```

Validate before you reload, and keep your current session open until you've tested a new one:

```bash
sudo sshd -t && sudo systemctl reload ssh
```

> Don't lock yourself out: confirm key-based login works in a **second** terminal before closing the first.

## Add a safety net

- **fail2ban** or **sshguard** to ban repeat offenders
- A firewall rule limiting SSH to your VPN or management network
- Alerting on logins from unexpected source IPs, not just failures

## Verify

```bash
sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin|allowgroups'
```
