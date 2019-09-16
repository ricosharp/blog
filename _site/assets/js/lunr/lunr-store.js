var store = [{
        "title": "My First Jekyll Post",
        "excerpt":"Hello World!  ","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2018/My-First-Jekyll-Post",
        "teaser":null},{
        "title": "ScreenCloud Player on a Raspberry Pi",
        "excerpt":"ScreenCloud is a digital signage solution that is very user friendly. It is simple to configure, and compatible with variety of TV’s and devices. This guide will go through the process of installing ScreenCloud Player on a Raspberry Pi, and configuring it to automatically start on boot. Configuration On a...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2018/ScreenCloud-Player-on-a-Raspberry-Pi",
        "teaser":null},{
        "title": "Migrating a UniFi access point to a new controller",
        "excerpt":"If you have an access point that is already tied to an existing UniFi controller, you can migrate it to a new one without having to physically touch the device. I needed to do this in the past to move a bunch of access points from a failing Cloud Key,...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2018/Migrating-a-UniFi-access-point-to-a-new-controller",
        "teaser":null},{
        "title": "Over the Air TV to IPTV on Raspberry Pi",
        "excerpt":"IPTV is an alternative transport method for broadcasting content, rather than traditional means. Instead of than using coaxial cabling, CAT 5/6 or WiFi might be used instead. There are three things to consider when implementing IPTV: The source The network The client The source coming in can be anything from...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Over-the-Air-to-IPTV-on-Raspberry-Pi",
        "teaser":null},{
        "title": "Re-streaming video to a multicast address with VLC",
        "excerpt":"VLC is such a powerful tool. Excuse my ignorance but I have always seen it as just a media player that can play anything I throw at it. But it is capable of so much more! Ever since coming across dvblast, which turns out to be a VLC project, I’ve...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Re-streaming-video-to-a-multicast-address-with-VLC",
        "teaser":null},{
        "title": "Ubuntu 18.04 Customization",
        "excerpt":"Below is a script that I run after installing Ubuntu. It installs a couple of extra packages that I need and pins my favourite programs to the dash.     ","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Ubuntu-18-04-Customization",
        "teaser":null},{
        "title": "Fedora 30 Customization",
        "excerpt":"This is pretty much the same script as my Ubuntu one, minus VLC player. Actually, as I write this I’ve completly forgotten to include Jekyll! I’ll sort that out another day. This script is intended to be run under Fedora 30. It isn’t my current desktop environment as I have...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Fedora-30-Customization",
        "teaser":null},{
        "title": "Private VLAN's on a Cisco switch",
        "excerpt":"All hosts in an a broadcast domain can communicate with each other. For example, Figure 1 below shows 5 PC’s connected to a single switch, each configured with an IP address on the same subnet. If PC-1 was to ping PC-5, it will send an ARP request first, flooding the...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Private-VLANs-on-a-Cisco-switch",
        "teaser":null},{
        "title": "Windows 10 deployment with Linux - Initial Setup",
        "excerpt":"I’ve always been under the impression that you need Windows Deployment Services (WDS) in order to deploy Windows with the Microsoft Deployment Toolkit (MDT). But it turns out you need nothing more than a Samba share, TFTP server, and a few tweaks to DHCP to get a pretty solid set...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Windows-deployment-with-Linux-Initial-Setup",
        "teaser":null},{
        "title": "Windows 10 deployment with Linux - Automating the Install",
        "excerpt":"My previous post about Windows 10 Deployment with Linux was focussed on how to get up and running. But the deployment process requires quite a bit of user interaction. For example, after network booting, you have to login to the deployment share. You then have to select the task sequence...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Windows-deployment-with-Linux-Automating-the-Install",
        "teaser":null},{
        "title": "Samba 4 Active Directory Domain Controller on Ubuntu 18.04 Server",
        "excerpt":"This post will outline how to install an Active Directory(AD) Domain Controller on Ubuntu Server 18.04. Yes, that’s right…Active Directory on a linux host. Not a backup domain controller but a functional AD that you can create users with, join computers to, and set up group policy. Network configuration Hostname...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Samba-4-Active-Directory-Domain-Controller-on-Ubuntu-18-04-Server",
        "teaser":null},{
        "title": "How to configure a static IP address with netplan on Ubuntu 18.04 Server",
        "excerpt":"I’ve only just begun using Ubuntu 18.04 server and one of the very first things I noticed was that network configuration is now done using netplan. I’m so used to doing the following: ~]$ sudo nano /etc/network/interfaces auto ens3 iface ens3 inet static address 192.168.122.100 netmask 255.255.255.0 gateway 192.168.122.1 dns-nameservers...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/How-to-configure-a-static-ip-address-with-netplan-on-Ubuntu-18-04-Server",
        "teaser":null},{
        "title": "Up and running with Apache Guacamole on CentOS 7",
        "excerpt":"Apache Guacamole is an open source, clientless remote access gateway. It can be used to establish remote sessions over various protocols through a web browser. Below I will set up Apache Guacamole with authentication against Active Directory (AD) through Lightweight Directory Access Protocol (LDAP). After this I will configure a...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Up-and-running-with-Apache-Guacamole-on-Centos7",
        "teaser":null},{
        "title": "Converting ova to qcow2",
        "excerpt":"There is no native way (that I know of anyway) to simply import an ova file directly into KVM. An ova file is basically an archive file that contains virtual machine information. We can extract the files from this archive and convert the vmdk disks into qcow2 format and import...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Converting-ova-file-to-qcow2",
        "teaser":null},{
        "title": "Raspberry Pi Network Configuration",
        "excerpt":"Join a wifi network Configure settings to join a network: ~]$ sudo nano /etc/wpa_supplicant/wpa_supplicant.conf # Add these lines to the config file with the appropriate values: network={ ssid=\"Network_Name\" psk=\"Network_Password\" } Apply the settings: ~]$ wpa_cli -i wlan0 reconfigure Setting a static IP address ~]$ sudo nano /etc/dhcpcd.conf interface eth0 static...","categories": [],
        "tags": [],
        "url": "http://localhost:4000/posts/2019/Raspberry-Pi-Network-Configuration",
        "teaser":null}]
