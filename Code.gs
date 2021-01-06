let authLink = '';
let callbackURI = '';
let apikey = '';


function TDA(one, two, three) {
  if (typeof one === 'string' && one != 'positions' && two == undefined && three == undefined) { // get price
    Logger.log('Getting last price of ' + one)
    let data = getQuote(one)['lastPrice']
    Logger.log(data)
    return data

  } else if (typeof one === 'string' && one != 'positions' && two == 'quote' && three != undefined){ // get quote
    Logger.log("getting " + three + " of " + one)
    let data = getQuote(one)[three]
    Logger.log(data)
    return data

  } else if (one === 'positions' && typeof two == 'number' && three == undefined) { // get positions
    Logger.log('Getting positons')
    return getPositionsData(two)

  } else if (typeof one === 'string' && one != 'positions' && two == 'fundamental' && three != undefined) { // get positions
    Logger.log("getting " + three + " of " + one)
    let data = getFund(one)[three]
    Logger.log(data)
    return data
  }

}

function getAccessToken() {
  try {
    let endpoint = 'https://api.tdameritrade.com/v1/oauth2/token';
    let refresh_token = PropertiesService.getUserProperties().getProperty('refresh');
    let data = {'grant_type': 'refresh_token', 'refresh_token': refresh_token, 'client_id': apikey}
    let options = {"method": "post", 'payload': data}
    let r = UrlFetchApp.fetch(endpoint, options).getContentText();
    let accessToken = JSON.parse(r)['access_token']
    Logger.log("access token: " + accessToken)
    return accessToken
  } catch (e) {
    Logger.log(e)
    throw new Error("An error occured, try logging in to TD Ameratrade again")
  }
}


function onOpen(e) {
  Logger.log(PropertiesService.getUserProperties().getProperty('refresh'))
    SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
      .createMenu('TD Ameratrade')
      .addItem('Log In', 'login')
      .addItem('Enter Code', 'inputCode')
      .addItem('Help', 'help')
      .addToUi();
}

function help() {
  let str = "Commands:\n"
  str += "=TDA('ABC'):  gets last market price of ticker ABC\n"
  str += "\n=TDA('positions'):  gets all your current postions and info on them\n"
  str += "\n=TDA('ABC', 'quote', data):  gets quote data, possable inputs for data are; symbol, description, bidPrice, askPrice, bidSize, askSize, openPrice, highPrice, lowPrice, closePrice, netChange, totalVolume, exchange, 52WkHigh, 52WkLow, divAmount, divYield, and divDate\n"
  str += '\n=TDA("ABC", "fundamental", data):  gets fundamental data possable inputs for data are; peRatio, pegRatio, pbRatio, prRatio, pcfRatio, grossMarginTTM, grossMarginMRQ, netProffitMarginTTM, netProffitMarginMRQ, operatingMarginTTM, operatingMarginMRQ, returnOnEquity, returnOnAssets, returnOnInvestment, quickRatio, currentRatio, intrestCoverage, totalDebtToCapital, ltDebtToEquity, totalDebtToEquity, epsTTM, epsChangePercentTTM, epsChangeYear, epsChange, revChangeYear, revChangeTTM, revChangeIn, sharesOutstanding, marketCapFloat, marketCap, bookValuePerShare, beta\n'
  SpreadsheetApp.getUi().alert(str)
}

function login() {
  var html = "<script>window.open('" + authLink + "');google.script.host.close();</script>";
  var userInterface = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(userInterface, 'Redirecting to TD Ameritrade...');

}

function getRefreshToken(code) {
  code = decodeURIComponent(code);
  let endpoint = "https://api.tdameritrade.com/v1/oauth2/token"
  let payload = {"grant_type": "authorization_code", "access_type": "offline", "code": code, "client_id": apikey, "redirect_uri": callbackURI};
  let options = {"method": "POST", "payload": payload}
  let response = UrlFetchApp.fetch(endpoint, options).getContentText();
  let refresh_token = JSON.parse(response)['refresh_token']
  Logger.log(refresh_token)
  PropertiesService.getUserProperties().setProperty('refresh', refresh_token)

}

function inputCode() {
  let ui = SpreadsheetApp.getUi()
  var result = ui.prompt('Input code','Copy and paste everything after "code=" from the url into this box, then press ok:',ui.ButtonSet.OK_CANCEL);
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK) {
    getRefreshToken(text)
  }
}


function getPositionsData(accIndex) {
    let url = `https://api.tdameritrade.com/v1/accounts/`;
    url = addParams(url, {"fields":"positions"})
    let headers = {"Authorization":` Bearer ${getAccessToken()}`};
    let options = {"headers":headers}
    let data = JSON.parse(UrlFetchApp.fetch(url,options).getContentText());
    let cash = data[accIndex]['securitiesAccount']['currentBalances']['cashAvailableForTrading']
    let positions = data[accIndex]['securitiesAccount']['positions'];
    let positionData = []
    let arr = [];
    arr.push(["Symbol", "Shares", "Avg Price", "Mkt price", "P/L Day %", "P/L Day $", "P/L Total %", "P/L Total $", 'Value', 'Description'])
    for (let i=0; i<positions.length; i++) {
      if (positions[i]['instrument']['symbol'] != "MMDA1"){
        let data = {}
        data['symbol'] = positions[i]['instrument']['symbol']
        data['shares'] = positions[i]['longQuantity']
        data['avgPrice'] = positions[i]['averagePrice']
        data['plDay'] = positions[i]['currentDayProfitLoss']
        data['plDayPercent'] = positions[i]['currentDayProfitLossPercentage'] / 100.0
        data['value'] = positions[i]['marketValue']
       
        let quote = getQuote(data['symbol'])
        data['mktPrice'] = quote['lastPrice']
        data['description'] = quote['description']

        data['plTotal'] = (data['mktPrice'] - data['avgPrice']) * data['shares']
        data['plTotalPercent'] = ((data['mktPrice'] - data['avgPrice']) / data['avgPrice']) 

        Logger.log(data)
        positionData.push(data)
        arr.push([data['symbol'], data['shares'], data['avgPrice'], data['mktPrice'], data['plDayPercent'], data['plDay'], data['plTotalPercent'], data['plTotal'], data['value'], data['description']])
      }
    }
    Logger.log(cash)
    arr.push(['Cash', '', '', '', '', '', '', '', cash])
    return arr
}

function getQuote(ticker) {
    let url = `https://api.tdameritrade.com/v1/marketdata/${ticker}/quotes?apikey=${apikey}`;
    let headers = {"Authorization":` Bearer ${getAccessToken()}`};
    let options = {'method': 'GET', 'headers': headers}
    let data = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    //Logger.log(data[ticker])
    return data[ticker];
}

function getFund(ticker) {
  let endpoint = 'https://api.tdameritrade.com/v1/instruments';
  let data = {'apikey': apikey, 'symbol': ticker, 'projection': 'fundamental'}
  let url = addParams(endpoint, data)
  let headers = {"Authorization":` Bearer ${getAccessToken()}`};
  let options = {'method': 'GET', 'headers': headers}
  let r = JSON.parse(UrlFetchApp.fetch(url, options).getContentText())
  return r[ticker]['fundamental']
}

function addParams(url, params) {
	url += "?";
	for (const property in params) {
		url += (`${property}=${params[property]}&`);
	}
	url = url.substring(0, url.length - 1);
	return url
}
