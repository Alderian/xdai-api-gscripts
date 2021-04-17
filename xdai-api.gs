// Time to wait in miliseconds to call function.
// this is to sparse function calling.
// Recomended 5 seconds = 5 * 1000
// The maximum allowed value is 300000 (or 5 minutes). (Google Apps reference limit)
var waitInMiliseconds = 5 * 1000

// How many times should we retry a failed funcion call
// This is to avoid function calling too many times and to exceed function timeout
// Recomended 3 times
var maxCallingTimes = 3

// Cache timeout
// Avoids too much refreshed over time to prevent API from failing with too many calls
// Timeout in seconds
// Recomended 10 minutes, 600 seconds
var cacheTimeout = 600

/**
 * --------------------------------------------------------------------------------------------
 * Google Sheet Scripts for xDAI API by Alderian
 * --------------------------------------------------------------------------------------------
 * 
 * getxDaiBalance       Gets xDai token balance on your wallet
 * getxDaiTokenBalance  Gets ANY token balance on your wallet. It can get any contract balance
 * 
 */

/** getxDaiBalance
 * 
 * Gets xDAI token balance on your wallet
 * 
 * @param {xDaiAddress}              the wallet xDai address, in the form of 0x12345... 
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @param {calledTimes}             the number of times this function was called to control how many times its called
 * @returns 
 */
async function getxDaiBalance(xDaiAddress, parseOptions, calledTimes = 0) {
  if (calledTimes >= maxCallingTimes) {
    return "Error: called too many times. " + calledTimes;
  }

  id_cache = 'XDAI' + xDaiAddress + 'XDAIbalance'
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }

  try {
    Utilities.sleep(Math.random() * 100 + waitInMiliseconds)
    url = "https://blockscout.com/poa/xdai/api?module=account&action=balance&address=" + xDaiAddress;

    var res = await UrlFetchApp.fetch(url)
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);

    var balance = Number(parseFloat(parsedJSON.result) / 1000000000000000000);
    cache.put(id_cache, balance, cacheTimeout);
    return balance;
  }
  catch (err) {
    return getxDaiBalance(xDaiAddress, parseOptions, calledTimes++);
  }

}

/** getxDaiTokenBalance
 * 
 * Gets ANY token balance on your wallet. It can get any contract balance
 * 
 * @param {xDaiAddress}              the wallet xDai address, in the form of 0x12345... 
 * @param {tokenContract}           the token contract to get
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @param {calledTimes}             the number of times this function was called to control how many times its called
 * @returns 
 */
async function getxDaiTokenBalance(xDaiAddress, tokenContract, parseOptions, calledTimes = 0) {
  if (calledTimes >= maxCallingTimes) {
    return "Error: called too many times. " + calledTimes;
  }

  id_cache = 'XDAI' + xDaiAddress + tokenContract + 'balance'
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }

  try {
    Utilities.sleep(Math.random() * 100 + waitInMiliseconds)
    url = "https://blockscout.com/poa/xdai/api?module=account&action=tokenbalance&contractaddress=" + tokenContract + "&address=" + xDaiAddress;

    var res = await UrlFetchApp.fetch(url)
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);

    var balance = Number(parseFloat(parsedJSON.result) / 1000000000000000000);
    cache.put(id_cache, balance, cacheTimeout);
    return balance;
  }
  catch (err) {
    return getxDaiTokenBalance(xDaiAddress, tokenContract, parseOptions, calledTimes++);
  }

}
