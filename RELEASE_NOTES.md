# 3.0.2

* added `_data` and `_additional` data to all base project to enable reading of private data
* updated payment summary tests for BTC chain

# 3.0.1

* updated base objects to not be generic to response type

# 3.0.0

* Updated XRP Transaction and block getters 
* Using XRP Transactions meta prop to analyze affected nodes
* Added FullBlock<T> object that extends Block object and has a getter returning MCC Transaction objects for the underlying chain.