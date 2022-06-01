import { AlgoBlock, base32ToHex, bytesToHex, hexToBase32, MCC } from "../../src";
const sha512_256 = require('js-sha512').sha512_256;
import * as msgpack from "algo-msgpack-with-bigint";
import algosdk from "algosdk";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
   indexer: {
      url: process.env.ALGO_INDEXER_URL || "",
      token: process.env.ALGO_INDEXER_TOKEN || "",
   },
};

describe(`Algo block processing`, async () => {
   describe("Classic block test ", function () {
      let MccClient: MCC.ALGO;
      let block: AlgoBlock;

      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);
        //  const currHeight = await MccClient.getBlockHeight();
        //  console.log(currHeight);

         let tblock = await MccClient.getBlock(21254928);

         if (tblock !== null) {
            block = tblock;
         }
      });

      it("Should get block number ", async function () {
         console.log(block.number);
      });

      it("Should get block hash ", async function () {
         console.log(block.blockHash);
      });

      it("Should get block standard hash ", async function () {
         console.log(block.stdBlockHash);
      });

      it("Should get block timestamp ", async function () {
         console.log(block.unixTimestamp);
      });

      it("Should get transaction ids ", async function () {
         console.log(block.transactionIds);
      });

      it("Should get transaction standard ids ", async function () {
         console.log(block.stdTransactionIds);
      });

      it("Should get transaction count ", async function () {
         console.log(block.transactionCount);
      });

      it('Data', async function () {
         console.log(block.data);
         let j = 1
         for(let ttttx of block.data.block.txns){
          // console.log(j);
           
          // console.log(ttttx);

          if(j === 5){
            console.log(ttttx);
            try{
              console.log(hexToBase32(ttttx.txn.rcv));
              console.log(bytesToHex(ttttx.txn.rcv));
              console.log(base32ToHex('XFYAYSEGQIY2J3DCGGXCPXY5FGHSVKM3V4WCNYCLKDLHB7RYDBU233QB5M'));
              const checksumString = sha512_256.arrayBuffer(ttttx.txn.rcv)
              const checksum = checksumString.slice(28,32)
              console.log(checksum);

              const fullAdd = Buffer.concat([ttttx.txn.rcv,Buffer.from(checksum)], 36)
              
              console.log(bytesToHex(ttttx.txn.rcv) + checksum.toString(16));

              console.log(fullAdd);
              console.log(hexToBase32(fullAdd));
              
              
            } catch (e){
              console.log(e);
              
            }

            console.log();
            console.log();
            
            // the txid on explorel for this transaction is
            // 6XW7PBRB7YUJRYJCYIJDURBWOBF5HQDKQJKI7X34EL6CV56A5UVA
            // 
            
            // msgpack data
            try {
              console.log('msg pack');
              console.log('to decode \n', ttttx);

              const sig_gh = Buffer.concat([ttttx.sig, block.data.block.gh],ttttx.sig.length + block.data.block.gh.length )
              console.log('sig plus gh', sig_gh);
              const ens_sig_gh = sha512_256.arrayBuffer(sig_gh)
              console.log('enc sig_gh', ens_sig_gh);
              console.log('enc base32',hexToBase32(ens_sig_gh));

              const encoded = msgpack.encode(ttttx.txn)
              console.log('encoded', encoded);
              const rest = Buffer.from(encoded)
              console.log('rest: ',rest);
              
              const first =  Buffer.from('TX')
              const firs2 = Uint8Array.from([0x54,0x58])
              console.log(first);
              console.log(firs2);
              
              const full = Buffer.concat([first, rest], first.length + rest.length)
              console.log(full);

              const shaEncoded = sha512_256.arrayBuffer(full)

              console.log(shaEncoded); 
              console.log(typeof shaEncoded);
              console.log(Buffer.from(shaEncoded));
              
              console.log('from msg pack',hexToBase32(shaEncoded));
            } catch (e) {
              console.log(e);
            }

            // json data
            try {
              const txw = block.additionalData.block.txns[4]
              console.log('original \n', txw);
              
              const encoded = msgpack.encode(txw.txn)
              console.log('encoded', encoded);
              const rest = Buffer.from(encoded)
              console.log('rest: ',rest);
              
              const first =  Buffer.from('TX')
              const firs2 = Uint8Array.from([0x54,0x58])
              console.log(first);
              console.log(firs2);
              
              const full = Buffer.concat([first, rest], first.length + rest.length)
              console.log(full);

              const shaEncoded = sha512_256.arrayBuffer(full)

              console.log(shaEncoded); 
              console.log(typeof shaEncoded);
              console.log(Buffer.from(shaEncoded));
              
              console.log('from json',hexToBase32(shaEncoded));
            } catch (e) {
              console.log(e);
            }

            try {
              console.log(ttttx.txn);
              
                // const trans = new algosdk.Transaction(ttttx.txn);
                // console.log(trans);
                // console.log(trans.txID());

                // console.log(block.additionalData);
                const txw = block.additionalData.block.txns[4]
                console.log(txw);
                
                

                const encoded = msgpack.encode(txw)
                const rest = Buffer.from(encoded)
                const st = algosdk.decodeSignedTransaction(rest)
                console.log(st);
                
                
            }
            catch (e){
              console.log(e);
              
            }
          }
          

          j+=1
           
         }
         
      });
   });
});
