---
title: "Migrating a UniFi access point to a new controller"
excerpt: "How to migrate an existing access point to a new UniFi controller."
---

If you have an access point that is already tied to an existing UniFi controller, you can migrate it to a new one without having to physically touch the device.

I needed to do this in the past to move a bunch of access points from a failing [Cloud Key](https://www.ubnt.com/unifi/unifi-cloud-key/), and onto a new controller running on a virtual machine.

You will need the following:
* IP address of the access point.
* Superadmin login of the previous controller.

SSH to the access point. Here you will need to use the superadmin login of the previous controller. Next, note down the MAC address by doing an ifconfig. Then finally, reset the access point to its factory defaults.

{% highlight bash %}
~]$ ssh ip-or-hostname-of-access-point
~]$ ifconfig
~]$ syswrapper.sh restore-default
{% endhighlight %}

The access point can take about a minute to reset. Ping it until you receive a reply, so you know when it is ready to be adopted by the new controller.

Now tell the access point to talk to the new controller by invoking the set-inform command.
{% highlight bash %}
~]$ ssh ip-or-hostname-of-access-point
~]$ set-inform http://ip-address-or-hostname-of-new-controller:8080/inform
{% endhighlight %}

Open a browser and go to *http://ip-address-or-hostname-of-new-controller:8080*

Login, go to Devices, then click Adopt on the access point.

The access point will now be managed by the new controller.


## Notes

A little bit of test content.

The last time I did this, the access points did not adopt straight away. They would go through the process of adopting, then after five minutes, the status would still say adopting. In this case I had to run the set-inform command again on the access point, then I had the option to adopt again on the controller. The second time around seemed to work.

You can view the logs on the access point with the following commands:

{% highlight bash %}
~]$ tail /var/log/messages
OR
~]$ less /var/log/messages
{% endhighlight %}

If you do not have a static IP reservation in DHCP, then the [Ubiquiti Device Discover Tool](https://chrome.google.com/webstore/detail/ubiquiti-device-discovery/hmpigflbjeapnknladcfphgkemopofig?hl=en) for Chrome is quite useful for finding the device. You must be on the same LAN as the access point to use this. Run a scan and find the IP address that corresponds to the MAC address from the ifconfig before. You can even use this tool to run the set-inform.
