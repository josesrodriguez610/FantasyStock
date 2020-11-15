/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
require('dotenv').config();

const {
  Stock_user,
  League_user,
  Stock,
  League
} = require('../db/index');

const checkSharesAvailable = (id_stock, id_league) => {
  let sharesAvailable = 100;
  Stock_user.findAll({
    where: {
      id_stock, id_league
    }
  })
    .then((joins) => {
      joins.map((entry) => {
        sharesAvailable -= entry.portfolio.shares;
        return '';
      });
      return sharesAvailable;
    });
};
const checkMoneyAvailable = async (id_league, id_user) => {
  let moneyAvailable;
  await League_user.findAll({
    where: {
      id_league, id_user
    }
  })
    .then((joint) => {
      moneyAvailable = joint[0].dataValues.bank_balance;
    });
  return moneyAvailable;
};

const portfolioValues = async (id_league, id_user) => {
  const portfolioPrice = Stock_user.findAll({
    where: {
      id_league, id_user
    }
  }).then((leaguePortfolio) => leaguePortfolio
    .map((portfolio) => portfolio.dataValues))
    .catch((err) => console.warn(err));

  const awaitPortPrice = await portfolioPrice;

  const stockPrice = await Promise.all(
    awaitPortPrice.map(async (stock) => Stock.findByPk(stock.id_stock)
      .then((data) => ({
        price: data.current_price_per_share,
        shares: stock.portfolio.shares
      })).catch((err) => console.warn(err)))
  );
  const awaitStockPrice = await stockPrice;
  const getBank = League_user.findOne({
    where: {
      id_league, id_user
    }
  })
    .then((user) => user.bank_balance);

  const awaitGetBank = await getBank;

  const portfolioCalcValue = () => {
    let portfolioValue = 0;
    awaitStockPrice.forEach((stock) => {
      portfolioValue
        += ((stock.price * stock.shares));
    });
    return (portfolioValue);
  };
  const portfolioCalcPaid = () => {
    let portfolioPaid = 0;
    awaitPortPrice.forEach((stock) => {
      portfolioPaid
        += ((stock.portfolio.price_per_share_at_purchase * stock.portfolio.shares));
    });
    return portfolioPaid;
  };
  const portPercent = (((portfolioCalcValue() - portfolioCalcPaid()) / 100));
  const totalValue = (portfolioCalcValue() + awaitGetBank);

  League_user.update({
    net_worth: totalValue
  },
  {
    where: {
      id_user,
      id_league
    }
  }).then(() => 'Success')
    .catch((err) => console.warn(err));
};

const updateStocks = () => {
  // TODO: reduced stock grab to preserve API
  // TODO: Fix calls 4-10
  // if they send stocks, just grab those as the array. if they don't, update all the stocks we have
  const tickerArr = [
    ['ABT', 'ABBV', 'ACN', 'ACE', 'ADBE', 'ADT', 'AAP', 'AES', 'AET', 'AFL', 'AMG', 'A', 'GAS', 'APD', 'ARG', 'AKAM', 'AA', 'AGN', 'ALXN', 'ALLE', 'ADS', 'ALL', 'ALTR', 'MO', 'AMZN', 'AEE', 'AAL', 'AEP', 'AXP', 'AIG', 'AMT', 'AMP', 'ABC', 'AME', 'AMGN', 'APH', 'APC', 'ADI', 'AON', 'APA', 'AIV', 'AMAT', 'ADM', 'AIZ', 'T', 'ADSK', 'ADP', 'AN', 'AZO', 'AVGO'],
    ['BHI', 'BLL', 'BAC', 'BK', 'BCR', 'BXLT', 'BAX', 'BBT', 'BDX', 'BBBY', 'BRK-B', 'BBY', 'BLX', 'HRB', 'BA', 'BWA', 'BXP', 'BSK', 'BMY', 'BRCM', 'BF-B', 'CHRW', 'CA', 'CVC', 'COG', 'CAM', 'CPB', 'COF', 'CAH', 'HSIC', 'KMX', 'CCL', 'CAT', 'CBG', 'CBS', 'CELG', 'CNP', 'CTL', 'CERN', 'CF', 'SCHW', 'CHK', 'CVX', 'CMG', 'CB', 'CI', 'XEC', 'CINF', 'CTAS', 'CSCO'],
    ['C', 'CTXS', 'CLX', 'CME', 'CMS', 'COH', 'KO', 'CCE', 'CTSH', 'CL', 'CMCSA', 'CMA', 'CSC', 'CAG', 'COP', 'CNX', 'ED', 'STZ', 'GLW', 'COST', 'CCI', 'CSX', 'CMI', 'CVS', 'DHI', 'DHR', 'DRI', 'DVA', 'DE', 'DLPH', 'DAL', 'XRAY', 'DVN', 'DO', 'DTV', 'DFS', 'DISCA', 'DISCK', 'DG', 'DLTR', 'D', 'DOV', 'DOW', 'DPS', 'DTE', 'DD', 'DUK', 'DNB', 'ETFC', 'EMN']
    // ['ETN', 'EBAY', 'ECL', 'EIX', 'EW', 'EA', 'EMC', 'EMR', 'ENDP', 'ESV', 'ETR', 'EOG', 'EQT', 'EFX', 'EQIX', 'EQR', 'ESS', 'EL', 'ES', 'EXC', 'EXPE', 'EXPD', 'ESRX', 'XOM', 'FFIV', 'FB', 'FAST', 'FDX', 'FIS', 'FITB', 'FSLR', 'FE', 'FSIV', 'FLIR', 'FLS', 'FLR', 'FMC', 'FTI', 'F', 'FOSL', 'BEN', 'FCX', 'FTR', 'GME', 'GPS', 'GRMN', 'GD', 'GE', 'GGP', 'GIS']
    // ['GM', 'GPC', 'GNW', 'GILD', 'GS', 'GT', 'GOOGL', 'GOOG', 'GWW', 'HAL', 'HBI', 'HOG', 'HAR', 'HRS', 'HIG', 'HAS', 'HCA', 'HCP', 'HCN', 'HP', 'HES', 'HPQ', 'HD', 'HON', 'HRL', 'HSP', 'HST', 'HCBK', 'HUM', 'HBAN', 'ITW', 'IR', 'INTC', 'ICE', 'IBM', 'IP', 'IPG', 'IFF', 'INTU', 'ISRG', 'IVZ', 'IRM', 'JEC', 'JBHT', 'JNJ', 'JCI', 'JOY', 'JPM', 'JNPR', 'KSU'],
    // ['K', 'KEY', 'GMCR', 'KMB', 'KIM', 'KMI', 'KLAC', 'KSS', 'KRFT', 'KR', 'LB', 'LLL', 'LH', 'LRCX', 'LM', 'LEG', 'LEN', 'LVLT', 'LUK', 'LLY', 'LNC', 'LLTC', 'LMT', 'L', 'LOW', 'LYB', 'MTB', 'MAC', 'M', 'MNK', 'MRO', 'MPC', 'MAR', 'MMC', 'MLM', 'MAS', 'MA', 'MAT', 'MKC', 'MCD', 'MHFI', 'MCK', 'MJN', 'MMV', 'MDT', 'MRK', 'MET', 'KORS', 'MCHP', 'MU'],
    // ['MSFT', 'MHK', 'TAP', 'MDLZ', 'MON', 'MNST', 'MCO', 'MS', 'MOS', 'MSI', 'MUR', 'MYL', 'NDAQ', 'NOV', 'NAVI', 'NTAP', 'NFLX', 'NWL', 'NFX', 'NEM', 'NWSA', 'NEE', 'NLSN', 'NKE', 'NI', 'NE', 'NBL', 'JWN', 'NSC', 'NTRS', 'NOC', 'NRG', 'NUE', 'NVDA', 'ORLY', 'OXY', 'OMC', 'OKE', 'ORCL', 'OI', 'PCAR', 'PLL', 'PH', 'PDCO', 'PAYX', 'PNR', 'PBCT', 'POM', 'PEP', 'PKI'],
    // ['PRGO', 'PFE', 'PCG', 'PM', 'PSX', 'PNW', 'PXD', 'PBI', 'PCL', 'PNC', 'RL', 'PPG', 'PPL', 'PX', 'PCP', 'PCLN', 'PFG', 'PG', 'PGR', 'PLD', 'PRU', 'PEG', 'PSA', 'PHM', 'PVH', 'QRVO', 'PWR', 'QCOM', 'DGX', 'RRC', 'RTN', 'O', 'RHT', 'REGN', 'RF', 'RSG', 'RAI', 'RHI', 'ROK', 'COL', 'ROP', 'ROST', 'RLC', 'R', 'CRM', 'SNDK', 'SCG', 'SLB', 'SNI', 'STX'],
    // ['SEE', 'SRE', 'SHW', 'SIAL', 'SPG', 'SWKS', 'SLG', 'SJM', 'SNA', 'SO', 'LUV', 'SWN', 'SE', 'STJ', 'SWK', 'SPLS', 'SBUX', 'HOT', 'STT', 'SRCL', 'SYK', 'STI', 'SYMC', 'SYY', 'TROW', 'TGT', 'TEL', 'TE', 'TGNA', 'THC', 'TDC', 'TSO', 'TXN', 'TXT', 'HSY', 'TRV', 'TMO', 'TIF', 'TWX', 'TWC', 'TJK', 'TMK', 'TSS', 'TSCO', 'RIG', 'TRIP', 'FOXA', 'TSN', 'TYC', 'UA'],
    // ['UNP', 'UNH', 'UPS', 'URI', 'UTX', 'UHS', 'UNM', 'URBN', 'VFC', 'VLO', 'VAR', 'VTR', 'VRSN', 'VZ', 'VRTX', 'VIAB', 'V', 'VNO', 'VMC', 'WMT', 'WBA', 'DIS', 'WM', 'WAT', 'ANTM', 'WFC', 'WDC', 'WU', 'WY', 'WHR', 'WFM', 'WMB', 'WEC', 'WYN', 'WYNN', 'XEL', 'XRX', 'XLNX', 'XL', 'XYL', 'YHOO', 'YUM', 'ZBH', 'ZION', 'ZTS', 'AVB', 'AVY']
  ];

  // eslint-disable-next-line array-callback-return
  const functionWithPromise = (array) => {
    const config = {
      method: 'get',
      url: 'https://cloud.iexapis.com/stable/stock/market/batch',
      params: {
        token: 'Tpk_72165f58d5784aea8831c6f9a9e6006a',
        types: 'quote',
        symbols: array.join(',')
      }
    };

    return axios(config)
      .then((response) => response.data)
      .catch((error) => (error));
  };
  const getData = () => Promise.all(tickerArr.map((item) => functionWithPromise(item)));
  return getData().then((data) => data);
};

// Adapted Fisher-Yates Shuffler
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
const arraySlider = (array) => {
  const newArray = array.slice(1);
  newArray.push(array[0]);
  return newArray;
};
const matchScheduler = (numOfWeeks, randomOrderIDs) => {
  const numOfTeams = randomOrderIDs.length;
  const gamesPerWeek = numOfTeams / 2;
  let firstHalfOfIDs = randomOrderIDs.slice(0, gamesPerWeek);
  const secondHalfofIDs = randomOrderIDs.slice(gamesPerWeek);
  const schedule = {
    currentWeek: 0,
    weeklyMatchups: {}
  };
  // TODO: Home vs away fairness
  for (let i = 1; i <= numOfWeeks; i++) {
    const week = `week${i}`;
    const weeklyGames = [];
    for (let k = 1; k <= gamesPerWeek; k++) {
      const gameTemplate = {
        Home: {
          teamID: firstHalfOfIDs[k - 1],
          score: 0
        },
        Away: {
          teamID: secondHalfofIDs[k - 1],
          score: 0
        }
      };
      weeklyGames.push(gameTemplate);
    }
    firstHalfOfIDs = arraySlider(firstHalfOfIDs);
    schedule.weeklyMatchups[week] = weeklyGames;
  }
  return schedule;
};
// TODO: numPlayoffs
const matchupGenerator = (userIDs, numWeeks) => {
  const randomOrderUserIDs = shuffleArray(userIDs);
  const schedule = matchScheduler(numWeeks, randomOrderUserIDs);
  return schedule;
};

const getBankForUserUpdate = (id) => League.findByPk(id)
  .then((league) => league.dataValues.settings.startingBank)
  .catch((err) => {
    console.warn(err);
  });

const settingsUpdater = async (idOwner, idLeague, newSettings, idUsers) => {
  const oldSettings = await League.findByPk(idLeague)
    .then((league) => {
      const { settings } = league.dataValues;
      const new1Settings = {
        date_end: settings.endDate || null,
        lengthMatch: settings.lengthMatches || 7,
        numberOfMatches: settings.numberMatches || 8,
        numberOfTeams: settings.numberTeams || 8,
        numberOfTeamsPlayoffs: settings.numberTeamsPlayoffs || 4,
        date_start: settings.startDate || null,
        startingBank: settings.startingBank * 100,
        schedule: settings.schedule || null
      };
      return new1Settings;
    })
    .catch((err) => {
      console.warn(err);
    });
  const finalSettings = { ...oldSettings };
  if (newSettings != null) {
    for (const key in newSettings) {
      if (newSettings[key] != null) {
        finalSettings[key] = newSettings[key];
        if (key === 'startingBank') {
          finalSettings[key] = newSettings[key] * 100;
        }
        if (key === 'net_worth') {
          finalSettings[key] = newSettings.startingBank * 100;
        }
      }
    }
  }
  const oldUserIDs = await League_user.findAll({
    where: {
      id_league: idLeague
    }
  })
    .then((array) => {
      const answer = [];
      array.map((userA) => answer.push(userA.dataValues.id_user));
      return answer;
    });
  const userIDs = idUsers || oldUserIDs;
  const newSchedule = matchupGenerator(userIDs, finalSettings.numberOfMatches);
  finalSettings.schedule = newSchedule;
  return finalSettings;
};
module.exports = {
  checkSharesAvailable,
  checkMoneyAvailable,
  updateStocks,
  matchupGenerator,
  portfolioValues,
  getBankForUserUpdate,
  settingsUpdater
};
