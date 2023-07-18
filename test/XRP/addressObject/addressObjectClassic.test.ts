import { expect } from "chai";
import { AddressBase, XrpAddress } from "../../../src/base-objects/AddressBase";

describe("Balance decreasing summary tests", function () {
   const XrpAdd = new XrpAddress("rwwvd6W78HXK4k5yZP1MieSddtHHUEKG34");

   it("Should be valid checksum", async function () {
      const valid = XrpAdd.isValid();
      expect(valid).to.eq(true);
   });
});

const addresses = [
   "r11D6PPwznQcvNGCPbt7M27vguskJ826c",
   "r11L3HhmYjTRVpueMwKZwPDeb6hBCSdBn",
   "r12zYzJzTcf2j1BPsb5kUtZnLA1Wn7445",
   "r1398Fmwd1oYz8uUUbeQUE5axgXHjcfTZ",
   "r13m9n9y7TVwFLfJnsMh1tGPRsXjMiaKh",
   "r14f8Luu4dYKzNEwFYV2KfA74YZcWVS5F",
   "r14iqdWmMQD1M7ski2a1oL2yoL8saBrgS",
   "r15BXLNhkFuUP2jztomyDvzsxVLzYw7Yh",
   "r15aAVY2acncVcTkShfQQ6ycAQS2b4yfa",
   "r16DDq7D5kbh7mY6oUWk73RMd2pHA9CKv",
   "r16YHbpcDtZgagdLYHif193h5k8eUpsUN",
   "r17MJdfKLPsmUq9vHup8gyZQThgz66ZeE",
   "r18oeBYz2oqn185egek8kyKmzd4Bd72rU",
   "r19AZfp6t7QAU9sd9HLBegp8HN5ZVK2e2",
   "r1ABmQTg2kdPHHvcVb2M5qh1AWYjM9GwU",
   "r1Adg8aasg4stxsiWi7MUxVddRmJauT9U",
   "r1AsBoAWE7VNsDKQAWHhShF1uHZ21M4CM",
   "r1BHXJfLyvQ38DEMrMqX4fCwJBP8kqtGf",
   "r1BabVZFSZ1oPTM27UTwsAFNe6o9ru3ti",
   "r1CJ6j4P3W255DSCWUDZVoWqkf2wa5YNQ",
   "r1DSEmZySpSxxDkWLoQfmZgrDxNjKSTyj",
   "r1Dyp4MrNxTds4vds8QnwkfXinifWUP6q",
   "r1E4N24XJYzFQJXNHqZ5csBro3JcBefKv",
   "r1EcY9WVJDBAcYQM3WJhbUsG4C9Jm6A6V",
   "r1Ei9NN3VyQWFtEsKxdEMqeLyo4xhvjMy",
   "r1FhHruKJHEqp5c9CeN3vWxwDYuRwnYDb",
   "r1GDaE2VwW5kn8BQSLWSCTZ1hGrjLQgkn",
   "r1HfL794AEY773U8HPQ7JiH6Z4bVUpWVb",
   "r1HjfzcHVV6LzUTDZTx4g2zkekXgkAa1M",
   "r1HupHBGZz6Ay5CpjXRaBCBfi72y7NNBx",
   "r1JDeX3MuLd5CahR4XB5CVpgnRpzCE3qw",
   "r1JVCBpcSC7ggVouxaokxzEBhhcVeeb95",
   "r1KahfrucX3kUXNtmVoCbiXLEAUhK9X8w",
   "r1KbfqewtPANsffX8MaXKAMKodpggxt7i",
   "r1Kx9mwJBt52wqSTThwrnBTVmHKkqvEyk",
   "r1L2Hc9yS8cUaCaC68mVBrmJM39TVwYMy",
   "r1LC1wdQnqiSQ7e44uRyzHPnqWoBLXiDs",
   "r1M2Gtp4TH18Ccp4VURdiWfRnWsoYSvnv",
   "r1MVhxVV61nHZb4G8VCAxEmeEm77xAe8r",
   "r1MvaLcxJbXznCW5gbaZDUQBKrsPGXM1n",
   "r1NNe3pzGckgWetLEGMLzjYdVP13wf3mB",
   "r1Nv2RZHrAAZeUPJf5dhZT44nsT25gTNr",
   "r1QD86PEAH3dBTUczBWBpZnwxHy6uYozD",
   "r1R2F4sBS1Yr5Z4sqBjGp2Ds12iajsSLG",
   "r1RD9B8rvfiWWfPTS19asTdMDeDkiG1jQ",
   "r1Rto1BnKiv4Do6eaLfi3cyUZ14avX4Ei",
   "r1U52j5nGuiP5esS4rrcC1q82UAdBVb1N",
   "r1UHRupeZD9ZXqgjrH2F3EfNS2ZtpSmJc",
   "r1UNRaXKaWwRCPKb8cQjr7ARJzsR1U5Ah",
   "r1URqEZAc7v7cBuw7L12LXSuqfVo6rdkb",
   "r1UsyMFDKCM3EXmK54No8WQbEZkdNG8dz",
   "r1W7fG98kSoCdMnPNsRm8MHBhVZwm2MuK",
   "r1WhKEeJtcfw86hPJAvRZaNgYCx7Cpmfs",
   "r1XBmBwuACejE8TmHUfqNeUo4vw85uzy8",
   "r1XGDG4acQsn5se9NhFuyPunA4ZgrDCTj",
   "r1Xus9NyvT1gcrfdPnSRkaVA1rEDDLAVV",
   "r1XwdZ8TXLs3CfR95DUzs8LpFUmeA8AQx",
   "r1aJkPAjwuGVuepQJJNnNsWonrBjtxc1i",
   "r1b7kckkatvTpbqveNHqMQcZ7str77L1w",
   "r1bMiPDueWriNvHt7FLbzktXhNDEzTE7L",
   "r1bujAx1sEcMTewgyM7qZdbyZgoyG2QeN",
   "r1cE39fDVJZAU44rCcebxTy55RGhZ2CAf",
   "r1cQogxhjbTB2ANUqcip7qvbzvfdicoYD",
   "r1cSPpkr3coYtjYsWX6vSrvxJ4HewZaLh",
   "r1cpFDsMk6nKdowm4V8PviWe9CzVCAHny",
   "r1d2o5zn5efC4BEDLk1RKdrhVfaX2ntJG",
   "r1d9jhwvxWqVjqg3MKCtH85mFaenYAq1P",
   "r1dAAf7gBLNkQfB4mExiMKc9kDgs1RtTq",
   "r1e2xAXtKnkLLQHCBnFTPkQThufn4twP6",
   "r1eBgHTJguVsH28TxNWVJ762TWBFpZ9xv",
   "r1eGAVnup4htVA6PxTzu2AePjefxgmrwF",
   "r1gDaaBpW9RNTC2Sux4EGRdUtDQofnUwL",
   "r314dtpk2SXFySFkRg7Z39aAQprfVavxEd",
   "r3157Yq61EnErXF7zMat7A14daNadsKtUJ",
   "r315i7nQy7GyS3jpkT1C5zroD2QhiTtKpR",
   "r316fjHFuZ67giur6oCE4kyHX5x2PNwQ49",
   "r3177pAYJAT7QAEW5Wb2Wo9ph9VsF7SoB3",
   "r317GjsqJw17YNoUfCNDsmnpKVk5sWR6Lv",
   "r317kNVyeyjUR5YBFrxDpjuCjbgXTAJMBE",
   "r318KCizBzrZUfrMyZzfmnJP2rqygdokJt",
   "r318KwDifm6GwMro5p8eW5Sta8wtKSUidZ",
   "r318S44f8mn7MRpMYB19hYXSKW9q4c3YhQ",
];

describe("Iterating over addresses ", function () {
   for (const add of addresses) {
      it(`Address should have valid checksum ${add}`, function () {
         const address = new XrpAddress(add);
         expect(address.isValid()).to.be.true;
      });

      it(`Address should return equl length std address hash ${add}`, function () {
         const address = new XrpAddress(add);
         expect(address.stdHash).to.have.lengthOf(64);
      });
   }
});
