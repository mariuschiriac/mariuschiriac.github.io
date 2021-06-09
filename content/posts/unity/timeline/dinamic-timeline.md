---
title: 'Change timeline dinamically'
date: 2020-12-03T06:15:55+00:00
menu:
  sidebar:
    name: Change timeline dinamically
    identifier: unity-timeline-dinamic-timeline
    parent: unity-timeline
    weight: 12
---

To achieve this result, we need a controller that hold the **PlayableDirector** and fill the current/correct value to the interested Timeline
before to play it. We will use custom **PlayableAsset** and **PlayableBehaviour** to add new behaviour into the Timeline

---

## Create Custom Timeline Track

{{<img src="/images/unity2/timeline.png" align="center">}}

Create the **TrackAsset** to create your custom line track in the timeline, so you will be able to right-click the left side timeline's panel to see the action "MovementTrack" or what else you named your TrackAsset. You can edit how clips works in this class overriding **CreateTrackMixer** method, but we don't need to do it because we will just write simple logic in the Clip itself.

_MovementTrack.cs_

```
using UnityEngine.Timeline;

[TrackClipType(typeof(MoveClip))]
[TrackClipType(typeof(LookAtClip))]
public class MovementTrack : TrackAsset
{

}
```
The TrackClipType specify which Clip will be held by the track


### Create Custom Timeline Clip

{{<img src="/images/unity2/move_clip.png" align="center">}}

In order to make a clip works we will use 2 classes: _MoveClip : PlayableAsset, ITimelineClipAsset_ and _MovePlayableBehaviour : PlayableBehaviour_.
The clip holds the data, while the playable behaviour will execute the logic.
Our controller will fill this clip.

_MoveClip.cs_

```
using Sirenix.OdinInspector;
using System;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.Timeline;

public class MoveClip : PlayableAsset, ITimelineClipAsset
{
  public MovePlayableBehaviour template = new MovePlayableBehaviour();

  [ShowIf("@!this.moveToOriginalPosition")]
  public bool moveToDestination;
  [ShowIf("@!this.moveToDestination")]
  public bool moveToOriginalPosition;
  public SourceType selectToMove;
  public AnimationCurve curve;
  [ShowIf("@this.moveToDestination")]
  public SourceType selectDestination;
  [ShowIf("@this.moveToDestination")]
  public bool copyDistance;
  [ShowIf("@this.moveToDestination && !this.copyDistance")]
  public float distanceToDestination;
  public Vector3 relativePosition;

  public GameObject GoToMove { set { _goToMove = value; } }
  public GameObject GoDestination { set { _goDestination = value; } }

  private GameObject _goToMove;
  private GameObject _goDestination;

  public ClipCaps clipCaps
  {
    get { return ClipCaps.Blending; }
  }
  public override Playable CreatePlayable(PlayableGraph graph, GameObject owner)
  {
    var playable = ScriptPlayable<MovePlayableBehaviour>.Create(graph, template);
    MovePlayableBehaviour clone = playable.GetBehaviour();
    clone.goToMove = _goToMove;
    clone.goDestination = _goDestination;
    clone.curve = curve;
    clone.relativePosition = relativePosition;
    clone.moveToDestination = moveToDestination;
    clone.distanceToDestination = distanceToDestination;
    clone.moveToOriginalPosition = moveToOriginalPosition;
    clone.copyDistance = copyDistance;
    return playable;
  }
}

```

The **CreatePlayable** method will pass the correct data to the behaviour at the start of the timeline.


_MovePlayableBehaviour.cs_

```
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public class MovePlayableBehaviour : PlayableBehaviour
{
  public bool moveToDestination;
  public bool moveToOriginalPosition;
  public GameObject goToMove;
  public GameObject goDestination;
  public bool copyDistance;
  public float distanceToDestination;
  public AnimationCurve curve;
  public Vector3 relativePosition;


  private Vector3 _startPos;
  private Vector3 _endPos;

  public override void OnGraphStart(Playable playable)
  {
  }

  public override void OnGraphStop(Playable playable)
  {
  }

  public override void OnBehaviourPlay(Playable playable, FrameData info)
  {
    if (goToMove == null) return;
    _startPos = goToMove.transform.position;
    _endPos = _startPos;
    if (moveToDestination)
    {
      if (copyDistance)
      {

        float distance = Mathf.Abs(goDestination.transform.position.x - _startPos.x) +
          Mathf.Abs(goDestination.transform.position.z - _startPos.z);
        _endPos = goDestination.transform.position + Vector3.forward * distance;
      }
      else
      {
        _endPos = goDestination.transform.position -
          (goDestination.transform.position - _startPos).normalized *
          distanceToDestination;
      }
    }
    if (moveToOriginalPosition)
    {
      Character character = goToMove.GetComponent<Character>();
      _endPos = character.CurrentTile.transform.position;
    }
    _endPos += relativePosition;
  }

  public override void OnBehaviourPause(Playable playable, FrameData info)
  {
  }

  public override void PrepareFrame(Playable playable, FrameData info)
  {
    if (goToMove == null) return;
    var currentTime = (float)playable.GetTime() / (float)playable.GetDuration();
    Vector3 currentPos = Vector3.Lerp(_startPos, _endPos, curve.Evaluate(currentTime));
    goToMove.transform.position = currentPos;
  }
}
```


### Create Controller

Controller's jobs:
- adjust timeline's clips values
- play the timeline

What the Controller needs to know:
- actors of the timeline (which gameobjects are involved in the timeline)
- when to play the timeline
- reference to **PlayableDirector**

```
using UnityEngine;
using UnityEngine.Playables;
using System.Linq;
using UnityEngine.Timeline;
using System;
using System.Collections.Generic;
using UnityEngine.Animations;
using UnityEngine.Audio;
using Cinemachine;
using System.Collections;

[RequireComponent(typeof(PlayableDirector))]
public class AbilityManagerDirector : MonoBehaviour
{
  public BattleUIController battleUIController;
  public Board board;

  public CinemachineVirtualCamera[] ultimateSkillCameras;
  public CinemachineVirtualCamera[] skillCameras;

  public PlayableAsset fadeIntoAnimationA;
  public PlayableAsset fadeIntoAnimationE;

  private PlayableDirector playableDirector;

  private SkillEffectData info;
  private float currentTimeScale;

  private void Awake()
  {
    playableDirector = gameObject.GetComponent<PlayableDirector>();
  }

  private void OnEnable()
  {
    AnimationCharacter.CastAbilityAnimationEvent += OnCastAbilityAnimationEvent;
  }

  private void OnDisable()
  {
    AnimationCharacter.CastAbilityAnimationEvent -= OnCastAbilityAnimationEvent;
  }

  public void OnEndTimelineSignal()
  {
    StartCoroutine(_OnEndTimelineSignal());
  }

  private IEnumerator _OnEndTimelineSignal()
  {
    yield return new WaitForFixedUpdate();
    Time.timeScale = currentTimeScale;
  }

  private void OnCastAbilityAnimationEvent(object sender, SkillEffectData e)
  {
    currentTimeScale = Time.timeScale;
    Time.timeScale = 1f;
    info = e;
    StartCoroutine(InitAnimation());
  }

  private IEnumerator InitAnimation()
  {
    CCameraController.Instance.GetActiveVC().Follow = null;
    // codice per usare la timeline di ingresso
    if (info.castAbilityData.hasCinematicView && !info.castAbilityData.isUlti)
    {
      playableDirector.playableAsset = info.attacker.GetComponent<Character>().partyIndex == 0 ? fadeIntoAnimationA : fadeIntoAnimationE;
      PrepareTimeline();
      playableDirector.Play();
      yield return new WaitForSeconds((float)playableDirector.playableAsset.duration * Time.timeScale);
    }
    playableDirector.playableAsset = info.timeline[info.timelineIndex];
    PrepareTimeline();
    playableDirector.Play();
    yield return new WaitForSeconds((float)playableDirector.playableAsset.duration * Time.timeScale);
  }

  private void PrepareTimeline()
  {
    //Animations
    foreach (PlayableBinding playableBinding in playableDirector.playableAsset.outputs.Where((p) => p.streamName == "Animation Track"))
    {
      Animator charAnim = info.attacker.GetComponent<Character>().animationUnit.animator;
      playableDirector.SetGenericBinding(playableBinding.sourceObject, charAnim);
    }
    
    //Signals
    foreach (PlayableBinding playableBinding in playableDirector.playableAsset.outputs.Where((p) => p.streamName == "Signal Track"))
    {
      playableDirector.SetGenericBinding(playableBinding.sourceObject, this);
    }

    //Cinemachine
    foreach (PlayableBinding playableBinding in playableDirector.playableAsset.outputs.Where((p) => p.streamName == "Cinemachine Track"))
    {
      playableDirector.SetGenericBinding(playableBinding.sourceObject, Camera.main.GetComponent<CinemachineBrain>());
      TimelineClip[] cinemachineClips = (playableBinding.sourceObject as CinemachineTrack).GetClips().OrderBy(c => c.start).ToArray();
      for (int i = 0; i < cinemachineClips.Length; i++)
      {
        CinemachineShot cinemachineShot = cinemachineClips[i].asset as CinemachineShot;
        if (info.castAbilityData.isUlti)
        {
          ultimateSkillCameras[i % 2 == 0 ? 1 : 0].LookAt = null;
          ultimateSkillCameras[i % 2 == 0 ? 1 : 0].Follow = null;
          playableDirector.SetReferenceValue(cinemachineShot.VirtualCamera.exposedName, ultimateSkillCameras[i % 2 == 0 ? 1 : 0]);
        }
        else
        {
          playableDirector.SetReferenceValue(cinemachineShot.VirtualCamera.exposedName, skillCameras[i % 2 == 0 ? 1 : 0]);
        }
      }
    }
    //Movement
    foreach (PlayableBinding playableBinding in playableDirector.playableAsset.outputs.Where(
      (p) => p.streamName == "Movement" || p.streamName == "Movement Track"))
    {
      TimelineClip[] movementClips = (playableBinding.sourceObject as TrackAsset).GetClips().ToArray();
      foreach (TimelineClip movementClip in movementClips)
      {
        switch (movementClip.displayName)
        {
          case "LookAtClip":
            LookAtClip lookAtClip = movementClip.asset as LookAtClip;
            lookAtClip.GoToRotate = null;
            lookAtClip.GoDestination = null;
            switch (lookAtClip.selectToRotate)
            {
              case SourceType.Attacker:
                lookAtClip.GoToRotate = info.attacker;
                break;
              case SourceType.TileTarget:
                Debug.LogError("Missing Code");
                break;
              case SourceType.FirstDefender:
                if (info.defenders != null && info.defenders.Length > 0)
                {
                  lookAtClip.GoToRotate = info.defenders[info.defenderIndex];
                }
                break;
              case SourceType.AllDefenders:
                Debug.LogError("Missing Code");
                break;
            }
            if (!lookAtClip.lookAtCamera)
            {
              switch (lookAtClip.selectDestination)
              {
                case SourceType.Attacker:
                  lookAtClip.GoDestination = info.attacker;
                  break;
                case SourceType.TileTarget:
                  lookAtClip.GoDestination = info.tileTarget;
                  break;
                case SourceType.FirstDefender:
                  if (info.defenders != null && info.defenders.Length > 0)
                  {
                    lookAtClip.GoDestination = info.defenders[info.defenderIndex];
                  }
                  break;
                case SourceType.AllDefenders:
                  Debug.LogError("Missing Code");
                  break;
              }
            }
            break;
          case "MoveClip":
            MoveClip moveClip = movementClip.asset as MoveClip;
            moveClip.GoToMove = null;
            moveClip.GoDestination = null;
            switch (moveClip.selectToMove)
            {
              case SourceType.Attacker:
                moveClip.GoToMove = info.attacker;
                break;
              case SourceType.TileTarget:
                Debug.LogError("Missing Code");
                break;
              case SourceType.FirstDefender:
                if (info.defenders != null && info.defenders.Length > 0)
                {
                  moveClip.GoToMove = info.defenders[info.defenderIndex];
                }
                break;
              case SourceType.AllDefenders:
                Debug.LogError("Missing Code");
                break;
            }
            if (moveClip.moveToDestination)
            {
              switch (moveClip.selectDestination)
              {
                case SourceType.Attacker:
                  moveClip.GoDestination = info.attacker;
                  break;
                case SourceType.TileTarget:
                  moveClip.GoDestination = info.tileTarget;
                  break;
                case SourceType.FirstDefender:
                  if (info.defenders != null && info.defenders.Length > 0)
                  {
                    moveClip.GoDestination = info.defenders[info.defenderIndex];
                  }
                  break;
                case SourceType.AllDefenders:
                  Debug.LogError("Missing Code");
                  break;
              }
            }
            break;
          default:
            break;
        }
      }
    }
  }
}

```


## Conclusion

