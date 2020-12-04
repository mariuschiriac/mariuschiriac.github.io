---
title: 'Commmand Pattern'
date: 2020-12-03T06:15:55+00:00
menu:
  sidebar:
    name: Command
    identifier: unity-design-patterns-command
    parent: unity-design-patterns
    weight: 10
---

In this guide we will see how to integrate javascript functions in unity game with WEBGL build

---

## Pattern explenation

### Intent

Encapsulate a request as an object, thereby letting you parametrize clients with different requests, queue or log requests, and support undoable operations.

### What it solve

Need to issue requests to objects without knowing anything about the operation being requested or the receiver of the request.

### Applications

- To parameterize objects with respect to an action to be performed
- To specify, queue and execute requests at different times
- To allow the cancellation of operations
- To organize a system into high-level operations which are themselves based on primitive operations

### Actors

- **Command**
  - Specifies an interface for performing a generic operation
- **ConcreteCommand**
  - Defines a link between a target object and an action
  - Implement the _Execute_ method by invoking the corresponding method (s) on the _Receiver_
  - Keeps the data of the action
- **Client**
  - Create a concrete instance of _Command_ and set its _Receiver_
- **Invoker**
  - Asks _Command_ to complete the request
  - Keeps the history of _ConcreteCommand_ used
- **Receiver**
  - Knows the way to perform the operations associated with a request. Any class can be seen as _Receiver_

### Schema

{{<img src="/images/design-patterns/command.gif" align="center">}}

### Execution

1. Client _aClient_ creates an _aCCommand_ object and specifies its recipient _aReceiver_
2. An _aInvoker_ object stores the _aCCommand_ object
3. _aInvoker_ forwards a request by calling the _Execute_ method on the _aCCommand_ command. If the commands support canceling,
   _aCCommand_ saves the state necessary to cancel the command before invoking _Execute_
4. The _aCCommand_ object invokes the operations necessary to perform the command on the _aReceiver_ recipient

The following diagram shows the interactions between these objects. Illustrates how the Command Pattern decouples the sender of a request from the recipient and the request itself.

{{<img src="/images/design-patterns/command2.jpg" align="center">}}

## Unity example

{{<img width="100%" src="/images/design-patterns/command3.gif" align="center">}}

In this example we will see

### Command Class

_Command.cs_

```
public abstract class Command
{
    public abstract void Execute();
    public abstract void UnExecute();
}
```

### ConcreteCommand Class

_MoveCommand.cs_

```
using UnityEngine;

// A basic enum to describe our movement
public enum MoveDirection { up, down, left, right };

class MoveCommand : Command
{
    private MoveDirection _direction;
    private MoveReceiver _receiver;
    private float _distance;
    private GameObject _gameObject;


    //Constructor
    public MoveCommand(MoveReceiver reciever, MoveDirection direction, float distance, GameObject gameObjectToMove)
    {
        this._receiver = reciever;
        this._direction = direction;
        this._distance = distance;
        this._gameObject = gameObjectToMove;
    }


    //Execute new command
    public override void Execute()
    {
        _receiver.MoveOperation(_gameObject, _direction, _distance);
    }


    //Undo last command
    public override void UnExecute()
    {
        _receiver.MoveOperation(_gameObject, InverseDirection(_direction), _distance);
    }


    //invert the direction for undo
    private MoveDirection InverseDirection(MoveDirection direction)
    {
        switch (direction)
        {
            case MoveDirection.up:
                return MoveDirection.down;
            case MoveDirection.down:
                return MoveDirection.up;
            case MoveDirection.left:
                return MoveDirection.right;
            case MoveDirection.right:
                return MoveDirection.left;
            default:
                Debug.LogError("Unknown MoveDirection");
                return MoveDirection.up;
        }
    }


    //So we can show this command in debug output easily
    public override string ToString()
    {
        return "MoveCommand : " + MoveDirectionString(_direction) + " : " + _distance.ToString();
    }


    //Convert the MoveDirection enum to a string for debug
    public string MoveDirectionString(MoveDirection direction)
    {
        switch (direction)
        {
            case MoveDirection.up:
                return "up";
            case MoveDirection.down:
                return "down";
            case MoveDirection.left:
                return "left";
            case MoveDirection.right:
                return "right";
            default:
                return "unkown";
        }
    }
}
```

_ChangeColorCommand.cs_

```
using UnityEngine;

class ChangeColorCommand : Command
{
    private Color _color;
    private Color _previousColor;
    private ChangeColorReceiver _receiver;
    private SpriteRenderer _sr;

    //Constructor
    public ChangeColorCommand(ChangeColorReceiver reciever, Color color, GameObject gameObjectTarget)
    {
        this._receiver = reciever;
        this._color = color;
        this._sr = gameObjectTarget.GetComponent<SpriteRenderer>();
        this._previousColor = _sr.color;
    }

    //Execute new command
    public override void Execute()
    {
        _receiver.Execute(_sr, _color);
    }

    //Undo last command
    public override void UnExecute()
    {
        _receiver.Execute(_sr, _previousColor);
    }

    //So we can show this command in debug output easily
    public override string ToString()
    {
        return "ChangeColorCommand : from " +getColorName(_previousColor) + " to " + getColorName(_color);
    }

    private string getColorName(Color c)
    {
        string result = "unknown";
        result = c.r > 0.8f ? "red" : result;
        result = c.b > 0.8f ? "blue" : result;
        result = c.g > 0.8f ? "green" : result;
        return result;
    }

}
```

### Receiver Class

_MoveReceiver.cs_

```
using UnityEngine;

class MoveReceiver
{
    public void MoveOperation(GameObject gameObjectToMove, MoveDirection direction, float distance)
    {
        switch (direction)
        {
            case MoveDirection.up:
                MoveY(gameObjectToMove, distance);
                break;
            case MoveDirection.down:
                MoveY(gameObjectToMove, -distance);
                break;
            case MoveDirection.left:
                MoveX(gameObjectToMove, -distance);
                break;
            case MoveDirection.right:
                MoveX(gameObjectToMove, distance);
                break;
        }
    }

    private void MoveY(GameObject gameObjectToMove, float distance)
    {
        Vector3 newPos = gameObjectToMove.transform.position;
        newPos.y += distance;
        gameObjectToMove.transform.position = newPos;
    }

    private void MoveX(GameObject gameObjectToMove, float distance)
    {
        Vector3 newPos = gameObjectToMove.transform.position;
        newPos.x += distance;
        gameObjectToMove.transform.position = newPos;
    }
}
```

_ChangeColorReceiver.cs_

```
using UnityEngine;

public class ChangeColorReceiver
{
    public void Execute(SpriteRenderer sr, Color color)
    {
        sr.color = color;
    }
}
```

### Invoker and Client Class

In Unity it's easily to implement both invoker and client job on the same class. Because the Invoker needs the ConcreteCommands created by Client.
In the following code we will have:

**Client job**

- creates Receivers
- creates and configures concrete command objects

**Invoker job**

- call the execution of commands (Move, ChangeColor, Undo and Redo)
- saving the history of commands and in what position you are in the history

_InputHandler.cs_

```
using UnityEngine;
using System.Collections.Generic;

public class InputHandler : MonoBehaviour
{
    public float moveDistance = 10f;
    public GameObject objectTarget;

    private MoveReceiver moveReceiver;
    private ChangeColorReceiver changeColorReceiver;
    private List<Command> commands = new List<Command>();
    private int currentCommandNum = 0;

    void Start()
    {
        moveReceiver = new MoveReceiver();
        changeColorReceiver = new ChangeColorReceiver();

        if (objectTarget == null)
        {
            Debug.LogError("objectTarget must be assigned via inspector");
            this.enabled = false;
        }
    }


    public void Undo()
    {
        if (currentCommandNum > 0)
        {
            currentCommandNum--;
            Command Command = commands[currentCommandNum];
            Command.UnExecute();
        }
    }

    public void Redo()
    {
        if (currentCommandNum < commands.Count)
        {
            Command Command = commands[currentCommandNum];
            currentCommandNum++;
            Command.Execute();
        }
    }

    private void InsertCommand(Command command)
    {
        commands.Insert(currentCommandNum++, command);
    }

    private void Move(MoveDirection direction)
    {
        Command command = new MoveCommand(moveReceiver, direction, moveDistance, objectTarget);
        command.Execute();
        InsertCommand(command);
    }

    private void ChangeColor(Color color)
    {
        Command command = new ChangeColorCommand(changeColorReceiver, color, objectTarget);
        command.Execute();
        InsertCommand(command);
    }


    //Simple move commands to attach to UI buttons
    public void MoveUp() { Move(MoveDirection.up); }
    public void MoveDown() { Move(MoveDirection.down); }
    public void MoveLeft() { Move(MoveDirection.left); }
    public void MoveRight() { Move(MoveDirection.right); }

    public void Blue() { ChangeColor(Color.blue); }
    public void Red() { ChangeColor(Color.red); }
    public void Green() { ChangeColor(Color.green); }

    //Shows what's going on in the command list
    void OnGUI()
    {
        string label = "   start";
        if (currentCommandNum == 0)
        {
            label = ">" + label;
        }
        label += "\n";

        for (int i = 0; i < commands.Count; i++)
        {
            if (i == currentCommandNum - 1)
                label += "> " + commands[i].ToString() + "\n";
            else
                label += "   " + commands[i].ToString() + "\n";

        }
        GUI.Label(new Rect(0, 0, 400, 800), label);
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.UpArrow))
        {
            MoveUp();
        }
        if (Input.GetKeyDown(KeyCode.DownArrow))
        {
            MoveDown();
        }
        if (Input.GetKeyDown(KeyCode.LeftArrow))
        {
            MoveLeft();
        }
        if (Input.GetKeyDown(KeyCode.RightArrow))
        {
            MoveRight();
        }
        if (Input.GetKeyDown(KeyCode.R))
        {
            Redo();
        }
        if (Input.GetKeyDown(KeyCode.U))
        {
            Undo();
        }
    }
}
```

## Conclusion

After the first implementation of Command Pattern it's easy to add new Behaviour by creating new ConcreteCommand and Receiver classes without changing the rest of the code.
