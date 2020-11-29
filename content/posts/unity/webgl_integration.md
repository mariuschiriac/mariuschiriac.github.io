---
title: 'Integration of javascript in Unity WEBGL build'
date: 2020-11-29T10:15:55+06:00
menu:
  sidebar:
    name: javascript in WEBGL build
    identifier: webgl_javascript
    parent: unity
    weight: 10
---

In this guide we will see how to integrate javascript functions in unity game with WEBGL build

---

## Workflow

1. from unity script call a plugin that comunicate to the script where the build is placed
2. the plugin function have only the work to call a javascript function of site environment
3. change the javascript function without rebuilding everytime

## Create the plugin

_plugin.jslib_

```
var plugin = {
    CallFunction: function()
    {
        CustomFunction();
    }
};

mergeInto(LibraryManager.library, plugin);
```

You can change the function caller to handle parameters.
Simple numeric types can be passed to JavaScript in function parameters without requiring any conversion. Other data types will be passed as a pointer in the emscripten heap (which is really just a big array in JavaScript). For strings, you can use the **Pointer_stringify** helper function to convert to a JavaScript string.
Insert _plugin.jslib_ file in unity assets folder.

_NewBehaviourScript.cs_

```
using UnityEngine;
using System.Runtime.InteropServices;

public class NewBehaviourScript : MonoBehaviour {

    [DllImport("__Internal")]
    private static extern void CallFunction();

    void Start() {
        CallFunction();
    }
}
```

In that script we simply call a javascript function without a user input.

```
<script type="text/javascript">
  window.CustomFunction = function(){ window.alert('It is working!!'); };
</script>
```

In the index.html of the webgl build output, add the javascript function that will be triggered by unity.

## Integrate user actions

When we try to open a new window (using window.open) from our custom javascript function the user will be notified, because it's a restricted function. We can bypass that using a user input on unity that trigger the javascript function, that function have to create a listener on other input action to open the window.

### use case:

1. the user click on unity gameobject
2. onmousedown event c# will call the javascript function throght jslib plugin
3. the javascript function create a listener on onmouseup event
4. when the user ends the click it trigger our function as user interaction, and the code will have the privilege to open new window without asks to user.

### The code

modify _plugin.jslib_ to pass the URL

```
var plugin = {
    CallFunction: function()
    {
        CustomFunction();
    },
    callOpenWindow: function(link){
        customFunction(Pointer_stringify(link));
    }
};

mergeInto(LibraryManager.library, plugin);
```

add the unity handler for onmousedown to attach at the object to be clicked

_PressHandler.cs_

```
using UnityEngine;
using UnityEngine.EventSystems;
using System;
using UnityEngine.Events;

public class PressHandler : MonoBehaviour, IPointerDownHandler
{
 [Serializable]
 public class ButtonPressEvent : UnityEvent { }

 public ButtonPressEvent OnPress = new ButtonPressEvent();

 public void OnPointerDown(PointerEventData eventData)
 {
  OnPress.Invoke();
 }
}
```

create the method to be attached at PressHandler.OnPointerDown

_NewBehaviourScript.cs_

```
using UnityEngine;
using System.Runtime.InteropServices;

public class NewBehaviourScript : MonoBehaviour {

    [DllImport("__Internal")]
    private static extern void CallFunction();
    [DllImport("__Internal")]
    private static extern void CallOpenWindow(string str);

    void Start() {
        CallFunction();
    }

    void Link(){
      CallOpenWindow("www.google.com");
    }
}
```

and that's all.
