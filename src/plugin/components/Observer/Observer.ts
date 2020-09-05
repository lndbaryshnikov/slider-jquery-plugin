interface ObserversStorage {
  addObserver(observer: Function): void;
  removeObserver(observer: Function): void;
  notifyObservers<CustomData>(data: CustomData): void;
}

class Observer implements ObserversStorage {
  observers: Function[];

  constructor() {
    this.observers = [];
  }

  addObserver(newObserver: Function): void {
    if (typeof newObserver !== 'function') {
      throw new Error('Observer must be a function');
    }

    this.observers.forEach((observer) => {
      if (observer.toString() === newObserver.toString()) {
        throw new Error('Observer already in the list');
      }
    });

    this.observers.push(newObserver);
  }

  removeObserver(observerToDelete: Function): void {
    let removalComplete = false;

    this.observers.forEach((observer, index) => {
      if (observer.toString() === observerToDelete.toString()) {
        this.observers.splice(index, 1);

        removalComplete = true;
      }
    });

    if (!removalComplete) {
      throw new Error('Could not find observer in list of observers');
    }
  }

  notifyObservers<CustomData>(data?: CustomData): void {
    // Make a copy of observer list in case the list
    // is mutated during the notifications.
    const observersSnapshot = this.observers.slice(0);

    observersSnapshot.forEach((observer) => {
      observer(data);
    });
  }
}

export default Observer;
