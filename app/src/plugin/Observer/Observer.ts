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

  addObserver(observer: Function): void {
    if (typeof observer !== 'function') {
      throw new Error('Observer must be a function');
    }

    for (let i = 0; i < this.observers.length; i += 1) {
      if (this.observers[i].toString() === observer.toString()) {
        throw new Error('Observer already in the list');
      }
    }

    this.observers.push(observer);
  }

  removeObserver(observer: Function): void {
    for (let i = 0; i < this.observers.length; i += 1) {
      if (this.observers[i].toString() === observer.toString()) {
        this.observers.splice(i, 1);

        return;
      }
    }

    throw new Error('Could not find observer in list of observers');
  }

  notifyObservers<CustomData>(data?: CustomData): void {
    // Make a copy of observer list in case the list
    // is mutated during the notifications.
    const observersSnapshot = this.observers.slice(0);

    for (let i = 0; i < observersSnapshot.length; i += 1) {
      observersSnapshot[i](data);
    }
  }
}

export default Observer;
