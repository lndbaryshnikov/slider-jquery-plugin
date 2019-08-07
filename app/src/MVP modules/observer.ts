interface ObserversStorage {
    addObserver(observer: Function): void;
    removeObserver(observer: Function): void;
    notifyObservers(data: any): void;
}

class Observer implements ObserversStorage{
    observers: Function[];

    addObserver(observer: Function): void {
    }

    removeObserver(observer: Function): void {
    }

    notifyObservers(data: any): void {
    }
}

export default Observer;

