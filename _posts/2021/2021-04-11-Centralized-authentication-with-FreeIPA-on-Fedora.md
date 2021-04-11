---
title: "Centralized authentication with FreeIPA on Fedora"
excerpt: "How to setup a centralized authentication server with FreeIPA"
---

The other day I logged into my Pi-Hole to update some DNS entries. I noticed a new version was available and decided to SSH into the device to run this. I tried a bunch of different username/password combinations and was lucky to finally log in. I realised that this was probably the time to implement some sort of centralized authentication on my network.

This post will outline a basic, single FreeIPA server setup. I am running the FreeIPA server on Fedora 33 Server and the client PC is running Fedora 33 Workstation. I will create a new post in future to include addtional FreeIPA servers with replication.

The server will be set up with the hostname and IP address in the table below. I have added a DNS entry to this on my Pi-Hole so other FreeIPA servers can find this host later on. It's also useful as I will be using my host PC to access the FreeIPA web interface.

Hostname|IP Address
--------|-----------------------------
ipa01.ipa.ricosharp.com|192.168.122.2

If you are following this guide in your own setup, make sure that DNS is resolving correctly. This will be the most likely cause of your issue.

# FreeIPA Server

Set a static IP address on the server (192.168.1.7 is my Pi-Hole):
{% highlight bash %}
nmcli con mod <int> ipv4.address 192.168.122.2/24
nmcli con mod <int> ipv4.gateway 192.168.122.1
nmcli con mod <int> ipv4.dns 192.168.1.7
nmcli con mod <int> ipv4.method manual
nmcli con down <int>
nmcli con up <int>
{% endhighlight %}

Run any updates to the system and reboot:
{% highlight bash %}
sudo dnf update -y
reboot
{% endhighlight %}

Set the hostname of the machine to the FQDN of the server:
{% highlight bash %}
sudo hostnamectl set-hostname ipa01.ipa.ricosharp.com
{% endhighlight %}

Update /etc/hosts with the IP address and FQDN (FQDN must be specified first!):
{% highlight bash %}
sudo vi /etc/hosts
# Add the following:
192.168.122.2 ipa01.ipa.ricosharp.com ipa01
{% endhighlight %}

Install the FreeIPA server and FreeIPA DNS packages:
{% highlight bash %}
sudo dnf install freeipa-server freeipa-server-dns -y
{% endhighlight %}

Add the following firewall rules. You can see which ports are opened by viewing /usr/lib/firewalld/services/ldap.xml and /usr/lib/firewalld/services/ldaps.xml
{% highlight bash %}
sudo firewall-cmd --add-service=freeipa-ldap --add-service=freeipa-ldaps --add-service=dns
sudo firewall-cmd --add-service=freeipa-ldap --add-service=freeipa-ldaps --add-service=dns --permanent
{% endhighlight %}

Run the FreeIPA server installer. Be sure to add the mkhomedir option, as this will create a folder in /home for a user logging in for the first time. If you ommit this option, then things may not run properly for logged in users. 
{% highlight bash %}
sudo ipa-server-install --mkhomedir
{% endhighlight %}

Next you will be prompted for some information. You can specify all this on the command line but I like to answer it interactively. I say yes to install the integrated DNS server. The script detects the hostname and domain name automatically and I will be using IPA.RICOSHARP.COM as the realm name. Enter a password for the admin and Directory Manager accounts when prompted.
{% highlight bash %}
The log file for this installation can be found in /var/log/ipaserver-install.log
==============================================================================
This program will set up the IPA Server.
Version 4.9.2

This includes:
  * Configure a stand-alone CA (dogtag) for certificate management
  * Configure the NTP client (chronyd)
  * Create and configure an instance of Directory Server
  * Create and configure a Kerberos Key Distribution Center (KDC)
  * Configure Apache (httpd)
  * Configure the KDC to enable PKINIT

To accept the default shown in brackets, press the Enter key.

Do you want to configure integrated DNS (BIND)? [no]: yes

Enter the fully qualified domain name of the computer
on which you're setting up server software. Using the form
<hostname>.<domainname>
Example: master.example.com.


Server host name [ipa01.ipa.ricosharp.com]: 

Warning: skipping DNS resolution of host ipa01.ipa.ricosharp.com
The domain name has been determined based on the host name.

Please confirm the domain name [ipa.ricosharp.com]: 

The kerberos protocol requires a Realm name to be defined.
This is typically the domain name converted to uppercase.

Please provide a realm name [IPA.RICOSHARP.COM]: 
Certain directory server operations require an administrative user.
This user is referred to as the Directory Manager and has full access
to the Directory for system management tasks and will be added to the
instance of directory server created for IPA.
The password must be at least 8 characters long.

Directory Manager password: 
Password (confirm): 

The IPA server requires an administrative user, named 'admin'.
This user is a regular system account used for IPA server administration.

IPA admin password: 
Password (confirm): 

Checking DNS domain ipa.ricosharp.com., please wait ...
Do you want to configure DNS forwarders? [yes]: 
The following DNS servers are configured in systemd-resolved: 192.168.1.7
Do you want to configure these servers as DNS forwarders? [yes]: 
All detected DNS servers were added. You can enter additional addresses now:
Enter an IP address for a DNS forwarder, or press Enter to skip: 
DNS forwarders: 192.168.1.7
Checking DNS forwarders, please wait ...
Do you want to search for missing reverse zones? [yes]: 
Reverse record for IP address 192.168.122.2 already exists
Do you want to configure chrony with NTP server or pool address? [no]: 

The IPA Master Server will be configured with:
Hostname:       ipa01.ipa.ricosharp.com
IP address(es): 192.168.122.2
Domain name:    ipa.ricosharp.com
Realm name:     IPA.RICOSHARP.COM

The CA will be configured with:
Subject DN:   CN=Certificate Authority,O=IPA.RICOSHARP.COM
Subject base: O=IPA.RICOSHARP.COM
Chaining:     self-signed

BIND DNS server will be configured to serve IPA domain with:
Forwarders:       192.168.1.7
Forward policy:   only
Reverse zone(s):  No reverse zone

Continue to configure the system with these values? [no]: yes

...
...
...
...

Setup complete

Next steps:
	1. You must make sure these network ports are open:
		TCP Ports:
		  * 80, 443: HTTP/HTTPS
		  * 389, 636: LDAP/LDAPS
		  * 88, 464: kerberos
		  * 53: bind
		UDP Ports:
		  * 88, 464: kerberos
		  * 53: bind
		  * 123: ntp

	2. You can now obtain a kerberos ticket using the command: 'kinit admin'
	   This ticket will allow you to use the IPA tools (e.g., ipa user-add)
	   and the web user interface.

Be sure to back up the CA certificates stored in /root/cacert.p12
These files are required to create replicas. The password for these
files is the Directory Manager password
The ipa-server-install command was successful
{% endhighlight %}

Next I will change the DNS of the FreeIPA server to itself:
{% highlight bash %}
sudo nmcli con mod enp1s0 ipv4.dns 192.168.122.2
{% endhighlight %}

I also like to change a few default settings such as the default shell and removing the default email domain:
{% highlight bash %}
kinit admin
ipa config-mod --defaultshell /bin/bash
ipa config-mod --emaildomain ""
{% endhighlight %}

Now create a test user:
{% highlight bash %}
kinit admin
# Interactively:
ipa user-add --password
# Single Command (other options can be found by runing ipa user-add --help)
ipa user-add test --first=test --last=test --password
{% endhighlight %}

Thankfully all the above can also be done easily in the web interface. In my case it is here:

[https://ipa01.ipa.ricosharp.com](https://ipa01.ipa.ricosharp.com)


# Client PC

I'll setup DHCP later but for now the client PC is running with these static network settings. The DNS server is our FreeIPA server which helps the client discover information when running the client installation.

IP Address        |Gateway      |DNS Server
------------------|-------------|-------------
192.168.122.100/24|192.168.122.1|192.168.122.2

Now on a client PC, install freeipa-client
{% highlight bash %}
sudo dnf install freeipa-client -y
{% endhighlight %}

Run the FreeIPA client installer. If your DNS is setup correctly everything wil be found and you will only need to enter the admin username/password when prompted. Don't forget to add the mkhomedir option. I also like to add the enable-dns-updates option so the client's DNS entries update on the server when an IP address changes.
{% highlight bash %}
sudo ipa-client-install --mkhomedir --enable-dns-updates
{% endhighlight %}

Now reboot the client PC and try logging in with the test account.