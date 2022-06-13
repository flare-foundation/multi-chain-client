# Upgraders

Priority Updates
- [ ] Comments in BlockBase.ts

Updates:
- [ ] rewrite axios-rate-limit to TS
- [ ] add spice control to axios requests when reaching rate limit 
- [ ] add coverage report
- [ ] create run all tests script
- [ ] create own or find alternative to "base32.js": "0.1.0",
- [ ] Error handling standardized (throw new Error() vs throw MccError())
  - [ ] Decide how to handle querrying data form possibli undefined objects (for example get number on AlgoBlock object) 
- [ ] Standardize json Stringify (one implementation and use it everywhere)