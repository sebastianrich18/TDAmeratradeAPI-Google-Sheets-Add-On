# TDAmeratradeAPI-Google-Sheets-Add-On
An add-on for Google Sheets that intagrates the TDAmeratrade api to get quotes, fundamental data, and a portfolio breakdown

# How to install
1. Within google sheets, click on `Tools` then `Script editor`
2. Delete `function myFunction() { }`
3. Copy all the code in [code.gs](code.gs)
4. Paste everything into the google script editor
5. Click save and return to sheets

# Logging In
In order to get your portfolio and other price data you must log in to TDAmeratrade, here's how.
1. On google sheets, in the top bar, click `TD Ameratrade` then `Log in`
2. You will be redirected to TDAmeratrade to login. After logging in, you will be redirected to a green webpage
3. Click the `copy` button to copy your code
4. Back on google sheets, click on `TD Ameratrade` then `Enter code`
5. Paste the code into the box and hit `ok`
6. You are now logged in!

# Commands
- =TDA('ABC')
  - gets last market price of a stock
  
- =TDA('positions', 0)
  - Gets all current postions and info on them. If you have multiple accounts use 1, 2, 3... insted of 0 to get those accounts positions
  
- =TDA('ABC', 'quote', data)
  - Gets quote data, possable inputs for data are: 
    - symbol
    - description
    - bidPrice
    - askPrice
    - bidSize
    - askSize
    - openPrice
    - highPrice
    - lowPrice
    - closePrice
    - netChange
    - totalVolume
    - exchange
    - 52WkHigh
    - 52WkLow
    - divAmount
    - divYield
    - divDate
   
- =TDA("ABC", "fundamental", data)
  - Gets fundamental data possable inputs for data are:
    - peRatio
    - pegRatio
    - pbRatio
    - prRatio
    - pcfRatio
    - grossMarginTTM
    - grossMarginMRQ
    - netProffitMarginTTM
    - netProffitMarginMRQ
    - operatingMarginTTM
    - operatingMarginMRQ
    - returnOnEquity
    - returnOnAssets
    - returnOnInvestment
    - quickRatio
    - currentRatio
    - intrestCoverage
    - totalDebtToCapital
    - ltDebtToEquity
    - totalDebtToEquity
    - epsTTM
    - epsChangePercentTTM
    - epsChangeYear
    - epsChange
    - revChangeYear
    - revChangeTTM
    - revChangeIn
    - sharesOutstanding
    - marketCapFloat
    - marketCap
    - bookValuePerShare
    - beta


<h5> THIS ADD-ON NOR ITS CONTRIBUTERS ARE ENDORSED BY OR AFFILIATED WITH TD AMERATRADE </h5>
