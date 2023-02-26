import fetch from "node-fetch";
import fs from "fs";

let veloLocked;
let currentPrice;
let sellOrder;
let data = [];

async function fetchNFTData() {
  try {
    const response = await fetch(
      "https://quixotic-opt-mainnet.herokuapp.com/api/collection/0x9c7305eb78a432ced5C4D14Cac27E8Ed569A2e26/tokens/?availability=forSale&currency=all&limit=600&offset=0&query=&sort=",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token abf6b7be54f3ed9ba696723fb4155a67b88277b4",
        },
      }
    );
    data = await response.json();

    return data.results;
  } catch (error) {
    console.error(error);
  }
}

async function fetchCoinPrice() {
  let coin = `velodrome-finance`;
  try {
    var id = coin.slice(0, coin.length);
    let url = `https://api.coingecko.com/api/v3/coins/${id}?tickers=true&market_data=true`;

    const response = await fetch(url);
    const data = await response.json();

    currentPrice = data.market_data.current_price.usd;

    return currentPrice;
  } catch (error) {
    console.error(error);
  }
}

async function getData() {
  await fetchCoinPrice();
  await fetchNFTData();
  let count = 0;
  for (var i = 0; i < data.results.length; i++) {
    //console.log(data.results[i]);

    if (data.results[i].image) {
      let nft_metadata = data.results[i].image;
      let parsed_nft_metadata = nft_metadata.split(",");
      let coded_string = parsed_nft_metadata[1];

      if (coded_string) {
        let bdecoded = Buffer.from(coded_string, "base64").toString("utf8");
        let num = 1000000000000000000;
        let velo = bdecoded.split("value")[1];

        let veloInt = parseInt(velo);
        veloLocked = veloInt / num;

        sellOrder = data.results[i].sell_order.usd_price;

        //console.log(veloLocked);

        // console.log(
        //   `Velo Locked: ${veloLocked}, Current Price: ${currentPrice}, Sell Order : ${sellOrder}`
        // );

        let veloValue = veloLocked * currentPrice;

        let margin = (veloValue / sellOrder) * 100;
        //console.log(margin);

        if (margin > 35 && veloValue > 1) {
          count++;
          // console.log(margin);
          // console.log(veloValue);
          // console.log("Profit");
          console.log(veloValue);

          console.log(sellOrder);

          const link = `Link : https://qx.app/asset/0x9c7305eb78a432ced5C4D14Cac27E8Ed569A2e26/${data.results[i].token_id}`;

          const text = link + "     " + " Profit margin:" + margin + "\n";
          const filename = "data.txt"; // The path to the file you want to write to
          const filePath = `./${filename}`;

          fs.appendFile(filePath, text, (err) => {
            if (err) throw err;
            console.log("Text has been written to the file.");
          });
        }
      }
    }
  }
  console.log(count);
}

getData();


