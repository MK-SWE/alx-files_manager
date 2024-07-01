# File Manager Utilities

> This is a collection of utilities for the File Manager project. 

## [Redis Client](./redis.js)

> Contains a Redis client that can be used to interact with the Redis server.

**The Client has the following methods:**

- `isAlive(): boolean` - _Check if the Redis server is alive._
- `get(key: string): Promise<string>` - _Get the value of a key from the Redis server._
- `set(key: string, value: string, duration: string): Promise<void>` - _Set the value of a key in the Redis server._
- `del(key: string): Promise<void>` - _Delete a key from the Redis server._
