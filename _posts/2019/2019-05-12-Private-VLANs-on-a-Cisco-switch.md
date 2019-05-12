---
title: "Private VLAN's on a Cisco switch"
excerpt: "How to configure Private VLAN's on a Cisco switch"
---

All hosts in an a broadcast domain can communicate with each other. For example, Figure 1 below shows 5 PC's connected to a single switch, each configured with an IP address on the same subnet. If PC-1 was to ping PC-5, it will send an ARP request first, flooding the network and reaching all hosts. PC-5 will respond with an ARP reply and ICMP traffic will then be able to flow between hosts.

![Private VLAN Topology]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/private-vlans.png)
*Figure 1: Private VLAN topology*

But what if we wanted to stop PC-1 from communicating with PC-5, without creating additional subnets? Private VLANs can be set up for this purpose. When configured correctly, a private VLAN can segregate a VLAN so that some hosts can communicate with each other, whilst others cannot, even though all hosts are on same subnet sharing the same gateway.

When configuring private VLAN's, a primary VLAN is configured first. Secondary VLAN's are then associated with it.

Each secondary VLAN can be set up as community VLAN, or an isolated VLAN. In a community VLAN, all hosts in that community VLAN can communicate with each other. Hosts in an isolated VLAN cannot communicate with any other host.

The only exception to this rule is when a port is set up in promiscuous mode. A host connected a promiscuous port can communicate with all secondary VLANs. This is mainly reserved for devices such as routers, which would be the gateway of all the clients.

## Configuration

In Figure 1, PC-1 and PC-2 are in a community VLAN, so both PC's can communicate with each other. They can also communicate with R1, because R1 is connected to a port in promiscous mode. However, they cannot communicate with any other host (PC-3, PC-4, PC-5).

PC-4 and PC-5 are also in a community VLAN, but a different one than that of PC-1 and PC-2. They too can communcate with R1 but not to any other host (PC-1, PC-2, PC-3).

PC-3 is in an isolated VLAN. It cannot communicate with any other host, except for R1.

### PC-1

{% highlight bash %}
ip 10.1.1.2 /24
save
{% endhighlight %}

### PC-2

{% highlight bash %}
ip 10.1.1.3 /24
save
{% endhighlight %}

### PC-3

{% highlight bash %}
ip 10.1.1.4 /24
save
{% endhighlight %}

### PC-4

{% highlight bash %}
ip 10.1.1.5 /24
save
{% endhighlight %}

### PC-5

{% highlight bash %}
ip 10.1.1.6 /24
save
{% endhighlight %}

### SW1

{% highlight bash %}
vlan 10
private-vlan community

vlan 20
private-vlan isolated

vlan 30
private-vlan community

vlan 100
private-vlan primary
private-vlan association 10,20,30

interface range g0/0-1
switchport mode private-vlan host
switchport private-vlan association host 100 10

interface g0/2
switchport mode private-vlan host
switchport private-vlan association host 100 20

interface range g0/3,g1/0
switchport mode private-vlan host
switchport private-vlan association host 100 30

interface g3/3
switchport mode private-vlan promiscuous
switchport private-vlan mapping 100 10,20,30

end

write memory
{% endhighlight %}

### R1

{% highlight bash %}
interface f0/0
ip address 10.1.1.1 255.255.255.0
no shutdown

end

write memory
{% endhighlight %}
