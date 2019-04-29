---
title: "Over the Air TV to IPTV on Raspberry Pi"
excerpt: "How to stream free to air television over an IP network"
---

IPTV is an alternative transport method for broadcasting content, rather than traditional means. Instead of than using coaxial cabling, CAT 5/6 or WiFi might be used instead.

There are three things to consider when implementing IPTV:
- The source
- The network
- The client

The source coming in can be anything from a coaxial connection from your cable provider to an antenna. It could even be an http(s) stream, YouTube video, or even the HDMI output of an external device. These sources would be connected to a distribution device on one side. The other side of this distribution device will be the network.

You can use unicast addressing to send IPTV over the network. However, unicast traffic is one to one and therefore not scalable in this situation. If five clients are watching the same channel, the same traffic is going over the network five times!

Multicast is a more efficient means of sending this type of data over a network. It can be used to send a single stream of data to multiple clients. If the five clients are watching the same channel, then the source device is only sending the channel once to those five clients.

A multitude of devices can be used to tune into an IPTV channel. This could be something as simple as VLC player to a full set top box solution managed by some type of middleware platform. 


## Equipment
I'm going to keep things simple and use the following:

- Raspberry Pi 3 Model B+
- Hauppauge WinTV-dualHD USB Tuner

The distribution device is the Pi. The source is free to air television which I am using a USB TV tuner to access. The Pi's network port will be connected to my multicast VLAN. I will be accessing these streams from my Macbook Pro using VLC player.

Digital TV transmits more than one channel on a given frequency. So if there are four channels on one frequency and three on the other, you can send out a total of seven channels to your network. I chose this particular USB TV Tuner because it can pick up two frequencies. One of these is not enough to tune into all the channels in my area. But it is a great device to start learning about IPTV implementation.

When choosing a tuner, make sure that it is compliant with the standard in your country. Here in the US the standard is ATSC, so the Hauappage USB that I chose supports this. Other countries might use DVD-T, so bare this in mind.

## Write Raspbian to SD card
First let’s put an OS on the Pi. Connect your micro SD card to your computer and identify which disk it is. I’m using a MacBook Pro and the diskutil program.

{% highlight bash %}
~]$ diskutil list
{% endhighlight %}

You should be able to identify your micro SD card from the output. In my case, this is /dev/disk2.

Next, unmount the disk and write the OS to it. I’m using the current April 2019 Raspbian Stretch Lite with kernel version 4.14. After the image has been written to disk, unmount it again and insert the micro SD card into the Pi.

{% highlight bash %}
~]$ diskutil unmountdisk /dev/disk2
~]$ sudo dd if=2019-04-08-raspbian-stretch-lite.img of=/dev/disk2
~]$ diskutil unmountdisk /dev/disk2
{% endhighlight %}

## Run updates and upgrade kernel
Start the Pi and update the system. While we’re at it, let’s enable SSH and reboot to verify it has started.

{% highlight bash %}
# update system
~]$ sudo apt update -y
~]$ sudo apt upgrade -y
# enable SSH
~]$ sudo systemctl enable ssh
~]$ sudo systemctl start ssh
~]$ reboot
{% endhighlight %}

At the time of writing, the Raspbian Stretch kernel is 4.14. This kernel only supports one of the tuners inside the Hauppauge WinTV-dualHD USB TV tuner straight out of the box. Kernel version 4.17 added support for both (see [here](https://www.linuxtv.org/wiki/index.php/ATSC_USB_devices)). You can update the Pi to 4.19 by issuing the below commands.

{% highlight bash %}
# update kernel
~]$ sudo rpi-update
~]$ reboot
{% endhighlight %}

After rebooting, you should see that both tuners are detected.

{% highlight bash %}
~]$ ls /dev/dvb
adapter0  adapter1
{% endhighlight %}

## Install and Configure IPTV
Next, install the tools that we need to scan for channels and provide IPTV over the network.

{% highlight bash %}
# install IPTV tools
~]$ sudo apt install dvb-apps dvblast -y
{% endhighlight %}

You can use the scan program included with dvb-apps to scan for free to air channels in your area. A file containing the frequencies to scan is required. The easiest way to perform the scan is to use a file from /usr/share/dvb/dvb-legacy/atsc (assuming you are in an ATSC country) containing predefined frequencies. I will use the us-ATSC-center-frequencies-8VSB file to perform the scan, then output the results to a channels.conf file.

{% highlight bash %}
~]$ scan /usr/share/dvb/dvb-legacy/atsc/us-ATSC-center-frequencies-8VSB > channels.conf
{% endhighlight %}

This scan will take a while and will come up with a number of "tuning failed" results. This just means that there is nothing broadcasted on this frequency.

You can build your own scan file to reduce the amount of time a scan takes. The [AntennaWeb](https://antennaweb.org/Address) site is useful when doing this (US only).

The final channels.conf file will look something like this:

{% highlight bash %}
~]$ cat channels.conf
WJLA-HD:177028615:8VSB:49:52:3
WJLACHG:177028615:8VSB:65:68:4
WJLACMT:177028615:8VSB:113:116:5
WJLATBD:177028615:8VSB:129:132:6
WUSA-HD:189028615:8VSB:49:52:1
LATV:189028615:8VSB:65:68:2
Justice:189028615:8VSB:81:84:3
WHUT HD:587028615:8VSB:49:52:1
WHUTKid:587028615:8VSB:65:68:2
ION:593028615:8VSB:49:52:3
qubo:593028615:8VSB:65:68:4
IONLife:593028615:8VSB:81:84:5
Shop:593028615:8VSB:97:100:6
HSN:593028615:8VSB:113:116:7
QVC:593028615:8VSB:129:132:8
WTTG-DT:605028615:8VSB:49:52:3
WDCA 20.1:605028615:8VSB:65:68:4
BUZZR 5.2:605028615:8VSB:81:84:5
ME TV 5.3:605028615:8VSB:97:100:6
MOVIES 20.2:605028615:8VSB:113:116:7
HEROES AND ICONS:605028615:8VSB:129:132:8
WRC-HD NBC 4 Washington:677028615:8VSB:49:52:3
COZI TV on WRC-TV:677028615:8VSB:65:68:4
WZDC   :677028615:8VSB:81:84:5
XITOS  :677028615:8VSB:97:100:6
{% endhighlight %}

The channels.conf file can be opened with VLC player to start watching television. However, our goal is to  multicast these channels over a network.

If you look closely at the channels.conf file, you will see that there are a bunch of different values. The first is the channel name, followed by the frequency, modulation, video PID, audio PID, and SID. You will notice that certain channels have the same frequency. If we pick the 177028615 frequency as an example, we can see four channels. Looking further down at 677028615 we can also see another four channels. Remember that the Hauppauge TV tuner has two adapters? This means that one adapter can be configured to sit on the 177028615 frequency and the other on 677028615. The end result is all eight channels can be transmitted to the multicast network.

[DVBlast](https://www.videolan.org/projects/dvblast.html) will be used to multicast the channels. We need to setup a [config file](https://github.com/gfto/dvblast/blob/master/README) containing the multicast groups. To transmit the eight channels on 177028615 and 677028615, two separate config files need to be created:

{% highlight bash %}
~]$ vi tuner0.conf
# Tuner 1 - Frequency 177028615
239.255.0.1:10000   1   3
239.255.0.2:10000   1   4
239.255.0.3:10000   1   5
239.255.0.4:10000   1   6
{% endhighlight %}

{% highlight bash %}
~]$ vi tuner1.conf
# Tuner 2 - Frequency 677028615
239.255.0.5:10000   1   3
239.255.0.6:10000   1   4
239.255.0.7:10000   1   5
239.255.0.8:10000   1   6
{% endhighlight %}

Run dvblast to multicast the channels out on the network

{% highlight bash %}
~]$ dvblast -a 0 -f 177028615 -c tuner0.conf -e -m VSB_8  &
~]$ dvblast -a 1 -f 677028615 -c tuner1.conf -e -m VSB_8 &
{% endhighlight %}

On another computer, use VLC Player to open one of the streams. On my Macbook Pro I do this through File > Open Network, then enter one of the multicast addresses (e.g. rtp://239.255.0.1:10000)

You can use something like minisapserver to broadcast the channels to VLC Player using SAP so you don't need to add enter the multicast addresses each time. I'll write about this at a later time.

## References
The videos and webpages below were essential references when getting this up and running:
1. [CWNE88 Youtube - Raspberry Pi Multicast TV server](https://www.youtube.com/watch?v=KI0LuIcFM98)
2. [Linux TV - Hauppauge WinTV dual HD](https://www.linuxtv.org/wiki/index.php/Hauppauge_WinTV-dualHD)
3. [DVBlast Config File](https://github.com/gfto/dvblast/blob/master/README)