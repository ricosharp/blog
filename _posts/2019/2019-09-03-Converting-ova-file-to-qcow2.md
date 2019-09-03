---
title: "Converting ova to qcow2"
excerpt: "How to convert an ova file to qcow2 for use with a KVM hypervisor"
---

There is no native way (that I know of anyway) to simply import an ova file directly into KVM. An ova file is basically an archive file that contains virtual machine information. We can extract the files from this archive and convert the vmdk disks into qcow2 format and import into KVM.

In this example I'm using the librenms virtual machine that can be downloaded [here](https://www.librenms.org/). LibreNMS is an open source network monitoring system and is worth checking out.

First extract the files from the ova file.

{% highlight bash %}
~]$ tar -xvf librenms-centos-7.6-x86_64.ova
{% endhighlight %}

The virtual disk extracted should be fairly obvious. It's the vmdk file called librenms-centos-7.6-x86_64-disk001.vmdk. All we need to do now is convert the vmdk file to qcow2 using qemu-img.

{% highlight bash %}
~]$ qemu-img convert librenms-centos-7.6-x86_64-disk001.vmdk librenms-centos-7.6-x86_64-disk001.qcow2 -O qcow2
{% endhighlight %}

You can verify the new format with the file command.
{% highlight bash %}
~]$ file librenms-centos-7.6-x86_64-disk001.qcow2
librenms-centos-7.6-x86_64-disk001.qcow2: QEMU QCOW Image (v3), 42949672960 bytes
{% endhighlight %}

Now the real test. Import the qcow2 file into KVM. First I will move the file into /var/lib/libvirt/images.

{% highlight bash %}
~]$ sudo mv librenms-centos-7.6-x86_64-disk001.qcow2 /var/lib/libvirt/images
{% endhighlight %}

I use virt-manager to manage my virtual machines. Create a new VM and select Import existing disk image. Select the qcow2 file and follow the rest of the prompts. The machine will start using the newly converted qcow2 disk image.

![KVM Import Disk]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/kvm-import-disk.png)

## References

- [LibreNMS](https://www.librenms.org/)

- [Converting OVA for use with KVM / QCOW2](http://edoceo.com/notabene/ova-to-vmdk-to-qcow2)