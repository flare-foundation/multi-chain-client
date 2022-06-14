# Upgraders

Priority Updates
- [x] Comments in BlockBase.ts

Updates:
- [ ] rewrite axios-rate-limit to TS
- [ ] add spice control to axios requests when reaching rate limit 
- [ ] add coverage report
- [ ] create run all tests script
- [ ] create own or find alternative to "base32.js": "0.1.0",
- [ ] Error handling standardized (throw new Error() vs throw MccError())
  - [ ] Decide how to handle querrying data form possibli undefined objects (for example get number on AlgoBlock object)
  - [ ] Wrap all methods to try except in object base methods 
- [ ] Standardize json Stringify (one implementation and use it everywhere)
- [ ] Add getTransactionObjects() to block object that returns all transaction wrapped in trasnactionBase object of that underlying chain
- [ ] Remove AlgoIndexerTrasnaction and AlgoIndexerBlock objects 
- [ ] Add supported versions of underlying chains to mccClint for each chain