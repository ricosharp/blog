---
title: "How to configure a static IP address with netplan on Ubuntu 18.04 Server"
excerpt: "This post will show you how to configure a static IP address with netplan on Ubuntu 18.04 Server"
---

I've only just begun using Ubuntu 18.04 server and one of the very first things I noticed was that network configuration is now done using netplan. I'm so used to doing the following:

{% highlight bash %}
~]$ sudo nano /etc/network/interfaces
auto ens3
iface ens3 inet static
    address 192.168.122.100
    netmask 255.255.255.0
    gateway 192.168.122.1
    dns-nameservers 8.8.8.8
~]$ sudo systemctl restart networking
{% endhighlight %}

To my surprise a message in /etc/network/interfaces says that ifupdown has been replaced by netplan. It turns out that although it's a new way of configuring network settings, it isn't all that hard.

First, issue these commands: 

{% highlight bash %}
~]$ sudo rm /etc/netplan/50-cloud-init.yaml
~]$ sudo nano /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
#Add this line:
network: {config: disabled}
{% endhighlight %}

All the above commands do are disable cloud-init's network configuration capabilities. If you reboot with the above configuration, you will have no network. To set a static IP address, create a new YAML file with the following:

{% highlight bash %}
~]$ sudo nano /etc/netplan/ens3.yaml
# Indents must be spaces when using YAML, not tabs.
network:
    version: 2
    ethernets:
        ens3:
            dhcp4: no
            addresses: [192.168.122.100/24]
            gateway4: 192.168.122.1
            nameservers:
                addresses: [8.8.8.8]
{% endhighlight %}

Now check the settings are ok in this file:
{% highlight bash %}
~]$ sudo netplan try
{% endhighlight %}
If everything is ok you have the option to immediately apply the settings by pressing Enter.

If you want to use a dynamic IP address instead, all you need to change in the above configuration is dhcp4: yes, then remove everything below it:

{% highlight bash %}
~]$ sudo nano /etc/netplan/ens3.yaml
# Indents must be spaces when using YAML, not tabs.
network:
    version: 2
    ethernets:
        ens3:
            dhcp4: no            
{% endhighlight %}

Again, check the settings are ok, then press Enter.
{% highlight bash %}
~]$ sudo netplan try
{% endhighlight %}

## References
[Netplan Examples](https://netplan.io/examples)