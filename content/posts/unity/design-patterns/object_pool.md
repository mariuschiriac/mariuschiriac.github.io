---
title: 'Object Pool Pattern'
date: 2020-12-03T06:15:55+00:00
menu:
  sidebar:
    name: Object Pool
    identifier: unity-design-patterns-object_pool
    parent: unity-design-patterns
    weight: 12
---

Behavioural Pattern.

---

## Pattern explenation

### Intent

Improve performance and memory use by reusing objects from a fixed pool instead of allocating and freeing them individually.

### What it solve

Management of list of the same object type

### Applications

- To frequently create and destroy objects.
- Objects are similar in size.
- Allocating objects on the heap is slow or could lead to memory fragmentation.
- Each object encapsulates a resource such as a database or network connection that is expensive to acquire and could be reused.

### Actors

- **ObjectPool**
  - Create the object
  - Store the objects that are ready to be reused
- **PooledObject**
  - Notify _ObjectPool_ about it's status (is ready to be reused)
- **Client**
  - Asks to _ObjectPool_ the objects he need

### Schema

{{<img src="/images/design-patterns/object_pool.jpg" align="center">}}

## Unity example

{{<img width="100%" src="/images/design-patterns/object_pool.gif" align="center">}}

### Client

_Player.cs_

```
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{
    public ObjectPool myPool;

    void Start()
    {
        StartCoroutine(Firing());
    }

    IEnumerator Firing()
    {
        while (true)
        {
            GameObject go = myPool.TakeObject();
            go.transform.position = transform.position;
            yield return new WaitForSeconds(1f);
        }
    }
}
```

### ObjectPool

_ObjectPool.cs_

```
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool : MonoBehaviour
{
    public Stack<PooledObject> pool;
    public GameObject prefab;

    private void Awake()
    {
        pool = new Stack<PooledObject>();
    }

    public GameObject TakeObject()
    {
        GameObject go;
        if(pool.Count == 0)
        {
            go = Instantiate(prefab, transform);
            PooledObject pooledObject = go.GetComponent<PooledObject>();
            pooledObject.Init(this);
        }
        else
        {
            go = pool.Pop().gameObject;
        }
        go.SetActive(true);
        return go;
    }

    public void GiveObject(PooledObject pooledObject)
    {
        pool.Push(pooledObject);
    }
}
```

### PooledObject

_PooledObject.cs_

```
using UnityEngine;

public class PooledObject : MonoBehaviour
{
    private ObjectPool pool;
    public void Init(ObjectPool pool)
    {
        this.pool = pool;
    }

    private void OnDisable()
    {
        pool.GiveObject(this);
    }
}
```

_Projectile.cs_

```
using UnityEngine;

public class Projectile : PooledObject
{

    void Update()
    {
        transform.position += Vector3.right * 2 * Time.deltaTime;
    }

    private void OnTriggerEnter(Collider other)
    {
        gameObject.SetActive(false);
    }
}
```

## Conclusion

Object Pool Pattern is always good to use when you need to spawn the same object multiple times (like projectiles) and it's very easy to implement and it works well decoupled so don't worry in big projects too!!
