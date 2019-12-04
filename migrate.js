var fs = require('fs');

const filename = "export_hub_2_at_640431_for_zero_height.json"
var nominee = ""
var ucsdt = 0
var uftm = 0
var global_debt_limit = 0
var lp = ""

fs.readFile(filename, 'utf8', function(err, data) {
  var input
  try {
    input = JSON.parse(data)
  } catch (err) {
    console.log(err)
  }
  nominee = input.app_state.authority.authority_key
  var output = {
    app_hash: input.app_hash,
    app_state: {
      auction: input.app_state.auction,
      auth: migrate_accounts(input.app_state.auth),
      bank: input.app_state.bank,
      crisis: input.app_state.crisis,
      csdt: migrate_csdt(input.app_state.csdt),
      denominations: generate_denominations(),
      distribution: input.app_state.distribution,
      evidence: input.app_state.evidence,
      genutil: input.app_state.genutil,
      gov: input.app_state.gov,
      issue: input.app_state.issue,
      liquidator: migrate_liquidator(input.app_state.liquidator),
      market: migrate_market(input.app_state.market),
      mint: input.app_state.mint,
      nft: input.app_state.nft,
      oracle: migrate_oracle(input.app_state.oracle),
      order: migrate_order(input.app_state.order),
      record: input.app_state.record,
      slashing: input.app_state.slashing,
      staking: input.app_state.staking,
      supply: migrate_supply(input.app_state.supply)
    },
    chain_id: input.chain_id,
    consensus_params: input.consensus_params,
    genesis_time: input.genesis_time,
    validators: input.validators
  }
  fs.writeFile('export_hub_1_to_2_mapped.json', JSON.stringify(output, null, 2), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to export_hub_1_to_2_mapped.json");
    }
  });
});

function migrate_accounts(input) {
  return {
    accounts: input.accounts.map(format_account),
    params: input.params
  }
}
function format_account(account) {

  if (account.type == "liquidityprovider/LiquidityProviderAccount") {
      return format_liquidity_provider_account(account)
  } else {
    if (account.value.coins.length > 0) {
      account.value.coins.map(calculate_supply)
    }
    return account
  }
}
function format_liquidity_provider_account(account) {
  if (account.value.Account.value.coins.length > 0) {
    account.value.Account.value.coins.map(calculate_supply)
  }
  lp = account.value.Account.value.address
  return {
    type: "cosmos-sdk/Account",
    value: {
      account_number: account.value.Account.value.account_number,
      address: account.value.Account.value.address,
      coins: account.value.Account.value.coins,
      public_key: account.value.Account.value.public_key,
      sequence: account.value.Account.value.sequence,
    }
  }
}
function calculate_supply(coin) {
  if (coin.denom == "uftm") {
    uftm += parseInt(coin.amount)
  } else if (coin.denom == "ucsdt") {
    ucsdt += parseInt(coin.amount)
  }
}
function migrate_csdt(input) {
  global_debt_limit = parseInt(input.params.GlobalDebtLimit)
  return {
    csdts: input.csdts.map(format_csdt),
    global_debt: calculate_global_debt(input.global_debt),
    params: {
      circuit_breaker: false,
      collateral_params: input.params.CollateralParams.map(format_collateral_param),
      debt_params: null,
      global_debt_limit: format_global_debt(input.params.GlobalDebtLimit),
      nominees: get_nominees()
    }
  }
}
function format_global_debt(global_debt_limit) {
  return [{
    amount: global_debt_limit,
    denom: "ucsdt"
  }]
}
function format_collateral_param(collateral_param) {
  return {
    debt_limit: [{
      amount: collateral_param.DebtLimit,
      denom: collateral_param.Denom
    }],
    denom: collateral_param.Denom,
    liquidation_ratio: collateral_param.LiquidationRatio
  }
}
function calculate_global_debt(global_debt) {
  return ucsdt.toString()
}
function format_csdt(csdt) {
  return {
    accumulated_fees: [],
    collateral_amount: [{
      amount: csdt.collateral_amount,
      denom: csdt.collateral_denom,
    }],
    collateral_denom: csdt.collateral_denom,
    debt: [{
      amount: csdt.debt,
      denom: "ucsdt",
    }],
    fees_updated: "0001-01-01T00:00:00Z",
    owner: csdt.owner
  }
}
function migrate_liquidator(input) {
  return {
    liquidator_params: {
      collateral_params: input.params.CollateralParams.map(format_liquidator_param),
      debt_auction_size: input.params.DebtAuctionSize
    }
  }
}
function format_liquidator_param(param) {
  return {
    denom: param.Denom,
    auction_size: param.AuctionSize
  }
}
function migrate_market(input) {
  markets = {
    markets : input.Markets.map(format_market),
    nominees: get_nominees()
  }
  return markets
}
function format_market(market) {
  return {
    base_asset_denom: market.BaseAssetDenom,
    id: market.ID,
    quote_asset_denom: market.QuoteAssetDenom
  }
}
function migrate_oracle(input) {
  oracle = {
    asset_params: {
      assets: get_assets(input.assets, format_oracles(input.oracles)),
      nominees: get_nominees()
    },
    posted_prices: format_posted_prices(input.posted_prices)
  }
  return oracle
}
function migrate_order(input) {
  return input
}
function migrate_supply(input) {
  return {
    supply: input.supply.map(validate_supply)
  }
}
function validate_supply(supply) {
  if (supply.denom == "ucsdt") {
    supply.amount = ucsdt.toString()
  } else if (supply.denom == "uftm") {
    supply.amount = uftm.toString()
  }
  return supply
}
function generate_denominations(input) {
  return {
    nominees: get_nominees(),
    token_records: [{
      max_supply: "3175000000000000",
      mintable: true,
      name: "Fantom",
      original_symbol: "FTM",
      owner: lp,
      symbol: "uftm"
    },{
      max_supply: global_debt_limit.toString(),
      mintable: true,
      name: "Collateral Stable Debt Tokens",
      original_symbol: "CSDT",
      owner: lp,
      symbol: "ucsdt"
    }]
  }
}
function get_nominees() {
  return [nominee]
}
function get_assets(assets, oracles) {
  return assets.map((a) => {
    return format_asset(a, oracles)
  })
}
function format_asset(asset, oracles) {
  return {
    active: true,
    asset_code: asset.asset_code,
    base_asset: asset.asset_code,
    oracles: oracles,
    quote_asset: "ucsdt"
  }
}
function format_oracles(oracles) {
  return oracles.map(format_oracle)
}
function format_oracle(oracle) {
  return {
    address: oracle.oracle_address
  }
}
function format_posted_prices(posted_prices) {
  return posted_prices.map(format_posted_price)
}
function format_posted_price(posted_price) {
  return {
    asset_code: posted_price.asset_code,
    expiry: format_expiry(posted_price.expiry),
    oracle_address: posted_price.oracle_address,
    price: posted_price.price
  }
}
function format_expiry(expiry) {
  var date = new Date().getTime()
  date += (expiry * 1000)
  return new Date(new Date(date).toUTCString()).toISOString().replace(".000Z","Z")
}
