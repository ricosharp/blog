---
title: "Raspberry Pi Network Configuration"
excerpt: "How to configure various network settings on a Raspberry Pi"
---

## Join a wifi network
Configure settings to join a network:

{% highlight bash %}
~]$ sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
# Add these lines to the config file with the appropriate values:
network={
    ssid="Network_Name"
    psk="Network_Password"
}
{% endhighlight %}

Apply the settings:

{% highlight bash %}
~]$ wpa_cli -i wlan0 reconfigure
{% endhighlight %}

## Setting a static IP address
{% highlight bash %}
~]$ sudo nano /etc/dhcpcd.conf
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.0.1
static domain_name_servers=192.168.1.1
{% endhighlight %}

