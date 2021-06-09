---
title: Unity Timeline
date: 2021-06-09T06:15:55+00:00
menu:
  sidebar:
    name: Unity Timeline
    identifier: unity-timeline-base
    parent: unity-timeline
    weight: 12
---

Timeline is a powerfull unity tool that permit to create a temporal sequence of instructions.

---

## Create Timeline Asset

{{<img src="/images/unity/timeline/create.png" align="center">}}

In Project right click and select Create>Timeline

That operation create a ***.playable** file that represent a timeline asset.

### Timeline Tracks

<a href="https://docs.unity3d.com/Packages/com.unity.timeline@1.6/manual/trk_list_about.html" target="_blank">Here is the official doc about tracks</a>

{{<img src="/images/unity/timeline/track.png" align="center">}}

On the left side of a Timeline we can see which tracks are used. A **Track** is a type of clips and is shown in horizontal.
To add one Track just click the **+** button and choose the Track.

### Timeline Clips

{{<img src="/images/unity/timeline/clip.png" align="center">}}

The Clips holds the data and the behaviour to execute at specific time of the timeline.
Every different Track has different Clips.

One track could have more than one clip with the max of one per frame (or an interpolation beetwen 2)

### Problems

At low fps the timeline execution could lose some frame, so if we have very small ( less than 5 frame) clips, these could be jumped out.

<a href="https://forum.unity.com/threads/timeline-and-low-framerate.596887/" target="_blank">Forum talks</a>


## Conclusion

Timeline is a great tool for hardcode easily secuences of action.