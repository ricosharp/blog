---
title: "Up and running with Apache Guacamole on CentOS 7"
excerpt: "How to setup a clientless remote access gateway using CentOS 7 and Apache Guacamole with AD authentication, Windows RDP, and Remote Apps"
---

Apache Guacamole is an open source, clientless remote access gateway. It can be used to establish remote sessions over various protocols through a web browser. Below I will set up Apache Guacamole with authentication against Active Directory (AD) through Lightweight Directory Access Protocol (LDAP).

After this I will configure a Windows 10 Pro machine in two ways; Remote Desktop Protocol (RDP) and RemoteApp. The difference between the two is RDP offers a full desktop whereas RemoteApp will present a single application.

In this article I will continue to use the AD environment from my [Samba 4 Active Directory Domain Controller on Ubuntu 18.04 Server
](https://blog.ricosharp.com/posts/2019/Samba-4-Active-Directory-Domain-Controller-on-Ubuntu-18-04-Server) post.

The Apache Guacamole machine I will be using is a minimal installation of Centos 7 with an IP address of 192.168.122.75 and hostname of guacamole.

## Add DNS entry for Guacamole machine
On DC1, the domain controller, add a DNS record for the Apache Guacamole machine.

{% highlight bash %}
~]$ samba-tool dns add 192.168.122.70 ad.ricosharp.com guacamole A 192.168.122.75
{% endhighlight %}
*Make sure your Unix user has an account in AD so you can authenticate. The account I am using has been added as a Domain Administrator*

If you skip this step, you can just access the Guacamole machine through its IP address.

## Trusted Certificates for LDAP

You will need the public certificate of your domain controller (DC1) since we will be using LDAPS. Samba creates a self signed certificate when provisioning a domain controller in /var/lib/samba/private/tls called ca.pem. This will need to be copied to the CentOS 7 server. Here I also add it as a trusted certificate on the guacamole machine and test that it works.

**DC1**
{% highlight bash %}
~]$ sudo scp /var/lib/samba/private/tls/ca.pem root@guacamole.ad.ricosharp.com:/etc/pki/ca-trust/source/anchors/ca.pem
{% endhighlight %}

**GUACAMOLE**
{% highlight bash %}
~]# update-ca-trust extract
~]# openssl s_client -connect dc1.ad.ricosharp.com:636
{% endhighlight %}

The result will say ok. If you get a message saying unable to verify then the certificate has not been added properly.

Next you will need to create an LDAP bind user in AD. I just create a standard user called ldapbind through Active Directory Users and Computers.

![AD LDAP Bind User]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/ad-ldap-bind-user.png)

**GUACAMOLE**

Now, test that you can actually connect to AD with LDAPS. You will be prompted for the ldapbind user's password and 
{% highlight bash %}
~]# yum install openldap-clients -y
~]# ldapsearch -H ldaps://dc1.ad.ricosharp.com:636 -D CN=ldapbind,CN=Users,DC=ad,DC=ricosharp,DC=com -W -b DC=ad,DC=ricosharp,DC=com
{% endhighlight %}

If sucessful, the query will return some AD information. You should The machine is now ready to have Apache Guacamole installed.

## Guacamole Installation
The easiest way to get up and running is to use a script, like this one [here](https://github.com/Zer0CoolX/guacamole-install-rhel/blob/master/guac-install.sh) by [Zer0CoolX](https://github.com/Zer0CoolX).

Download the script, give it execute permissions, and run it.

{% highlight bash %}
~]# yum install wget -y
~]# wget https://raw.githubusercontent.com/Zer0CoolX/guacamole-install-rhel/master/guac-install.sh
~]# chmod +x guac-install.sh
~]# ./guac-install.sh
{% endhighlight %}

Follow the prompts to install. Below are the main settings to specify:

- Self-signed certificate
- Hostname - guacamole
- LDAP(S)
- yes to LDAPS
- Certificate filename: ca.pem
- Certificate path: /etc/pki/ca-trust/source/anchors/
- LDAP Server Hostname: ad.ricosharp.com
- LDAP User Base DN: DC=ad,DC=ricosharp,DC=com
- LDAP Search Bind DN: CN=ldapbind,CN=Users,DC=ad,DC=ricosharp,DC=com
- No 2FA

Select option 8 to begin installation. The script recommends a reboot once installation completes.

{% highlight bash %}
~]# reboot
{% endhighlight %}

After rebooting, you can access the web front end through either the hostname or IP address in a web browser.

![Guacamole UI]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/guacamole-ui.png)

The default administrator username/password is guacadmin/guacadmin.

## Linking AD Accounts

The default guacadmin user can only access users stored in the local database. You need to add an AD user in order view and grant AD accounts access to remote sessions.

1. Log in to web interface using the default username/password
2. Click guacadmin at the top right hand corner of the page and select Settings 
3. Click the Users tab
4. Select New User
5. Enter an AD username/password. This can be a standard user account in AD
6. Check all the permissions options to make this user an administrator

Log out and log back in under the AD account. You will now be able to see AD accounts under Settings > Users.

## Windows 10 Remote Desktop Protocol

The Windows 10 Pro machine I am using is connected to AD with an IP address of 192.168.122.90 obtained through DHCP.

**Windows 10 Machine**

First, configure the Window 10 computer to allow RDP.
1. Open File Explorer
2. Right click This PC > Properties
3. Click Remote Settings
4. Click Allow remote connections to this computer and click Select Users
5. Add Domain Users to this list
![RDP Setup]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/rdp-setup.png)


**Guacamole UI**

Next we need to add the machine to guacamole. Log into the guacamole UI and the administrator account that has access to AD users.
 
1. Click the username at the top right corner of the page > Settings
2. Click the Connections tab
3. Click New Connection
4. Give the connection a name and select RDP as the protocol
5. In the Network section under Parameters, enter either the hostname or IP and RDP port (default 3389)
6. Under Authentication use ${GUAC_USERNAME} as the username and ${GUAC_PASSWORD} as the password.
7. Enter the domain name and security mode
8. Select Ignore server certificate
9. Scroll to the bottom of the page and click Save

![RDP Parameters]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/rdp-parameters.png)

A couple of points to make about the configuration above. Step 6 takes the credentials of the current logged  in user (${GUAC_USERNAME} and ${GUAC_PASSWORD})and passes it through to the Windows 10 RDP session for log in. So if johndoe logs into the guacamole UI and can see the Windows 10 machine advertised, it will log into that RDP session with his johndoe AD credentials.

At step 8 we selected to ignore server certificates, as I do not have certificates set up. When connecting to an RDP session using the Windows RDP client, you will be prompted with a message saying the certificate is not trusted. Apache Guacamole does not do this and will fail to connect instead. Checking Ignore server certificate bypasses this.

**Advertise RDP Connection**

Now you need to actually advertise this connection to the users who should have access. To keep this simple, I'm going to advertise to a single user. Using the AD Administrator account within the guacamole UI, do the following.

1. Click the username at the top right corner of the page > Settings
2. Click the Users tab
3. Select the User who you want to advertise the RDP session to
4. Under Connections, click All Connections and check the box of the RDP session that was created
5. Click Save

You can now log out and log back in as this user and an RDP session will start automatically.

*Note that on a standard Windows computer, RDP is only limited to one logged in user at a time.*

![Guacamole RDP Session]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/guac-rdp-session.png)

## RemoteApps
RemoteApps is a great way of running a single application through an RDP session. The application is the only window that will show. There will be no start menu or desktop, just the application.

In order to use RemoteApps under Windows 10 Pro, you need to make a slight change in the registry. On the machine that the RemoteApp will be running:

1. Open the registry through Start > Run > regedit
2. Navigate to HKEY_LOCAL_MACHINE\SOFTWARE\Microsot\Windows NT\CurrentVersion\Terminal Server\TSAppAllowList
3. Select fDisabledAllowList and change the value from 0 to 1

![RemoteApp Registry]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/remoteapp-registry.png)

Now advertise the RemoteApp as a new connection in guacamole. Here I will be advertising notepad using the same Windows 10 machine above:

1. Log in as the AD Administrator account within the guacamole UI
2. Click the username at the top right corner of the page > Settings
3. Select the Connection tab and choose New Connection
4. Give the connection a name and make sure you select RDP as the protocol
5. In the Network section under Parameters, enter either the hostname or IP and RDP port (default 3389)
6. Under Authentication use ${GUAC_USERNAME} as the username and ${GUAC_PASSWORD} as the password.
7. Enter the domain name and security mode
8. Select Ignore server certificate
9. In the RemoteApp section enter the path of notepad (C:\Windows\system32\notepad.exe) in the Program textbox
10. Scroll to the bottom of the page and click Save

![RDP RemoteApp]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/rdp-remoteapp.png)

**Advertise RemoteApp**

As with the RDP session above, you need to advertise the RemoteApp RDP session

1. Log in as the AD Administrator account within the guacamole UI
2. Click the username at the top right corner of the page > Settings
3. Click the Users tab
4. Select the User who you want to advertise the RemoteApp RDP session to
5. Under Connections, click All Connections and check the box of the RemoteApp RDP session just created
6. Click Save

Now log in under the user the RemoteApp was advertised to and notepad will start automatically.

![RemoteApp Notepad]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/remoteapp-notepad.png)

## References
- [Apache Guacamole install script for RHEL 7/CentOS 7](https://github.com/Zer0CoolX/guacamole-install-rhel)

- [The following RemoteApp program is not in the list of authorized programs on Windows Essential Server](http://www.sbsfaq.com/the-following-remoteapp-program-is-not-in-the-list-of-authorized-programs-on-windows-essential-server/)

- [https://serverfault.com/questions/965941/guacamole-apache-ldap-assignment](Guacamole Apache LDAP Assignment)