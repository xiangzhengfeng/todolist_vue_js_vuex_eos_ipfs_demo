var nebulas = require("nebulas"),
    NebPay = require("nebpay"),
    HttpRequest = nebulas.HttpRequest,
    Neb = nebulas.Neb,
    Account = nebulas.Account,
    Transaction = nebulas.Transaction,
    Unit = nebulas.Unit,
    Utils = nebulas.Utils;

var chainnetConfig = {
    mainnet: {
        name: "主网",
        contractAddress: "n1jWpKadorv27XgSbo4WRZvsyCdAajkEP4B",
        txhash: "04222aa816c36a7895efd59256f4f2844fae253064ebc40c155266e3d6cc5220",
        host: "https://mainnet.nebulas.io",
        payhost: "https://pay.nebulas.io/api/mainnet/pay"
    }
}

var chain = localStorage.getItem("chain") || "mainnet"
var chainInfo = chainnetConfig[chain]
var neb = new Neb();
neb.setRequest(new HttpRequest(chainInfo.host));
var nasApi = neb.api;
var nebPay = new NebPay();
var cls, app, nebState;
var dappcontractAddress = "n1qMHuhJ7N5faxAdbv1itzzkKpWrbCjZLEg";
var dappcontractsaleAddress = "n1ronusSjefTT3fWB7YMzJR4TBhzicrHvxn";

function mylog() {    
}
var CategoryListComponent = {   
}
var MyFllowComponent = {    
}
var FavCategoryListComponent = {    
}
var HomeComponent = {   
}
var AddTopicComponent = {    
}
var MyDonateComponent = {    
}
var MyReceivedDonateComponent = {   
}
var MyReplyComponent = {    
}
var TopicComponent = {    
}
var AboutComponent = {    
}
var UserSettingComponent = {   
}
var routes = {          
} 
var router = new VueRouter({
})
function getErrMsg(err) {    
}

var defaultData = {    
    nasApi: nasApi,
    balance: 0,
}

var Main = {
    methods: {
        changChain: function (chain) {
            if (chain == "mainnet") {
                this.chainStr = "主网"
            } else if (chain == "testnet") {
                this.chainStr = "测试网"
            }
            this.chain = chain
            localStorage.setItem("chain", chain)
            location.reload()
        },
        fetchAccountState: function () {
            var _this = this;

            if (!app.address) {
                return
            }
            this.nasApi.getAccountState({
                address: app.address
            }).then(function (resp) {
                if (resp.error) {
                    this.$message.error(resp.error)
                }
                var amount = Unit.fromBasic(Utils.toBigNumber(resp.balance), "nas").toNumber()
                app.balance = amount

                _this.accountState = resp
            });
        },
        
        fetchUserInfo: function () {
            var _this = this;
            nasApi.call({
                chainID: app.nebState.chain_id,
                from: app.address,
                to: app.contractAddress,
                value: 0,
                // nonce: nonce,
                gasPrice: 1000000,
                gasLimit: 2000000,
                contract: {
                    function: "getUser",
                    args: JSON.stringify([app.address, false])
                }
            }).then(function (resp) {
                _this.userLoad = true
                var result = JSON.parse(resp.result)
                if (result) {
                    _this.user = result
                    _this.$eventHub.$emit("userUpdate", result)
                }
            })
        },
        updateUserInfo: function () {
            this.fetchUserInfo()
            this.fetchAccountState()
        },
    },
    
    data: function () {
        var address = localStorage.getItem('address') || ""
        defaultData.address = address
        defaultData.menuStatus = false
        defaultData.noExtension = typeof (webExtensionWallet) === "undefined"
        return defaultData
    }
}

nasApi.getNebState().then(function (state) {
    defaultData.nebState = state
    nebState = state
    cls = Vue.extend(Main)
    app = new cls()
    getWallectInfo()
    app.$mount('#app')
})

function getWallectInfo() {
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            mylog("e.data.data:", e.data.data)
            if (e.data.data.account) {
                app.address = e.data.data.account
                app.updateUserInfo()
            }
        }
    })

    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
}
