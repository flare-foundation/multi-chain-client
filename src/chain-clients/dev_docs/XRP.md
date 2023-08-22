## Ripple rpc docs

https://xrpl.org/tx.html
https://xrpl.org/get-started-using-http-websocket-apis.html

health:
https://xrpl.org/health-check.html

Branching protocol

if local set does not come to conclusion to agree on markle root your local node will not accept this round, even if default set came to conclusion, then multiple things could happen:

-   default set was wrong, your history is the correct history, so everyone else will continue down your path (the blocks that you have were correct)
-   your local set was wrong, any data added to blockchain after the branching (block where you and other node validators differ), on your site will be lost. And you as a node operator will reset to the state from the main branch. What exactly one can query from your node when this happens is something I don't know, but I can and will ask.
