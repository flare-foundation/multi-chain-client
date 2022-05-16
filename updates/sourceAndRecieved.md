Currently this method returns 

```
export interface AddressAmount {
   address?: string;
   amount: BN;
   utxo?: number;
}
```

we would update it to 

```
export interface AddressAmount {
   address?: string;
   currencyName: string;
   amount: BN;
   utxo?: number;
}
```

So if we were to prove token transfers we could have an array that would bot hold token amount and 
fee in this array, note that we would also need to update/add the support for minimal divisible amounts
 (elementary units) for each token in transaction.

 