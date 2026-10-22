---
layout: interestring
title: Storing KVM Virtual Machine Disks on a NAS (Proxmox / libvirt)
date: 2022-04-27 19:52:50
keywords: 'KVM NAS, VM storage, Proxmox NAS, qcow2, NFS VM, kvm migration storage, proxmox nas storage'
tags: interestring
lang: en
translationKey: 将KVM的虚拟机存储到NAS上
---
<img src="/images/kvm-log.png">


## Prerequisites

The concepts and software you should know before reading:
### Concepts
+ Basic use of KVM
+ Basic use of a NAS
+ Familiarity with the shell `mount` command
+ Common disk formats

### Software
+ KVM
+ cifs-utils
+ An `.iso` file for any operating system

## Preface & Background (a bit of a rant)
My main machine broke recently, so I brought up a spare `Ubuntu` host. That machine's disk is only `256G`, so whenever I absolutely need Windows I run it as a `KVM` virtual machine.<br/>
As everyone knows, Windows software and the operating system itself are both rather large, so I wondered: could the whole virtual machine just be thrown onto the `NAS`? That question is where the following pitfalls, detours and fixes came from.

## Pitfall 1 — Permission problems when KVM uses a NAS mount point
<img src="/images/permission-error.png">

This happened when I chose to create a new virtual machine and wanted to use a `NAS` directory as the VM installation directory.<br/>
Intuitively it looked like `KVM` simply lacked the permission, so I first tried `sudo virt-manager`, raising the KVM management GUI to ROOT level — yet even running as ROOT gave the very same error.
After some searching I found that the default user of the libvirtd service is different from the current system user, and that `user = ` and `group = ` in `/etc/libvirt/qemu.conf` must be changed before anything takes effect.
Still, always running KVM with ROOT privileges is not elegant. The final solution was to mount the NAS share manually and specify the uid of the mount point, with the command:
`mount -t cifs -o username=<nas user>,vers=3.11,nobrl,uid=libvirt-qemu //<nas domain>/<nas path> /<path>/<your>/<store>`
[Link to the original solution](https://unix.stackexchange.com/questions/622194/how-to-use-qemu-kvm-virtual-machine-disk-image-on-smb-cifs-network-share-permis)

## Pitfall 2 — Disk type problems when mounting the NAS manually
<img src="/images/mout-nas-error.png">

Mounting the NAS manually can produce the error shown above. This is because `/sbin/mount.cifs` has not been created (you can check with `ls -l /sbin/mount.cifs`). Installing it with `sudo apt install cifs-utils` solves the problem.

[Link to the original solution](https://askubuntu.com/questions/525243/why-do-i-get-wrong-fs-type-bad-option-bad-superblock-error)

At this point, setting the virtual machine installation directory through the KVM GUI no longer runs into permission problems. Note that the installation directory you select must be the `/<path>/<your>/<store>` part of the mount command, not the one the system discovers automatically — otherwise the permission problem comes straight back.
