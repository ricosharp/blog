---
title: "ScreenCloud Player on a Raspberry Pi"
excerpt: "Installing ScreenCloud Player on a Raspberry Pi, and configuring it to automatically start on boot."
last_modified_at: 2019-10-05
---
[ScreenCloud](https://screen.cloud) is a digital signage solution that is very user friendly. It is simple to configure, and compatible with variety of TV's and devices.

This guide will go through the process of installing ScreenCloud Player on a Raspberry Pi, and configuring it to automatically start on boot.

## Configuration

On a newly installed Raspbian system, download and install all updates, then reboot.
{% highlight bash %}
~]$ sudo apt update -y
~]$ sudo apt upgrade -y
~]$ reboot
{% endhighlight %}

Open Chromium and install the [ScreenCloud Digital Signage Player](https://chrome.google.com/webstore/detail/screencloud-digital-signa/efdahhfldoeikfglgolhibmdidbnpneo?hl=en).

![Add to Chrome]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2018/sc-add-to-chrome.png)

*Note the app-id in the URL is efdahhfldoeikfglgolhibmdidbnpneo. We will need this later when configuring the application to automatically start on boot.*

The application will automatically open once it is added to Chromium. Exit full screen by pressing escape on the keyboard and close the application.

Configure Chromium to automatically start the ScreenCloud Player by editing the autostart file. Also, now is a good time to disable the screensaver.
{% highlight bash %}
~]$ nano /etc/xdg/lxsession/LXDE-pi/autostart

# Add this line:
@chromium-browser --app-id=efdahhfldoeikfglgolhibmdidbnpneo --disable-session-crashed-bubble

# Comment out this line
#@xscreensaver -no-splash
{% endhighlight %}

Reboot the system. The pi will automatically login and start the ScreenCloud Player.
{% highlight bash %}
~]$ reboot
{% endhighlight %}

## Notes

The default username and password is pi/raspberry, which is assumed to be in use for this guide.

If you need to install Chromium, run the following command:
{% highlight bash %}
~]$ sudo apt install chromium -y
OR
~]$ sudo apt install chromium-browser -y
{% endhighlight %}

If the pi is not set to automatically login do the following:
{% highlight bash %}
~]$ sudo raspi-config
3 Boot Options > B1 Desktop / CLI > B4 Desktop Autologin
{% endhighlight %}

An alternative to finding the app-id is to navigate to chrome://apps in Chromium. Right click on ScreenCloud and create a shortcut on the desktop. Right click on the desktop shortcut and select properties. The app-id will be in the file path.

The pi autostart file used to be located in /home/pi/.config/lxsession/LXDE-pi. It is now in /etc/xdg/lxsession/LXDE-pi.

Chrome used to be launched through "chromium". It is now launched through "chromium-browser".