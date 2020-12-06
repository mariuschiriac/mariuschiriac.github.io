## Pattern explenation

### Intent

Evitare l'accoppiamento fra il mittente di una richiesta e il destinatario, consentendo che più di un singolo oggetto possa essaudire la richiesta. Concatenare gli oggetti destinatari e passare la richiesta di oggetto in oggetto finchè uno di questi non riesce ad esaudirla.

### Applications

- più di un oggetto può gestire una richiesta e l ricevente che la gestirà non è conosciuto a priori. Il ricevente dovrebbe essere scelto in modo automatico;
- si vuole passare una richiesta a uno dei molti oggetti, senza specificare esplicitamente il ricevente;
- l'insieme di oggetti che gestirà una richiesta deve essere definito dinamicamente.

### Actors

- **Handler**
  - Definisce un'interfaccia comune per gestire le richieste.
  - (Opzionale) implementa il link da seguire nella catena.
- **ConcreteHandler**
  - Gestisce le richieste di cui è responsabile
  - può accedere al proprio successore
  - se il _ConcreteHandler_ sa gestire una richiesta, lo fa; altrimenti passa la richiesta al suo successore
- **Client**
  - Invoca la richiesta su un _ConcreteHandler_ della catena.

### Schema

{{<img src="/images/design-patterns/chain_of_responsibility.gif" align="center">}}

### Execution

Il primo oggetto della catena riceve la richiesta e la gestisce direttamente, oppura la passa all'oggetto immediatamente seguente, che a sua volta si comporta nella stessa maniera. L'oggetto che ha dato inizio alla richiesta non sa esplicitamente chi la esaudirà.

{{<img src="/images/design-patterns/chain_of_responsibility2.jpg" align="center">}}

## Unity example

## Conclusion

Utilizzando questo pattern si hanno i seguenti vantaggi e svantaggi:

- **Accoppiamento ridotto**. L'uso di questo pattern fa si che un oggetto non abbia l'obbligo di sapere quali altri oggetti gestiranno una richiesta. Quindi si riducono le interconnessioni fra oggetti: invece che tutti i possibili destinatari della richiesta, si conosce solamente un successore
- **Maggiore flessibilità nell'assegnare responsabilità agli oggetti**. è possibile aggiungere o modificare le responsabilità per la gestione di una richiesta aggiungendo o cambiando ordine agli elementi
- **Il destinatario non è garantito**. La richiesta può arrivare fino alla fine della catena senza essere mai gestita.
