## Spiegazione del Pattern

### Scopo

Incapsula una richiesta in un oggetto, consentendo di parametrizzare i clientcon richieste diverse, accodare o mantenere uno storico delle richieste e gestire richieste cancellabili

### Cosa risolve

Il bisogno di inviare richieste a oggetti senza conoscere nulla riguardo all'operazione che è stata richiesta o chi la riceve.

### Applicabilità

- Per parametrizzare gli oggetti rispetto a un'azione da compiere
- Per specificare, accodare ed eseguire le richieste in tempi diversi
- Per consentire l'annullamento di operazioni
- Per organizzare un sistema in operazioni d'alto livello a loro volta basate su operazioni primitive

### Partecipanti

- **Command**
  - Specifica un'interfaccia per l'esecuzione di un'operazione generica
- **ConcreteCommand**
  - Definisce un legame fra un oggetto destinatario e un'azione
  - Implementa il metodo _Execute_ invocando il metodo (i metodi) corrispondente sul _Receiver_
- **Client**
  - Crea un'istanza concreta di _Command_ e ne imposta il _Receiver_
- **Invoker**
  - Chiede a _Command_ di portare a termine la richiesta
- **Receiver**
  - Conosce il modo di svolgere le operazioni associate a una richiesta. Qualsiasi classe può essere vista come _Receiver_

### Schema

immagine

### Svolgimento

1. Il client _aClient_ crea un oggetto _aCCommand_ e ne specifica il destinatario _aReceiver_
2. Un oggetto _aInvoker_ memorizza l'oggetto _aCCommand_
3. _aInvoker_ inoltra una richiesta chiamando il metodo _Execute_ sul comando _aCCommand_. Se i comandi supportano l'annullamento,
   _aCCommand_ salva lo stato necessario per annullare il comando prima di invocare _Execute_
4. L'oggetto _aCCommand_ invoca le operazioni necessarie per svolgere il comando sul destinatario _aReceiver_

Il diagramma seguente mostra le interazioni fra questi oggetti. Illustra come il Command Pattern disaccoppi il mittente di una richiesta dal destinatario e dalla richiesta stessa.
