---
title: Concatenate Timeline
date: 2021-06-09T06:21:10+00:00
menu:
  sidebar:
    name: Concatenate Timeline
    identifier: unity-timeline-concatenate
    parent: unity-timeline
    weight: 12
---

Someway you will need split one timeline into multiple in order to execute different timeline variants with less assets on the bag.

---

### Coroutine that plays 2 timeline at correct time

```
playableDirector.playableAsset = info.timeline[0];
PrepareTimeline();
playableDirector.Play();
yield return new WaitForSeconds((float)playableDirector.playableAsset.duration * Time.timeScale);
playableDirector.playableAsset = info.timeline[1];
PrepareTimeline();
playableDirector.Play();
```

- **playableDirector** is the reference to the **PlayableDirector** unity component.
- **PrepareTimeline()** is a method that fill the timeline's clips with the instanced gameobjects.
- **playableDirector.playableAsset.duration** is the total duration of the current timeline in seconds

This code plays the second timeline just after the first is finished.

### Other way

Another way to achieve a similar result is to add a signal track to the Timeline asset with a signal in the frame we want to execute some code.

{{<img src="/images/unity/timeline/signal.png" align="center">}}

Add the Unity Component **SignalReceiver** to an object.

{{<img src="/images/unity/timeline/signal2.png" align="center">}}

In the PrepareTimeline method add the signal configuration to use instanced values.

```
foreach (PlayableBinding playableBinding in playableDirector.playableAsset.outputs.Where((p) => p.streamName == "Signal Track"))
  {
    playableDirector.SetGenericBinding(playableBinding.sourceObject, this);
  }
```

- **this** because I've added the SignalReceiver to the same gameobject and he is fine.

When the frame of the signal is passed (it will work even at low fps) the signal will notify the receiver that will execute all actions are listed.

### Add and Remove Listener to SignalReceiver

Here is an helper to subribe and unsubribe events to the SignalReceiver

```
using System;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Timeline;

[RequireComponent(typeof(SignalReceiver))]
public class SignalDispatcher : MonoBehaviour
{
  private static SignalDispatcher _instance;
  public static SignalDispatcher Instance
  {
    get { return _instance; }
  }

  public AbilityManagerDirector abilityManagerDirector;
  public DictionaryOfSignalTypeAndSignalAsset signals;
  private SignalReceiver signalReceiver;
  private void Awake()
  {
    if (_instance != null)
    {
      Destroy(this);
    }
    _instance = this;
    signalReceiver = gameObject.GetComponent<SignalReceiver>();
  }

  private void OnEnable()
  {

    UnityEvent unityEvent = signalReceiver.GetReaction(signals[SignalType.EndTimeline]);
    if (unityEvent == null)
    {
      unityEvent = new UnityEvent();
      signalReceiver.AddReaction(signals[SignalType.EndTimeline], unityEvent);
    }
    unityEvent.AddListener(abilityManagerDirector.OnEndTimelineSignal);
  }

  private void OnDisable()
  {
    UnityEvent unityEvent = signalReceiver.GetReaction(signals[SignalType.EndTimeline]);
    if (unityEvent == null)
    {
      return;
    }
    unityEvent.RemoveListener(abilityManagerDirector.OnEndTimelineSignal);
  }

  public void Subscribe(SignalType type, AnimationUnit animU)
  {
    UnityEvent unityEvent = signalReceiver.GetReaction(signals[type]);
    if(unityEvent == null)
    {
      unityEvent = new UnityEvent();
      signalReceiver.AddReaction(signals[type], unityEvent);
    }
    switch (type)
    {
      case SignalType.GetHit:
        unityEvent.AddListener(animU.OnGetHitAnimation);
        break;
      case SignalType.EndTimeline:
        unityEvent.AddListener(animU.OnEndTimeline);
        break;
      case SignalType.GoNextTimeline:
        unityEvent.AddListener(animU.OnGoNextTimeline);
        break;
      case SignalType.Die:
        unityEvent.AddListener(animU.OnDieSignal);
        break;
    }
  }

  public void UnSubscribe(SignalType type, AnimationUnit animU)
  {
    UnityEvent unityEvent = signalReceiver.GetReaction(signals[type]);
    if (unityEvent == null)
    {
      return;
    }
    switch (type)
    {
      case SignalType.GetHit:
        unityEvent.RemoveListener(animU.OnGetHitAnimation);
        break;
      case SignalType.EndTimeline:
        unityEvent.RemoveListener(animU.OnEndTimeline);
        break;
      case SignalType.GoNextTimeline:
        unityEvent.RemoveListener(animU.OnGoNextTimeline);
        break;
      case SignalType.Die:
        unityEvent.RemoveListener(animU.OnDieSignal);
        break;
    }
  }
}

[Serializable]
public class DictionaryOfSignalTypeAndSignalAsset : SerializableDictionary<SignalType, SignalAsset> { }

public enum SignalType
{
  GetHit,
  EndTimeline,
  GoNextTimeline,
  Die
}

```

- DictionaryOfSignalTypeAndSignalAsset is a dictionary to match the timeline's signal with my custom enum
- this class is a Singleton 
- animU.OnGetHitAnimation and others are method without parameters
- to use this class just call the Subribe method.

## Conclusion

playableAsset.duration is the key to concatenate multiple timelines properly.