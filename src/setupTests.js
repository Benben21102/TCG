/* global global */
// Enable Immer MapSet plugin for Redux tests
import { enableMapSet } from 'immer';
enableMapSet();

// Mocks browser APIs like localStorage for Jest
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = value.toString();
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();
