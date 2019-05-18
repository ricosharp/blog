---
title: "Windows 10 deployment with Linux"
excerpt: "A guide to deploying Windows 10 over a network with Microsoft Deployment Toolkit (MDT) and Linux"
---

I've always been under the impression that you need Windows Deployment Services (WDS) in order to deploy Windows with the Microsoft Deployment Toolkit (MDT). But it turns out you need nothing more than a Samba share, TFTP server, and a few tweaks to DHCP to get a pretty solid set up.

This procedure involves generating a boot image with MDT and copying that image to a TFTP server. A client then PXE boots, loads that image into memory through memdisk and runs the task sequence to install Windows. You will of course require one Windows machine to configure the task sequences.

This guide only contains the barebones installation of Windows through a Deployment Share. You can add software and automate the process to provide a zero touch installation. More on that in a future post.

# Requirements
Below are the requirements:
- [Linux computer with a Samba share](#Linux computer with a Samba share)
- [Windows 10 computer with MDT](#Windows 10 computer with MDT)
- [TFTP server](#TFTP Server)
- [DHCP server](#DHCP Server)

To keep things simple, I will configure Samba, DHCP, and TFTP on the same computer. I will be using CentOS in this guide but these steps should be easily portable to other flavours of Linux.

This guide is based on a virtual environment using KVM. The CentOS computer will be configured with an IP address of 192.168.122.100/24. All other computers (Windows 10, deployment machine) are virtual and configured to use DHCP.

The CentOS computer has been installed with the CentOS minimal ISO. The latest updates have been installed.

# Steps
## <a name="Linux computer with a Samba share">Linux computer with a Samba share</a>
Install samba and policycoreutils-python. The latter package will give us the semanage command for SELinux.
{% highlight bash %}
~]# yum install -y samba policycoreutils-python
{% endhighlight %}

Create two user accounts; mdtread and mdtwrite. The mdtread account will used to connect to the deployment share during deployment. The mdtwrite account is what the Windows 10 computer will use to connect and make changes to the deployment share. These accounts are only needed for authentication so we won't create a home directory (-M) or give them a shell (-s /sbin/nologin).

{% highlight bash %}
~]# useradd -M -s /sbin/nologin mdtread
~]# useradd -M -s /sbin/nologin mdtwrite
~]# passwd mdtread
~]# passwd mdtread
~]# smbpasswd -a mdtread
~]# smbpasswd -a mdtwrite
{% endhighlight %}

Create and configure the MDT Share for Samba. I create this as a hidden share so it does not appear in an explorer window. I remove everything in the default smb.conf except the [global] section.
{% highlight bash %}
~]# mkdir -p /data/mdt
~]# chown -R mdtwrite:mdtwrite /data/mdt
~]# vi /etc/samba/smb.conf
[mdt$]
    path = /data/mdt
    valid users = mdtread mdtwrite
    write list = mdtwrite
{% endhighlight %}

Verify everything is ok with the Samba configuration file
{% highlight bash %}
~]# testparm
{% endhighlight %}

Configure SELinux to allow Samba access to the mdt directory. Verify this with the ls commmand.
{% highlight bash %}
~]# semanage fcontext -a -t samba_share_t "/data/mdt(/.*)?"
~]# restorecon /data/mdt
~]# ls -alZ /data/mdt
{% endhighlight %}

{% highlight bash %}
~]# systemctl start smb
~]# systemctl enable smb
~]# firewall-cmd --add-service=samba
~]# firewall-cmd --add-service=samba --permanent
{% endhighlight %}

#### Optional
If you must enable NetBIOS, start and enable nmbd. This will allow you to resolve to the hostname of your Linux computer through NetBIOS, rather than DNS.
{% highlight bash %}
~]# systemctl start nmb
~]# systemctl enable nmb
{% endhighlight %}

#### Verify Share Access
On your Windows 10 computer, verify you can access the share. Click on the Start menu and type \\\192.168.122.100\mdt$

## <a name="Windows 10 computer with MDT">Windows 10 computer with MDT</a>
### Install MDT and ADK
You will need to download and install the following:
- Microsoft Deployment Toolkit
- Windows 10 Assessment and Deployment Kit (I just install Deployment Tools and Windows PE)

A simple Google search will bring up the download links for this software.

### Add Deployment Share to MDT

Once MDT and ADK are installed, open the Deployment Workbench.

Right click Deployment Shares and select New Deployment Share.

![New Deployment Share]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/new-deployment-share.png)

If you try to add the deployment share through its UNC path, you will receieve an error. This is because you haven't been authenticated yet. What you can do to work around this is open the Credential Manager from the Control Panel and add new Windows credentials for your share (192.168.122.100, mdtwrite, \<password>).

![Add using UNC path]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/add-unc-path.png)

![Credential Manager]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/credential-manager.png)

Follow the rest of the prompts. These can always be changed at a later stage. The Deployment Workbench will now copy some files to the MDT share.

### Obtain Windows 10 ISO and Upload to Deployment Share
You will need a Windows 10 ISO to upload to the MDT share. Thankfully this can be downloaded quite easily from the Microsoft website, unlike previous versions of Windows.

If using a Mac or Linux computer, you can go [here](https://www.microsoft.com/en-us/software-download/windows10ISO) and select the edition and language to download.

Downloading from a Windows machine requires a few more steps. It's nothing hard but we just need to trick the web server into thinking that we are using another operating system, otherwise we are presented wtith the Windows 10 installation media download. In Google Chrome, go to the [Windows 10 download site](https://www.microsoft.com/en-us/software-download/windows10ISO). Open the Developer tools (CTRL + SHIFT + I). Click the three dots at the top right hand corner > More Tools > Network Conditions. Uncheck Select Automatically and select a non-Windows OS, such as Chrome - Mac. Hit the refresh button and you will be able to select the edition and language to download.

![Network Conditions]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/network-conditions.png)

![Chrome Mac]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/chrome-mac.png)

I download the English version. I haven't verified this but I believe the difference between English and English International is the English version is US English. The English International version is British English and contains additional keyboard layouts.

Once the download has completed, mount the ISO.

![Mount OS]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/mount-os.png)

Back in the Deployment Share, right click Operating Systems and select Import Operating System.

![Import OS]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/import-os.png)

Make sure Full set of source files is checked and click next.

![OS Type]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/os-type.png)

Browse to the drive where the ISO was mounted and click next.

![OS Source]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/os-source.png)

Follow the rest of the prompts. The OS files will begin uploadeding to the Deployment Share. This may take a few minutes.

Now we want to create a task sequence. Right click Task Sequences and select New Task Sequence.

![New Task Sequence]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/new-task-sequence.png)

Give the Task Sequence an ID and Name and click next.

![Task Sequence Name]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/task-sequence-name.png)

Make sure Standard Client Task Sequence is selected and click next.

![Task Sequence Template]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/task-sequence-template.png)

Select the OS that you are deploying. Here I'm using Windows 10 Pro.

![Task Sequence Select OS]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/task-sequence-select-os.png)

Follow the rest of the prompts. I only have individual activation keys, so I don't specify them during the install.

We are now ready to generate the ISO that we can boot for deployment. Right click on the Deployment Share and select Update Deployment Share. Since this is a new Deployment Share, just click next through the prompts. The ISO that needs to be uploaded to the TFTP Server will be generated. This may take a few minutes.

![Update Deployment Share]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/update-deployment-share.png)

## <a name="TFTP Server">TFTP server</a>

Install TFTP Server.
{% highlight bash %}
~]# yum install -y tftp-server
{% endhighlight %}

Enable TFTP Server in its configuration file by changing the disable line from yes to no.
{% highlight bash %}
~]# vi /etc/xinetd.d/tftp
disable = no
{% endhighlight %}

Download syslinux. We need to use memdisk to boot the ISO. I just pull syslinux from the CentOS repos.
{% highlight bash %}
~]# yum install -y syslinux
{% endhighlight %}

Copy the necessary syslinux files to the tftpboot directory.
{% highlight bash %}
~]# cp /usr/share/syslinux/pxelinux.0 /var/lib/tftpboot/
~]# cp /usr/share/syslinux/memdisk /var/lib/tftpboot/
~]# cp /usr/share/syslinux/menu.c32 /var/lib/tftpboot/
{% endhighlight %}

Copy the LiteTouch ISO to the tftpboot directory.
{% highlight bash %}
~]# cp /data/mdt/Boot/LiteTouchPE_x64.iso /var/lib/tftpboot/
{% endhighlight %}

Create the boot menu.
{% highlight bash %}
~]# mkdir -p /var/lib/tftpboot/pxelinux.cfg
~]# vi /var/lib/tftpboot/pxelinux.cfg/default
default menu.c32
prompt 0
timeout 300
ONTIMEOUT 1

menu title ########## OS Deploy ##########

label 1
menu label ^1) Boot from local drive
localboot 0

label 2
menu label ^2) Windows 10
#menu default
kernel memdisk
append iso initrd=LiteTouchPE_x64.iso raw

{% endhighlight %}

Start the TFTP server and enable on startup.
{% highlight bash %}
~]# systemctl start tftp
~]# systemctl enable tftp
{% endhighlight %}

Configure firewall to allow TFTP through.
{% highlight bash %}
~]# firewall-cmd --add-service=tftp
~]# firewall-cmd --add-service=tftp --permanent
{% endhighlight %}

## <a name="DHCP Server">DHCP Server</a>
Install the DHCP server
{% highlight bash %}
~]# yum install -y dhcp
{% endhighlight %}

Configure the DHCP server
{% highlight bash %}
~]# vi /etc/dhcp/dhcpd.conf
DHCPDARGS=eth0; #Listen on eth0
subnet 192.168.122.0 netmask 255.255.255.0
{
        option routers                  192.168.122.1;
        option subnet-mask              255.255.255.0;
        option domain-search            "lab.local";
        option domain-name-servers      192.168.122.1;
        option time-offset              -18000;     # Eastern Standard Time
        filename                        "pxelinux.0";
        next-server                     192.168.122.100;
        range                           192.168.122.10 192.168.122.99;
}

{% endhighlight %}

Start the DHCP service and enable on startup
{% highlight bash %}
~]# systemctl start dhcpd
~]# systemctl enable dhcpd
{% endhighlight %}

Configure firewall to allow DHCP requests
{% highlight bash %}
~]# firewall-cmd --add-service=dhcp
~]# firewall-cmd --add-service=dhcp --permanent
{% endhighlight %}

## Finishing Touches

When the Deployment Share was created, a few files and folders were created on it. We need to adjust some of the permissions so our mdtread user can access the share.

{% highlight bash %}
~]# chmod -R 755 /data/mdt
{% endhighlight %}

## Deployment

We are now ready to deploy Windows 10.

Network boot the computer and select Windows 10.
![PXE Windows 10]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/pxe-win-10.png)

Select Run Deployment Wizard to install a new Operating System.
![Run Deployment Wizard]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/run-deployment-wizard.png)

Enter the read only credentials of the Deployment Share.
![Deployment Credentials]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/deployment-credentials.png)

Select the Windows 10 Deployment Task Sequence and follow the rest of the prompts. Follow the rest of the prompts. Windows 10 will now be installed.

## References
[Samba - Creating Local Accounts](https://wiki.samba.org/index.php/Setting_up_Samba_as_a_Standalone_Server#Creating_a_Local_User_Account)

[Samba Configuration File](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html)
