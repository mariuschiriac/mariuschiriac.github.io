---
title: 'Component Pattern'
date: 2020-12-03T06:15:55+00:00
menu:
  sidebar:
    name: Component
    identifier: unity-design-patterns-component
    parent: unity-design-patterns
    weight: 14
---

Game Programming Pattern.

---

## Pattern explenation

### Intent

Allow a single entity to span multiple domains without coupling the domains to each other

### What it solve

The creation of big classes that are hard to mantain.

### Applications

- You have a class that touches multiple domains which you want to keep decoupled from each other.
- A class is getting massive and hard to work with
- You want to be able to define a variety of objects that share different capabilities, but using inheritance doesn’t let you pick the parts you want to reuse precisely enough.

### Actors

- **Abstract Component**
  - Specifies an interface for performing a generic operation
- **Concrete Component**
  - Takes a specific job to be done
- **Handler**
  - uses the concrete component to delegate its jobs

### Schema

{{<img src="/images/design-patterns/component.jpg" align="center">}}

## Unity example

In this example we will see

## Abstract Component

this class is used from the GameObjectAggregate to manage easily the list of it's components

```
    interface BaseComponent
    {
        void Update(RPGGame game);
    }
```

### Handler Class

Here is the creation and handling of the needed components

```
public class GameObjectAggregate : MonoBehaviour
    {
        public int velocity;
        public int x = 0, y = 0;

        public WorldX worldX = new WorldX();
        public GraphicsX graphicsX = new GraphicsX();

        private InputComponent inputComponent;
        private PhysicsComponent physicsComponent;
        private GraphicsComponent graphicsComponent;

        public List<BaseComponent> ComponentList = new List<BaseComponent>();

        int componentAmount = -1;


        private void Start()
        {
            inputComponent = new PlayerInputComponent();
            physicsComponent = new PlayerPhysicsComponent();
            graphicsComponent = new PlayerGraphicsComponent();

            ComponentList.Add(inputComponent);
            ComponentList.Add(physicsComponent);
            ComponentList.Add(graphicsComponent);

            Debug.Log("Game Components Initialization Finish...");
            Debug.Log("Please enter LeftArrow or RightArrow button to play...");
        }

        private void Update()
        {
            if (ComponentList == null)
            {
                return;
            }
            componentAmount = ComponentList.Count;
            for (int i = 0; i < componentAmount; i++)
            {
                ComponentList[i].Update(this);
            }
        }
    }

```

## Concrete Component Classes

These classes do the specifics job

```
    class PlayerInputComponent : BaseComponent
    {
        public void Update(RPGGame game)
        {
            if (Input.GetKeyDown(KeyCode.LeftArrow))
            {
                game.velocity -= WALK_ACCELERATION;
                Debug.Log(" game velocity= " + game.velocity.ToString());
            }
            if (Input.GetKeyDown(KeyCode.RightArrow))
            {
                game.velocity += WALK_ACCELERATION;
                Debug.Log(" game velocity= " + game.velocity.ToString());
            }
        }
        private int WALK_ACCELERATION = 1;
    }

    class PlayerPhysicsComponent : BaseComponent
    {
        public void Update(RPGGame game)
        {
            game.x += game.velocity;

            //Handle Physics...

        }
    }

    class PlayerGraphicsComponent : BaseComponent
    {
        public void Update(RPGGame game)
        {
            //Handle Graphics...

            if (game == null || game.graphicsX == null)
            {
                return;
            }

            Sprite sprite = spriteStand;
            if (game.velocity < 0)
            {
                sprite = spriteWalkLeft;
            }
            else if (game.velocity > 0)
            {
                sprite = spriteWalkRight;
            }
            game.graphicsX.Draw(sprite, game.x, game.y);
        }

        private Sprite spriteStand;
        private Sprite spriteWalkLeft;
        private Sprite spriteWalkRight;
    }
```

## Conclusion

The Component pattern adds a good bit of complexity over simply making a class and putting code in it. Each conceptual “object” becomes a cluster of objects that must be instantiated, initialized, and correctly wired together. Communication between the different components becomes more challenging, and controlling how they occupy memory is more complex.

For a large codebase, this complexity may be worth it for the decoupling and code reuse it enables, but take care to ensure you aren’t over-engineering a “solution” to a non-existent problem before applying this pattern.
