import { EventEmitter } from 'node:events';

const eventEmitter = new EventEmitter();

export const EVENTS = {
  USER_REGISTERED: 'user:registered',
  USER_VERIFIED: 'user:verified',
  USER_INVITED: 'user:invited',
  USER_DELETED: 'user:deleted',
};

export default eventEmitter;
