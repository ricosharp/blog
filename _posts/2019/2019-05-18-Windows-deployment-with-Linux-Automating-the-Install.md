---
title: "Windows 10 deployment with Linux - Automating the Install"
excerpt: "A continuation to deploying Windows 10 with MDT and Linux, with a focus on automating the process"
---

My [previous post](https://blog.ricosharp.com/posts/2019/Windows-deployment-with-Linux) about Windows 10 Deployment with Linux was focussed on how to get up and running. But the deployment process requires quite a bit of user interaction. For example, after network booting, you have to login to the deployment share. You then have to select the task sequence and set a bunch of other parameters. All of these steps can be automated to the point where there is zero user interaction.

In order to achieve a fully automated installation, you need to set some parameters in the CustomSettings.ini and Bootstrap.ini files. What these parameters do should be self evident in the configuration below.

My personal preference is not to fully automate a deployment. This gives you a way out if you accidentally network boot into the Windows PE environment, which would then automatically begin the Task Sequence. What I prefer to do force a page from the wizard to show, such as the Task Sequence selection (SkipTaskSequence=NO).

## CustomSettings.ini

There are two ways to edit this file:

1. Open \\\%DeployRoot%\Control\CustomSettings.ini with a text editor such as notepad.
2. In the Deployment Workbench, right click your Deployment Share then select properties. The CustomSettings.ini file can be edited from the Rules tab.

{% highlight text %}
[Settings]
Priority=Default
Properties=MyCustomProperty

[Default]
OSInstall=Y
SkipCapture=YES
SkipAdminPassword=YES
SkipProductKey=YES
SkipComputerBackup=YES
SkipBitLocker=YES
SkipTaskSequence=YES
TaskSequenceID="Windows 10 Deployment"
SkipComputerName=YES
SkipDomainMembership=YES
SkipUserData=YES
SkipLocaleSelection=YES
TimeZoneName="Eastern Standard Time"
SkipTimeZone=YES
SkipSummary=YES
{% endhighlight %}
## Booststrap.ini

There are two ways to edit this file:

1. Open \\\%DeployRoot%\Control\Bootstrap.ini with a text editor such as notepad.
2. In the Deployment Workbench, right click your Deployment Share then select properties. Select the Rules tab then click Edit Bootstrap.ini.

{% highlight text %}
[Settings]
Priority=Default

[Default]
DeployRoot=\\192.168.122.100\mdt$
UserID=mdtread
UserPassword=password
UserDomain=192.168.122.100
SkipBDDWelcome=YES
{% endhighlight %}

## References
[Toolkit Reference for the Microsoft Deployment Toolkit](https://docs.microsoft.com/en-us/sccm/mdt/toolkit-reference)
