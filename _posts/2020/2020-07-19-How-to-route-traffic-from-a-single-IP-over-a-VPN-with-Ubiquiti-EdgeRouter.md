---
title: "How to route traffic from a single IP over a VPN with Ubiquiti EdgeRouter"
excerpt: "How to route all traffic from a single IP over a PPTP-VPN with Ubiqitui EdgeRouter"
---

This post will show you how to route all traffic from a particular IP address over a PPTP VPN using a Ubiqitui EdgeRouter. I wanted to do this with a host on my network that pulls video streams which would otherwise be geo-blocked using my public ip address. The below configuration is more specific to my lab environment but can be tweaked to be used in any situation. It can also be changed to allow for an entire subnet to be tunneled over the VPN.

In this example I am using an EdgeRouter PoE 5 port router. The configuration will be quite similar across any EdgeRouter product.


First SSH into your EdgeRouter and configure the VPN client interface. Here I am using PPTP as the VPN protocol. It is widely documented as an insecure protocol but will work fine for the purpose of "faking" my IP address.
{% highlight bash %}
configure
set interfaces pptp-client pptpc0
set interfaces pptp-client pptpc0 description <Enter Some Description Here e.g. VPN to <Country>>
set interfaces pptp-client pptpc0 server-ip <Hostname or Server IP of VPN>
set interfaces pptp-client pptpc0 user-id <VPN Username>
set interfaces pptp-client pptpc0 password <VPN Password>
set interfaces pptp-client pptpc0 require-mppe
set interfaces pptp-client pptpc0 default-route none
{% endhighlight %}

Save the configuration and check to see if your VPN connects. You can do this by looking in the routing table to see if it is connected.
{% highlight bash %}
commit;save
exit
show ip route
{% endhighlight %}


Next, create another routing table which will be used when incoming traffic matches the IP we want sent across the VPN.
{% highlight bash %}
set protocols static table 1 interface-route 0.0.0.0/0 next-hop-interface pptpc0
{% endhighlight %}


Now for the following rules, be careful not to overwrite any existing ones in your own configuration. The rule numbers below are specific to my environment.

Here I am setting a wifi and server network to use the main routing table (rules 10 and 20). This rule does not route over the VPN.

Rule 30 defines the host IP that I want to route over the VPN and sets it to use the routing table that was created above. Basically it is saying if the source address is 10.13.12.1, use table 1 which routes all traffic over pptpc0 (the VPN interface).

Rule 5011 then applies some NAT to traffic going out of the pptpc0 interface before we finally apply the rules to anything that comes in the switch0 interface.

{% highlight bash %}
set firewall group network-group servers network 10.24.5.0/24
set firewall group network-group wifi network 10.17.9.0/24
set firewall modify PBR rule 10 destination group network-group servers
set firewall modify PBR rule 20 destination group network-group wifi
set firewall modify PBR rule 10 modify table main
set firewall modify PBR rule 20 modify table main

set firewall modify PBR rule 30 source address 10.13.12.1
set firewall modify PBR rule 30 modify table 1

set service nat rule 5011 outbound-interface pptpc0
set service nat rule 5011 type masquerade
set service nat rule 5011 description "masquerade for VPN"
{% endhighlight %}

{% highlight bash %}
set interfaces switch switch0 firewall in modify PBR
{% endhighlight %}

You can then verify IP addresses coming.
{% highlight bash %}
curl http://icanhazip.com
{% endhighlight %}