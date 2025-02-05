import { IStallionNativeEventData } from '../state/useStallionEvents';

type EventListener = (data?: IStallionNativeEventData) => void;

class EventEmitter {
  private events: EventListener[] = [];

  // Method to add event listener
  addEventListener(listener: EventListener): void {
    this.events.push(listener);
  }

  // Method to remove event listener
  removeEventListener(listenerToRemove: EventListener): void {
    this.events = this.events.filter(
      (listener) => listener !== listenerToRemove
    );
  }

  // Method to emit an event
  emit(data?: IStallionNativeEventData): void {
    this.events.forEach((listener) => listener(data));
  }
}

export const stallionEventEmitter = new EventEmitter();
