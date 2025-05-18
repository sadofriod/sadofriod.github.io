---
layout: interestring
title: 将KVM的虚拟机存储到NAS上
date: 2022-04-27 19:52:50
keywords: KVM with NAS, KVM storage pool, KVM with NAS
tags: interestring
---
<img src="/images/kvm-log.png">


## 基础知识

阅读之前你需要知道的知识和软件包括
### 知识点
+ KVM的基础使用
+ NAS的基础使用
+ 熟悉shell的mount命令
+ 常用的磁盘格式

### 软件
+ KVM
+ cifs-utils
+ 任意系统的`.iso`文件

## 前言&背景（一些牢骚）
最近由于主力机损坏，于是启动了备用的`Ubuntu`主机，由于这个主机的磁盘只有`256G`,在必须使用Windows的场景下使用`KVM`作为虚拟机。<br/>
众所周知，Windows的各种软件和系统本身都比较大，所以笔者想着：是否可以把虚拟机整体都扔进`NAS`里？于是便有了如下的坑、弯路和填坑的过程

## 第一个坑——KVM使用NAS挂载点的权限问题
<img src="/images/permission-error.png">

当我选择新建虚拟机，并且想把`NAS`目录作为虚拟机安装目录时发生了这个问题<br/>
直觉上来讲，可能是运行`KVM`的权限不够，导致了这个问题，所以首先我用`sudo virt-manager`命令，尝试将`KVM`管理GUI的权限提到ROOT级，然而即使用ROOT权限运行，还是得到同样的报错。
经过一番搜索，发现libvirtd这个服务的默认用户，和系统的当前用户是不同的，需要修改`/etc/libvirt/qemu.conf`中的`user = `以及`group = `才会生效。
但是，始终用ROOT权限运行KVM始终是不够优雅，最终解决方案是，手动设置NAS挂载点，并指定挂载点的uid,具体命令：
`mount -t cifs -o username=<nas user>,vers=3.11,nobrl,uid=libvirt-qemu //<nas domain>/<nas path> /<path>/<your>/<store>`
[解决方式原文链接](https://unix.stackexchange.com/questions/622194/how-to-use-qemu-kvm-virtual-machine-disk-image-on-smb-cifs-network-share-permis)

## 第二个坑——手动挂载NAS时，磁盘类型问题
<img src="/images/mout-nas-error.png">

手动挂载NAS可能会遇到上图所示的错误，这是因为`/sbin/mount.cifs`没有被创建（可以运行`ls -l /sbin/mount.cifs`检测）。运行安装`sudo apt install cifs-utils`可以解决.

[解决方式原文链接](https://askubuntu.com/questions/525243/why-do-i-get-wrong-fs-type-bad-option-bad-superblock-error)

至此，再度使用KVM的GUI去设置虚拟机的安装目录，就不会有权限问题了，需要注意的是，安装目录需要选择的是，挂载命令中 `/<path>/<your>/<store>`的部分，不能使用系统自动发现的部分，否则还是会出现权限的问题。


