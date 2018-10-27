'use strict';

var Permissions = function (obj) {
    this.parse(obj);
};

Permissions.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            this.address = data.address;
            this.category = data.category;
            this.weight = data.weight;
			this.timeStamp = data.timeStamp;
			this.modificator = date.modificator;
        }else{
            this.address = "";
            this.category = "";
            this.weight = 0;
			this.timeStamp = 0;
			this.modificator = [];
        }
    }
};

var TransferNas = function (obj) {
    this.parse(obj);
};

TransferNas.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            this.from = data.from;
            this.to = data.to;
            this.value = data.value;
			this.timeStamp = data.timeStamp;
        } else {
            this.from = "";
            this.to = "";
            this.value = 0;
			this.timeStamp = 0;
        }
    }
};

var Jurisdiction = function() {
	LocalContractStorage.defineProperties(this, {
		_arrFrom: null,
		_addressOfChange: null,
        _addressOfDel: null,
        _freezeContractFrom: null,
        _freezeAddressFrom: null,
		_freezeAddressOfChange: null,
        _freezeContractOfChange: null,
		_totalPermissions: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_surplusPermissions: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_index: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_indexTransfer: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }
    });
	LocalContractStorage.defineMapProperties(this, {
        "manager": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"time": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"totalValue": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"contractBalance": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"totalWeight": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
        "addressBalance": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"transferTime": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		notice: {
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		transferNotice: {
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        }
    });
};

Jurisdiction.prototype = {
	//部署合约时给当前部署合约的地址分配所有者权重，30-100之间！
    init: function(initialWeights) {
		var from = Blockchain.transaction.from;
		this._arrFrom = [];
		this._addressOfChange = [];
        this._freezeContractFrom = [];
        this._freezeAddressFrom = [];
        this._addressOfDel = "";
		this._freezeAddressOfChange = [];
        this._freezeContractOfChange = [];
		//总权限值始终是100，不能更改。
		this._totalPermissions = new BigNumber(100);
		//增加管理者的总权重初始化为50，可以在增加管理者那儿快速增加一个。
		this._index = new BigNumber(0);
		this._indexTransfer = new BigNumber(0);
		var value = new BigNumber(initialWeights);
		this.manager.set(from, value); 
		this._surplusPermissions = this._totalPermissions.minus(value);
		//添加增加管理者记录
		var permissions = new Permissions();
		var now = Date.now();
        permissions.address = from;
		if(value.gte(new BigNumber(50)) && value.lte(new BigNumber(100))){
			permissions.category = "所有者";
		}else{
			throw new Error('初始权重应设置不低于50，不高于100！');
		}
        permissions.weight = this.manager.get(from);	
        permissions.timeStamp = new BigNumber(parseInt(now / 1000));	
		permissions.modificator = [from];	
		this.notice.put(this._index, ["add", permissions]);
		this.notice.put("add", [permissions]);
		this._index = this._index.plus(new BigNumber(1));
        return ["add",permissions];
    },
	
	condition: function(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange){		
	    if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行转账操作！');
		}		
		var from = Blockchain.transaction.from;		
        var contract = Blockchain.transaction.to;
		var value = new BigNumber(value);     
        if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停转账权限！冻结时间24小时！');
		}
        if(this._addressOfDel == from){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停转账权限！！');
        }
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址没有权限，无法调用资金！");
		}		
		if(value.equals(new BigNumber(0))){
				this._addressOfDel = address;
		}
		var addressWeight = this.manager.get(address) || new BigNumber(0);   
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._surplusPermissions.plus(addressWeight)) || value.lt(new BigNumber(0))){
			throw new Error("变动的权重超过剩余权重或变动权重太少");
		}   
		var now = Date.now();		
		var nowTime = new BigNumber(parseInt(now / 1000));
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(addressOfChange[1] != address){
			this.totalWeight.set(all_Weight, new BigNumber(0));
			this.time.set(startTime, nowTime);
            arrFrom = [];
		}
		var allWeight = this.totalWeight.get(all_Weight) || new BigNumber(0);   
        var start = this.time.get(startTime) || new BigNumber(0);
        var timeDifference = nowTime.minus(start);         
        for(var i=0; i<=arrFrom.length; i++){
        	if(arrFrom[i] == from && timeDifference.lt(targetTime)){
				throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }       
        }       
        arrFrom = arrFrom.concat([from]);  
		this.totalWeight.set(all_Weight, allWeight.plus(fromWeight));
		allWeight = this.totalWeight.get(all_Weight);
        if(value.lte(addressWeight) && from == address){
			//如果把自己的权限降低，那么也可以马上快速通道
			this.time.set(startTime, nowTime);
		}else if(timeDifference.lt(targetTime)){
			if(purpose == "add"){
				addressOfChange = ["增加权限",address,value,start,arrFrom];
			}else if(purpose == "del"){
				addressOfChange = ["删除权限",address,value,start,arrFrom];
			}else if(purpose == "freezeAddress"){
				addressOfChange = ["冻结地址",address,value,start,arrFrom];	
			}else if(purpose == "freezeContract"){
					addressOfChange = ["冻结合约",address,value,start,arrFrom];		
			}else if(purpose == "update"){
					addressOfChange = ["更新权限",address,value,start,arrFrom];			
			}
			if(allWeight.lt(new BigNumber(targerValue))){
				return '总权限值低于50，不能联合增加权限！'
			}else{
				this.time.set(startTime, nowTime);
			}
		}else{
			this.time.set(startTime, nowTime);
		}		
		this._surplusPermissions = this._surplusPermissions.plus(addressWeight).minus(value);
		if(this._surplusPermissions.lte(new BigNumber(0)) || this._surplusPermissions.gt(new BigNumber(90))){
			throw new Error('按道理讲这儿应该不能小于零，但是如果这儿报错了，那估计就是某个地方有BUG，暂停增加权限！');
		}
		var permissions = new Permissions();
		if(value.gte(new BigNumber(30)) && purpose !== "freeze"){
			permissions.category = "所有者";
		}else if(value.lt(new BigNumber(30)) && value.gte(new BigNumber(10)) && purpose !== "freeze"){
			permissions.category = "管理者";
		}else if(value.equals(new BigNumber(0)) && address == contract && purpose == "freeze"){
			permissions.category = "冻结合约";
		}else if(value.equals(new BigNumber(0)) && address !== contract){
			permissions.category = "无权限";
		}else if(purpose == "freeze" && value.equals(addressWeight)){
			permissions.category = "冻结地址";
      }
        permissions.timeStamp = nowTime;
        permissions.address = address;
        permissions.weight = value;		
		permissions.modificator = arrFrom;	
		this.totalWeight.set(all_Weight, new BigNumber(0));
        this.manager.set(address, value);
        var order = this.notice.get(purpose) || [];
        order.push(permissions);
		this.notice.put(purpose, order);
		this.notice.put(this._index, [purpose, permissions]);
		this._index = this._index.plus(new BigNumber(1));
        this._arrFrom = [];
        this._addressOfChange = [];
        this._addressDel = "";
        return [purpose, permissions];
	},
	
	add: function(address, value){   
		var addressWeight = this.manager.get(address) || new BigNumber(0); 
		if(addressWeight.gte(new BigNumber(10))){
			throw new Error('当前地址已有权限，无法对其进行增加权限操作！');
		}    
		if(this._addressOfDel == address  || this.isFreezeAddress(address)){
			throw new Error('非常抱歉，当前地址已被列入待删除或冻结列表，暂停增加权限！！');
       }
		var address = address;
		var value = value;  
		var arrFrom = this._arrFrom;   
		var all_Weight = "totalWeight";
		var startTime = "startTime";
		var targetTime = new BigNumber(200);
		var targerValue = new BigNumber(50);
		var purpose = "add";
		var addressOfChange = this._addressOfChange;
		var arr = this.condition(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange);
        return arr;
	},
    
    update: function(address, value){
		var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(addressWeight.lt(new BigNumber(10))){
			throw new Error('当前地址没有权限，请先增加权限再进行更新操作！');
		}
        if(this._addressOfDel == address  || this.isFreezeAddress(address)){
			throw new Error('非常抱歉，当前地址已被列入待删除或冻结列表，暂停更新权限！！');
        }
        var address = address;
		var value = value;
		var arrFrom = this._arrFrom;   
		var all_Weight = "totalWeight";
		var startTime = "startTime";
		var targetTime = 7*24*60*60*60;
		var targerValue = new BigNumber(50);
		var purpose = "update";   
		var addressOfChange = this._addressOfChange;
	    var arr = this.condition(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange);
		return arr;
    },
    
    del: function(address){
		var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(addressWeight.lte(new BigNumber(0))){
			throw new Error('当前地址没有权限，无法进行删除权限操作！');
		}
		if(this._surplusPermissions.gte(new BigNumber(90))){
			throw new Error('当前地址为最后一个管理者！禁止删除！');
		}
        var address = address;
		var value = new BigNumber(0);
		var arrFrom = this._arrFrom;   
		var all_Weight = "totalWeight";
		var startTime = "startTime";
		var targetTime = 7*24*60*60*60;
		var targerValue = new BigNumber(50);
		var purpose = "del";   
		var addressOfChange = this._addressOfChange;
	    var arr = this.condition(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange);
        return arr;
    },
	
    freezeAddress: function(address){
		var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(addressWeight.lte(new BigNumber(0))){
			throw new Error('当前地址没有权限，无法进行冻结权限操作！');
		}
		if(this._surplusPermissions.gte(new BigNumber(90))){
			throw new Error('当前地址为最后一个管理者！禁止冻结！');
		}
        var address = address;
		var value = addressWeight;
		var arrFrom = this._freezeAddressFrom;   
		var all_Weight = "freezeAddressWeight";
		var startTime = address;
		var targetTime = 24*60*60*60;
		var targerValue = addressWeight;
		var purpose = "freeze";
        var addressOfChange = this._freezeAddressOfChange;
        var arr = this.condition(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange);       
        return arr;
    },
   
   freezeContract: function(){
	    var contract = Blockchain.transaction.to;
   	    var addressWeight = this.manager.get(contract) || new BigNumber(0);
		if(this._surplusPermissions.gte(new BigNumber(90))){
			throw new Error('当前地址为最后一个管理者！禁止冻结！');
		}
        var address = contract;
		var value = addressWeight;
		var arrFrom = this._freezeContractFrom;   
		var all_Weight = "freezeContractWeight";
		var startTime = contract;
		var targetTime = 24*60*60*60;
		var targerValue = new BigNumber(50);
		var purpose = "freeze";
        var addressOfChange = this._freezeContractOfChange;
	    var arr = this.condition(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange);
        return arr;
   },
	
   isFreezeAddress: function(address){
	    var nowFreeze = Date.now();       
		var startFreezeAddressTime = this.time.get(address) || new BigNumber(0); 
		var newFreezeAddress = [];
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(new BigNumber(startFreezeAddressTime));
	    if(timeDifference < 200){		
			return true
		}else{
            return false
        }
    },
	
	isFreezeContract: function(){
		var contract = Blockchain.transaction.to;
		return this.isFreezeAddress(contract);
    },
	
	freezeTime: function(){
		var contract = Blockchain.transaction.to;
		var nowFreeze = Date.now();       
		var arr = [];
		var freezeAddress = this.notice.get("freeze") || [];  
        var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var freezeContractTime = this.time.get(contract) || new BigNumber(0);
		var timeDifference ;
        var startFreeze ;
		for(var i=0; i<freezeAddress.length; i++){
            startFreeze = freezeAddress[i].timeStamp || new BigNumber(0); 
            timeDifference = endFreeze.minus(startFreeze);
            if(timeDifference < 200){
            arr.push([freezeAddress[i].category,freezeAddress[i].address,timeDifference,freezeAddress[i].modificator]); 
            }else{
				arr = ["暂时没有冻结的地址"];
			}
		}
		return arr;		
	},
	
	transfer: function(to, value){
		var from = Blockchain.transaction.from;
		var contract = Blockchain.transaction.to;	
		if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行转账操作！');
		}		
        if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停转账权限！冻结时间24小时！');
		}
		var fromWeight = this.manager.get(from) || new BigNumber(0);
        if(this._addressOfDel == from){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停转账权限！！');
        }
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址没有权限，无法调用资金！");
		}		
		var nowTransfer = Date.now();
		var nowTime = new BigNumber(parseInt(nowTransfer / 1000));
		var valueUnit = new BigNumber(1).mul(new BigNumber(10).pow(18));
		//第一笔转账时候的时间
		var timeAddress = this.transferTime.get(from) || new BigNumber(0);
		//总计在24小时内总计转了多少
		var totalAddressValue = this.totalValue.get(from) || new BigNumber(0);
		//当天第一笔转账时候对应的合约里面的余额
		var addressToContract = this.contractBalance.get(from) || new BigNumber(0);
		//现在合约的余额
		var balanceAll = new BigNumber(Blockchain.getAccountState(contract).balance);
		//当前的时间与第一笔转账时间的差
        var timeDifference = nowTime.minus(timeAddress);
		var value = new BigNumber(value);
		if(balanceAll.lt(new BigNumber(value).mul(valueUnit))){
			throw new Error("当前合约账户没有足够的钱用于转账，请减少转账金额！");
		}
		//如果该地址对应的权重大于等于40  就可以任意提取合约余额
		if(fromWeight.gte(new BigNumber(40))){
			Blockchain.transfer(to, new BigNumber(value).mul(valueUnit));
		}else{
			if(timeDifference > 200){
				var valueDifference = (fromWeight.div(new BigNumber(100)).mul(balanceAll)).minus(new BigNumber(value).mul(valueUnit));		
				if(valueDifference.gte(new BigNumber(0))){
					this.contractBalance.set(from, balanceAll);
					this.transferTime.set(from, nowTime);
					Blockchain.transfer(to, new BigNumber(value).mul(valueUnit));                   
					this.totalValue.set(from, new BigNumber(value).mul(valueUnit));
					this.addressBalance.set(from,valueDifference);
				}else{
					throw new Error("超过该权限提现额度，请减少提现金额！");
				}
			}else{
				var valueDifference = (fromWeight.div(new BigNumber(100)).mul(addressToContract)).minus(totalAddressValue.plus(new BigNumber(value).mul(valueUnit)));		
				if(valueDifference.gte(new BigNumber(0))){
					Blockchain.transfer(to, new BigNumber(value).mul(valueUnit));
					totalAddressValue = totalAddressValue.plus(new BigNumber(value).mul(valueUnit));
					this.totalValue.set(from, totalAddressValue);
					this.addressBalance.set(from,valueDifference);
				}else{
					throw new Error("超过该权限剩余提现额度，请减少提现金额！");
				}
			}						
		}
		//提完了后进行记录
		var transferNas = new TransferNas();
		transferNas.from = from;
		transferNas.to = to;
		transferNas.value = value;
		transferNas.timeStamp = nowTime;
		var order = this.notice.get("transfer") || [];
		this.transferNotice.put(this._indexTransfer, ["transfer",transferNas]);
		this.transferNotice.put("transfer",order.push([transferNas]));
        this._indexTransfer = this._indexTransfer.plus(new BigNumber(1));
		return ["transfer",transferNas]
	},
	
	transferOfAddress: function(address){
		var transferRecords = this.transferNotice.get("transfer") || [];
		var arr = [];
		for(var i=0; i< transferRecords.length; i++){
            var from = transferRecords[i].from;
			var to = transferRecords[i].to;
			if(from == address || to == address){
				arr.push(transferRecords[i]);
			}
		}
		return arr;
	},
	
	getBalance: function(){       
		var contract = Blockchain.transaction.to;
		var arr = [];		
		var _managerOrder = [];
		var fromBalance;
		var address;
		var weight;
		var timeAddress;
		var fromWeight;
		var totalValue;
		var nowTime = Date.now();
		var timeDifference;
        nowTime =  new BigNumber(parseInt(nowTime / 1000));
		var balanceAll = new BigNumber(Blockchain.getAccountState(contract).balance);
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i) || new BigNumber(0);
            weight = new BigNumber(_managerOrder[0].weight);
			address = _managerOrder[0].address;
			if(weight.gte(new BigNumber(10))){				
				timeAddress = this.transferTime.get(address) || new BigNumber(0);
				timeDifference = nowTime.minus(timeAddress);
				fromWeight = this.manager.get(address);				
				if(fromWeight.lt(new BigNumber(40))){
					if(timeDifference < 200){
						totalValue = this.totalValue.get(address);
						fromBalance = this.addressBalance.get(address) || new BigNumber(0);
						arr.push([address,weight,timeDifference,totalValue.div(new BigNumber(10).pow(18)),fromBalance.div(new BigNumber(10).pow(18))]);				
					}else{
						fromBalance = (fromWeight.div(new BigNumber(100)).mul(balanceAll));
						arr.push([address,weight,new BigNumber(0),new BigNumber(0),fromBalance.div(new BigNumber(10).pow(18))]);
					}
				}else{
					arr.push([address,weight,"所有者权限没有时间限制","所有者权限没有金额限制",balanceAll.div(new BigNumber(10).pow(18))]);
				}
			}
            _managerOrder = [];		
		}		
		return arr;
	},
	
	//查询权限和权重
	getAddressWeight: function(address){
		var addressValue = this.manager.get(address) || new BigNumber(0);
		if(addressValue.gte(new BigNumber(30))){
			return "当前地址为所有者权限，权重为："+addressValue;
		}else if(addressValue.gte(new BigNumber(10)) && addressValue.lt(new BigNumber(30))){
			return "当前地址为管理者权限，权重为："+addressValue;
		}else{
			return "当前地址没有权限！";
		}
	},
	
	//全部管理者
	allManager:  function(){
		var address;
		var arr = [];
		var weight;
		for(var i=0; i< this.notice.get("add").length; i++){
			address = this.notice.get("add")[i].address;
        weight = this.manager.get(address) || 0 ;
			if(weight.lt(new BigNumber(30)) && weight.gte(new BigNumber(10))){
				arr.push(["管理者权限", address, weight]);
			}else if(weight.lte(new BigNumber(100)) && weight.gte(new BigNumber(30))){
				arr.push(["所有者权限", address, weight]);
			}
		}
		return arr;
	},
    
	//当前被冻结的地址的改变信息
	prefreezingAddress: function(){
		var nowTime = Date.now();
        nowTime = new BigNumber(parseInt(nowTime / 1000));
        var changeOrder = this._freezeAddressOfChange || [];
        var startTime = changeOrder[2] || new BigNumber(0);
        var timeDifference = nowTime.minus(startTime);
        if (timeDifference > 86400) {
            return ["暂时没有待处理操作！"];
        }else{
            return [changeOrder[0], changeOrder[1], timeDifference, changeOrder[3], changeOrder[4]];
        }
	},
	
	//当前被冻结的地址的改变信息
	prefreezingContract: function(){
		var nowTime = Date.now();
        nowTime = new BigNumber(parseInt(nowTime / 1000));
        var changeOrder = this._freezeContractOfChange || [];
        var startTime = changeOrder[2] || new BigNumber(0);
        var timeDifference = nowTime.minus(startTime);
        if (timeDifference > 86400) {
            return ["暂时没有待处理操作！"];
        }else{
            return [changeOrder[0], changeOrder[1], timeDifference, changeOrder[3], changeOrder[4]];
        }
	},
	//当前被操作权限的改变信息，说明每次只能进行一个操作。不能同时增加或删除之类的
	pretreatment: function(){
		var nowTime = Date.now();
        nowTime = new BigNumber(parseInt(nowTime / 1000));
        var changeOrder = this._addressOfChange || [];
        var startTime = changeOrder[3] || new BigNumber(0);
        var timeDifference = nowTime.minus(startTime);
        if (timeDifference > 604800) {
            return ["暂时没有待处理操作！"];
        }else{
            return [changeOrder[0], changeOrder[1], changeOrder[2], timeDifference, changeOrder[4]];
        }
    },
	
	allWeight: function(){
		return this.totalWeight.get("totalWeight") || new BigNumber(0);
	},
	
    freezeContractWeight: function(){
		return this.totalWeight.get("freezeContractWeight") || new BigNumber(0);
	},
        
    freezeAddressWeight: function(){
		return this.totalWeight.get("freezeAddressWeight") || new BigNumber(0);
	},
	
	addRecords: function(){
		return this.notice.get("add") || [];
	},
	
	updateRecords: function(){
		return this.notice.get("update") || [];
	},
	
	delRecords: function(){
		return this.notice.get("del") || [];
	},
	
	transferRecords: function(){
		return this.transferNotice.get("transfer") || [];
	},
	
	freezeRecords: function(){
		return this.notice.get("freeze") || [];
	},
	
	totalWeightAddress: function(){
		return this._arrFrom;
	},
        
    freezeAddressFrom: function(){
		return this._freezeAddressFrom;
	},
       
    freezeContractFrom: function(){
		return this._freezeContractFrom;
	},
    
	managerAmount: function(){
		var managerAmount = this.allManager();
		return managerAmount.length;
	},
	
	surplusPermissions: function(){
		return this._surplusPermissions;
	},

    accept: function() {
        //code
    }
    //如果真的不幸，把所有的地址都给弄没见了，那么合约会在没有任何调用的情况下，在某个相当长的时间内，会自动发送给一个安全账户	
};
module.exports = Jurisdiction;
