---
title: "Re-streaming video to a multicast address with VLC"
excerpt: "How to stream just about anything to a multicast address using VLC"
---

[VLC](https://www.videolan.org) is such a powerful tool. Excuse my ignorance but I have always seen it as just a media player that can play anything I throw at it. But it is capable of so much more!

Ever since coming across [dvblast](https://www.videolan.org/projects/dvblast.html), which turns out to be a VLC project, I’ve started asking myself how other content could be multicasted over an IP network. Take the [ABC News](https://www.abc.net.au/news/newschannel/) television stream from Australia as an example. Is it possible to re-stream this to a multicast group? The answer is yes and VLC is the tool to use.

## Find the stream link
The first thing to do is to find the streaming link. There are two ways to go about doing this; the easy way and the slightly more difficult way where you may have to get creative. However, the latter method is the one that will always yield a result.

First, open the source code of the page (In Chrome, CMD + OPTION U on a Mac, or CTRL + U on Windows and Linux). Search for “m3u8”. If something comes up then great! The ABC News stream happens to have this hidden in the source code. However, not all streaming sites will do this.

![ABC Stream URL]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/abc-stream-url.png)

My preference is to use this second method as the m3u8 file will often point to the specific stream quality. Rather than opening the source code, load the page and where possible, do not play the stream yet. Open the Developer Tools and click on the Network tab (In Chrome, CMD + OPTION + I on Mac, or CTRL + SHIFT + I on Windows and Linux). Here’s where you need to get a little creative and know what to look for. What I tend to do is press the clear button, quickly start and pause the stream and look for “index.m3u8” or “master.m3u8” files.

In the case of the ABC News Channel, the index.m3u8 file is actually loaded into the page before the video is played. If you mess around with changing the quality, you will find that the index_1.m3u8 file is the one that references the 576p quality stream. Right click on this, select copy and copy link address.

![Stream Developer Tools]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/stream-developer-tools.png)

Now that we have the stream URL you should test that this is in fact the network stream by using VLC. Go to Media, Open Network Stream, paste the URL and click Play. If your video starts, then you are good to go onto the next steps. Otherwise you will need to keep looking for the stream link.

## Streaming to multicast with VLC

This can be done in two ways - through the GUI or using the command line.

### GUI
I start the stream with the GUI so that I know the parameters to issue to the command line

- Media > Stream
- Click on the Network Tab (as you can see from the other tabs, VLC can also stream a file, disc, or capture device such as a TV tuner)
- Paste the URL and click Stream
- Click Next
- Select RTP/MPEG Transport Stream from the dropdown and click Add
- Enter your multicast address and port (e.g 239.255.0.1, 10000) and click Next
- Select your Transcoding Profile. I uncheck this as I don’t want to transcode into another format
- Make sure Stream all elementary streams is unchecked and click stream. Here you will notice that a generated stream output string is shown. This is very useful when writing out the command line version of this
![VLC Output String]({{ site.url }}{{ site.baseurl }}/assets/images/posts/2019/vlc-stream-output-string.png)

Your video will now be streaming to the multicast group you specified. You can open it in VLC on another computer through Media > Open Network Stream. Enter your multicast address (e.g. rtp://239.255.0.1:10000) and click play.

### Command Line

On a Linux machine, you can run VLC through the command line. This is useful if you want to run the stream from a central server that you will not be viewing the video from.

You can install vlc-nox which is basically VLC without the GUI. With a slight modification to the stream output string in the image above, we can run the same stream created through the GUI in the command line instead.

{% highlight bash %}
# Install VLC without a GUI
~]$ sudo apt install vlc-nox
# Send stream to multicast group
~]$ vlc <stream_url> '#rtp{dst=10.24.5.240,port=10000,mux=ts}' --no-sout-all --sout-keep
{% endhighlight %}

The video will now begin multicasting to your group. You can open it through Media > Open Network Stream. Enter your multicast address (e.g. rtp://239.255.0.1:10000) and click play.

## References
[VLC - Streaming HowTo/Advanced Streaming Using the Command Line](https://wiki.videolan.org/Documentation:Streaming_HowTo/Advanced_Streaming_Using_the_Command_Line/#rtp)









