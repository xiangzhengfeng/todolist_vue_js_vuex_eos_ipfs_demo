'use strict';

var crypto = require('crypto.js');

var Permissions = function (obj) {
    this.parse(obj);
};
//声明权限：地址 权限类型（大于30为所有者权限，小于30为管理者权重） 权重（总权重为100） 时间戳
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
//声明交易：发送方（发送方为所有者时，无限制。管理者时，每天发送总量比例为当前权重与100的比值） 接收方 值 时间戳
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
		_password: null,//密码
		_arrFrom: null,//变更权限的和权重的地址数组
		_addressOfChange: null,//当前待操作详情
        _freezeContractFrom: null,//当前冻结合约的和权重的地址数组
        _freezeAddressFrom: null,//当前冻结地址的和权重的地址数组
		_freezeAddressOfChange: null,//当前待冻结地址的详情
        _freezeContractOfChange: null,//当前待冻结合约的详情
		_surplusPermissions: {//剩余权重
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_index: {//权限操作记录索引
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_indexTransfer: {//转账操作记录索引
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }
    });
	LocalContractStorage.defineMapProperties(this, {
        "manager": {//记录当前地址的权重值
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"time": {//记录当前操作对应的时间戳
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"totalWeight": {//为操作某个地址权限的和权重值
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"totalValue": {//24小时转账总量
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"contractBalance": {//24小时剩余可支配余额
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
        "addressBalance": {//当前24小时时间段内对应的合约余额
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"transferTime": {//当前第一笔转账发生时的时间戳
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		notice: {//当前增加、删除、冻结、更新等操作的通知记录
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		transferNotice: {//当前转账的通知记录
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
	init: function(initialWeights, passwordHash) {
		var from = Blockchain.transaction.from;
		this._passwordHash = passwordHash;
		this._arrFrom = [];
		this._addressOfChange = [];
        this._freezeContractFrom = [];
        this._freezeAddressFrom = [];
		this._freezeAddressOfChange = [];
        this._freezeContractOfChange = [];
		this._index = new BigNumber(0);
		this._indexTransfer = new BigNumber(0);
		var value = new BigNumber(initialWeights);
		this._surplusPermissions = new BigNumber(100).minus(value);//剩余权重等于总权重100减去当前增加的权重
		this.manager.set(from, value); 
		var now = Date.now();
		var permissions = new Permissions();
        permissions.address = from;
		if(value.gte(new BigNumber(50)) && value.lte(new BigNumber(100))){
			permissions.category = "OWNER";
		}else{
			throw new Error('初始权重应设置不低于50，不高于100！');
		}
        permissions.weight = value;	
        permissions.timeStamp = new BigNumber(parseInt(now / 1000));	
		permissions.modificator = [from];	
		this.notice.put(this._index, ["add", permissions]);//将当前增加记录添加到总记录中
		this.notice.put("add", [permissions]);//将当前增加记录添加到增加序列记录中
		this._index = this._index.plus(new BigNumber(1));
        return ["add",permissions];
    },
	
	condition: function(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange){		
	    if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行操作！');
		}		
		var from = Blockchain.transaction.from;		
        var contract = Blockchain.transaction.to;
		var value = new BigNumber(value);   
        if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单列表，暂时无法操作！！');
        }
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前操作地址没有权限，无法操作！！");
		}		
		var addressWeight = this.manager.get(address) || new BigNumber(0); 
		if(value.gt(this._surplusPermissions.plus(addressWeight)) || value.lt(new BigNumber(0))){
			throw new Error("变动的权重超过剩余权重或变动权重太少");
		}   
		var now = Date.now();		
		var nowTime = new BigNumber(parseInt(now / 1000));
		if(addressOfChange[1] != address){//判断当前待操作地址是否和上一次的地址一致
			this.totalWeight.set(all_Weight, new BigNumber(0));//不一致则让上次待操作地址重新计算为当前地址
			this.time.set(startTime, nowTime);
            arrFrom = [];
		}
		var allWeight = this.totalWeight.get(all_Weight) || new BigNumber(0);   
        var start = this.time.get(startTime) || new BigNumber(0);
        var timeDifference = nowTime.minus(start);         
        for(var i=0; i<=arrFrom.length; i++){//检测当前地址数组中是否有当前操作地址，如果有，不执行。
        	if(arrFrom[i] == from && timeDifference.lt(targetTime)){
				throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }       
        }       
        arrFrom = arrFrom.concat([from]);  
		this.totalWeight.set(all_Weight, allWeight.plus(fromWeight));
		allWeight = this.totalWeight.get(all_Weight);
        if(value.lte(addressWeight) && from == address){
			this.time.set(startTime, nowTime);//如果当前待操作地址和操作地址一致并且现值低于前值，则进入快车道
		}else if(timeDifference.lte(targetTime)){
			//将当前待操作地址以及信息记录
			if(purpose == "add" || purpose == "update" || purpose == "del"){
				this._addressOfChange = [purpose, address, allWeight, start, arrFrom];
			}else if(purpose == "freeze" && contract !== address){
				this._freezeAddressOfChange = ["freezeAddress",address,allWeight,start,arrFrom];	
			}else if(purpose == "freeze" && contract === address){
				this._freezeContractOfChange = ["freezeContract",address,allWeight,start,arrFrom];	
			}
			if(allWeight.lt(targerValue)){
				return '总权限值低于50，不能联合增加权限！'
			}else{
				this.time.set(startTime, nowTime);//如果时间少于目标时间且和权重大于目标权重，则通过
			}
		}else{
			this.time.set(startTime, nowTime);//如果时间大于目标时间，则通过
		}		
		this._surplusPermissions = this._surplusPermissions.plus(addressWeight).minus(value);
		if(this._surplusPermissions.lt(new BigNumber(0)) || this._surplusPermissions.gt(new BigNumber(90))){
			throw new Error('按道理讲这儿应该不能小于零大于90，但是如果这儿报错了，那估计就是某个地方有BUG，暂停操作！！！！！');
		}      //记录本次操作
		var permissions = new Permissions();
		if(value.gte(new BigNumber(30)) && purpose !== "freeze"){
			permissions.category = "OWNER";
		}else if(value.lt(new BigNumber(30)) && value.gte(new BigNumber(10)) && purpose !== "freeze"){
			permissions.category = "MANAGER";
		}else if(purpose == "freeze" && address == contract){
			permissions.category = "Freeze Contract";
		}else if(value.equals(new BigNumber(0)) && address !== contract){
			permissions.category = "No Permissions";
		}else if(purpose == "freeze" && address !== contract){
			permissions.category = "Freeze Address";
		}
        permissions.timeStamp = nowTime;
        permissions.address = address;
        permissions.weight = value;		
		permissions.modificator = arrFrom;	
        this.manager.set(address, value);
        var order = this.notice.get(purpose) || [];
        order.push(permissions);
		this.notice.put(purpose, order);  //把当前操作记录到对应的操作序列中去
		this.notice.put(this._index, [purpose, permissions]);//把当前操作记录到总记录中去
		this._index = this._index.plus(new BigNumber(1));   //记录完后下面所有的都初始化
		this.totalWeight.set(all_Weight, new BigNumber(0));
        this._arrFrom = [];
        this._addressOfChange = [];
        this._freezeAddressOfChange = [];
        this._freezeContractOfChange = [];
        return [purpose, permissions];
	},
	
	add: function(address, value){   
		var addressWeight = this.manager.get(address) || new BigNumber(0); 
        var to = Blockchain.transaction.to;
		if(addressWeight.gte(new BigNumber(10)) || to == address){
			throw new Error('当前地址已有权限或该地址为合约地址，无法对其进行增加权限操作！');
		}
        if(new BigNumber(value).lt(new BigNumber(10))){
			throw new Error('增加的权限权重需超过10');
		}  //增加的地址必须是零权重且非当前合约地址  
		var address = address;
		var value = value;  
		var arrFrom = this._arrFrom;   
		var all_Weight = "totalWeight";
		var startTime = "startTime";
		var targetTime = new BigNumber(200);//最低权重增加一个权限所需要的最少时间跨度
		var targerValue = new BigNumber(50);//所有地址联合增加一个权限所需要的最少和权重
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
		if(this.isFreezeAddress(address)){
			throw new Error('非常抱歉，当前被操作地址已被列入冻结名单列表，暂时无法操作！！');
        }  //更新的地址必须是非零权重且非冻结
        var address = address;
		var value = value;
		var arrFrom = this._arrFrom;   
		var all_Weight = "totalWeight";
		var startTime = "startTime";
		var targetTime = new BigNumber(200);
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
		if(this.managerAmount() == 1){
			throw new Error('当前地址为最后一个管理者！禁止删除！');
		}  //删除地址必须为非零权重地址且管理者数量大于1的情况下才可删除 
        var address = address;
		var value = new BigNumber(0);
		var arrFrom = this._arrFrom;   
		var all_Weight = "totalWeight";
		var startTime = "startTime";
		var targetTime = new BigNumber(200);
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
		}   //当前只有为非零权重的地址才能被冻结
        var address = address;
		var value = addressWeight;
		var arrFrom = this._freezeAddressFrom;   
		var all_Weight = "freezeAddressWeight";
		var startTime = address;
		var targetTime = new BigNumber(200);
		var targerValue = addressWeight;
		var purpose = "freeze";
        var addressOfChange = this._freezeAddressOfChange;
        var arr = this.condition(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange);       
        return arr;
    },
   
    freezeContract: function(){
	    var contract = Blockchain.transaction.to;
   	    var addressWeight = this.manager.get(contract) || new BigNumber(0);
        var address = contract;
		var value = addressWeight;
		var arrFrom = this._freezeContractFrom;   
		var all_Weight = "freezeContractWeight";
		var startTime = contract;
		var targetTime = new BigNumber(200);
		var targerValue = new BigNumber(50);
		var purpose = "freeze";
        var addressOfChange = this._freezeContractOfChange;
	    var arr = this.condition(address, value, all_Weight, startTime, arrFrom, targetTime, targerValue, purpose, addressOfChange);
        return arr;
    },
	
    isFreezeAddress: function(address){
	    var nowFreeze = Date.now();       
		var startFreezeAddressTime = this.time.get(address) || new BigNumber(0); 
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(new BigNumber(startFreezeAddressTime));
	    if(timeDifference.lte(new BigNumber(200))){		  //冻结时间24小时后才能解除冻结
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
		var timeDifference,startFreeze ; //从冻结序列中删选出当前冻结时效内的地址信息数组
		for(var i=0; i<freezeAddress.length; i++){
            startFreeze = freezeAddress[i].timeStamp || new BigNumber(0); 
            timeDifference = endFreeze.minus(startFreeze);
            if(timeDifference.lte(new BigNumber(200))){  //所有冻结的地址信息组合成数组被输出
				arr.push([freezeAddress[i].category,freezeAddress[i].address,timeDifference,freezeAddress[i].modificator]); 
            }
		}   
		return arr;		
	},	
	
	getAddressWeight: function(address){
		var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(addressWeight.gte(new BigNumber(30))){
			return "当前地址为OWNER，权重为："+addressWeight;
		}else if(addressWeight.gte(new BigNumber(10)) && addressWeight.lt(new BigNumber(30))){
			return "当前地址为MANAGER，权重为："+addressWeight;
		}else{
			return "当前地址没有权限！";
		}
	},
	
	allManager:  function(){
		var address, weight;
		var arr = [];
		var arrAddress = [];
		for(var i=0; i< this.notice.get("add").length; i++){
			address = this.notice.get("add")[i].address;
			if(arrAddress.indexOf(address) < 0) {
			    weight = this.manager.get(address) || 0 ;
				arrAddress.push(address);
                if(weight.lt(new BigNumber(30)) && weight.gte(new BigNumber(10))){
					arr.push(["MANAGER", address, weight]);
				}else if(weight.lte(new BigNumber(100)) && weight.gte(new BigNumber(30))){
					arr.push(["OWNER", address, weight]);
				}
			}	
		}  //返回当前所有的权限及地址
		return arr;
	},
	//对当前传入的待操作地址信息的数组进行解析，返回当前待操作的时效等信息
	prefreezing: function(addressOfChange){
		var nowTime = Date.now();
        nowTime = new BigNumber(parseInt(nowTime / 1000));
        if(addressOfChange.length == 0){
            return ["暂时没有待处理操作！"];
        }
        var startTime = new BigNumber(addressOfChange[3]) || new BigNumber(0);
        var timeDifference = nowTime.minus(startTime);
        if (timeDifference.gt(new BigNumber(200))) {
            return ["暂时没有待处理操作！"];
        }else{
            return [addressOfChange[0], addressOfChange[1], timeDifference, addressOfChange[2], addressOfChange[4]];
        }
	},
    
    prefreezingAddress: function(){
      return this.prefreezing(this._freezeAddressOfChange);
    },  //返回当前待冻结的地址的信息
	
	prefreezingContract: function(){
		return this.prefreezing(this._freezeContractOfChange);
    }, //返回当前待冻结的合约的信息
	
	pretreatment: function(){
		return this.prefreezing(this._addressOfChange);
    }, //返回当前待操作的地址的信息
	
	addRecords: function(){
		return this.notice.get("add") || [];
	},
	
	updateRecords: function(){
		return this.notice.get("update") || [];
	},
	
	delRecords: function(){
		return this.notice.get("del") || [];
	},
	
	freezeRecords: function(){
		return this.notice.get("freeze") || [];
	},
    
	managerAmount: function(){
		return this.allManager().length;
	},  //返回所有非零权重的地址数量
	
	surplusPermissions: function(){
		return this._surplusPermissions;
	},
	
	index: function(){
		return this._index;
	},
	
	accept: function() {  //每一次向合约转账都会被记录到转账上去
		var transferNas = new TransferNas();
		transferNas.from = Blockchain.transaction.from;
		transferNas.to = Blockchain.transaction.to;
		transferNas.value = new BigNumber(Blockchain.transaction.value).div(new BigNumber(10).pow(18));
		transferNas.timeStamp = new BigNumber(Blockchain.block.timestamp);
		var order = this.transferNotice.get("transfer") || [];
        order.push(transferNas);
		this.transferNotice.put(this._indexTransfer, ["transfer",transferNas]);
		this.transferNotice.put("transfer",order);
        this._indexTransfer = this._indexTransfer.plus(new BigNumber(1));
    },
	
	transfer: function(to, amount){
		var from = Blockchain.transaction.from;
		var contract = Blockchain.transaction.to;	
		if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行转账操作！');
		}		
        if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前操作地址已被列入冻结名单，暂停转账权限！冻结时间24小时！');
		}
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前操作地址没有权限，无法进行转账操作！");
		}	
		var nowTransfer = Date.now();
		var nowTime = new BigNumber(parseInt(nowTransfer / 1000));
		var valueUnit = new BigNumber(1).mul(new BigNumber(10).pow(18));
		var timeFrom = this.transferTime.get(from) || new BigNumber(0);
		var totalFromValue = this.totalValue.get(from) || new BigNumber(0);
		var fromToContract = this.contractBalance.get(from) || new BigNumber(0);
		var balanceAll = new BigNumber(Blockchain.getAccountState(contract).balance);
        var timeDifference = nowTime.minus(timeFrom);
		var value = new BigNumber(amount).mul(valueUnit);
		if(balanceAll.lt(value) || value.equals(new BigNumber(0))){
			throw new Error("当前转账金额过多或多少！");
		}
		if(fromWeight.gte(new BigNumber(30))){//如果权重不低于30，可以无限制转账
			Blockchain.transfer(to, value);
		}else{  //当前地址第一次转账与现在的时间差是否大于24小时
			if(timeDifference.gt(new BigNumber(200))){   //不大于，所有数据照前面计算
				var valueDifference = (fromWeight.div(new BigNumber(100)).mul(balanceAll)).minus(value);		
				if(valueDifference.gte(new BigNumber(0))){  //当前地址当前转账的金额和当天总金额的差值
					this.contractBalance.set(from, balanceAll);  //记录当前地址当前对应的合约的余额
					this.transferTime.set(from, nowTime);//记录当前地址本第一次转账对应的时间戳
					Blockchain.transfer(to, value);    
					this.totalValue.set(from, value);//记录当前地址当天总转账
					this.addressBalance.set(from,valueDifference);//记录当前地址当天对应的剩余余额
				}else{
					throw new Error("超过该权限剩余提现额度，请减少提现金额！");
				}
			}else{   //大于，则重新计算
				var valueDifference = (fromWeight.div(new BigNumber(100)).mul(fromToContract)).minus(totalFromValue.plus(value));		
				if(valueDifference.gte(new BigNumber(0))){
					Blockchain.transfer(to, value);
					totalFromValue = totalFromValue.plus(value);
					this.totalValue.set(from, totalFromValue);
					this.addressBalance.set(from,valueDifference);
				}else{
					throw new Error("超过该权限剩余提现额度，请减少提现金额！");
				}
			}						
		}
		var transferNas = new TransferNas();
		transferNas.from = from;
		transferNas.to = to;
		transferNas.value = value.div(valueUnit);
		transferNas.timeStamp = nowTime;
		var order = this.transferNotice.get("transfer") || [];
        order.push(transferNas);  //把当前转账记录到总转账中去
		this.transferNotice.put(this._indexTransfer, ["transfer",transferNas]);
		this.transferNotice.put("transfer",order);//记录当前转账到转账序列中去
        this._indexTransfer = this._indexTransfer.plus(new BigNumber(1));
		return ["transfer",transferNas];
	},
	
	transferOfAddress: function(address){
		var transferRecords = this.transferNotice.get("transfer") || [];
		var arr = [];
		var from, to;
		for(var i=0; i< transferRecords.length; i++){
            from = transferRecords[i].from;
			to = transferRecords[i].to;
			if(from == address || to == address){
				arr.push(transferRecords[i]);
			}
		}
		return arr;
	},
	
	getBalance: function(){       
		var contract = Blockchain.transaction.to;
		var arr = [];		
		var addressBalance, address, weight, timeFrom, totalValue, timeDifference;
		var amount = this.allManager();
		var nowTime = Date.now();
        nowTime =  new BigNumber(parseInt(nowTime / 1000));
		var balanceAll = new BigNumber(Blockchain.getAccountState(contract).balance);
		for(var i=0; i< amount.length; i++){
            weight = new BigNumber(amount[i][2]);
			address = amount[i][1];				
			timeFrom = this.transferTime.get(address) || new BigNumber(0);
			timeDifference = nowTime.minus(timeFrom);		
			if(weight.lt(new BigNumber(30))){
				if(timeDifference.lte(new BigNumber(200))){
					totalValue = this.totalValue.get(address);
					addressBalance = this.addressBalance.get(address) || new BigNumber(0);
					arr.push([address,weight,timeDifference,totalValue.div(new BigNumber(10).pow(18)),addressBalance.div(new BigNumber(10).pow(18))]);				
				}else{
					addressBalance = weight.div(new BigNumber(100)).mul(balanceAll);
					arr.push([address,weight,new BigNumber(0),new BigNumber(0),addressBalance.div(new BigNumber(10).pow(18))]);
				}
			}else{
				arr.push([address,weight,"OWNER没有时间限制","OWNER没有金额限制",balanceAll.div(new BigNumber(10).pow(18))]);
			}
		}		
		return arr;
	},
	
	transferRecords: function(){
		return this.transferNotice.get("transfer") || [];
	},
	
	indexTransfer: function(){
		return this._indexTransfer;
	},
	//查询前amount条转账记录
	transferAmount: function(amount){
		var arr = [];
		var len = this._indexTransfer.minus(new BigNumber(amount));
		for(var i=len; i<this._indexTransfer; i++){
			arr.push(this.transferNotice.get(i));
		}
		return arr;
	},
	  //最后一次转账交易的时间戳
	getTransferEndTime: function(){
		var arr = this.transferNotice.get("transfer") || [];
   	    if(arr.length == 0){
			return new BigNumber(Blockchain.block.timestamp);
		}
	    return arr[arr.length-1].timeStamp;
	},
	
	withdraw: function(password, newPasswordHash){//传入部署时设置的密码（原密码，即之前密码哈希值对应的原字符串）
		var passwordHash = crypto.sha256(password);//对传入的原密码进行sha256加密，将加密的与之前的进行对比
		var nowTime = new BigNumber(Blockchain.block.timestamp);
		var endTime = new BigNumber(this.getTransferEndTime());   //完全相同才能提取资金
		if((endTime.plus(new BigNumber(200))).lt(nowTime) && passwordHash === this._passwordHash){
			this._passwordHash = newPasswordHash;//如果继续使用该合约，则可以设置信息的密码，提取时传入信息密码哈希值
			var from = Blockchain.transaction.from;
			var contract = Blockchain.transaction.to;
			var balanceAll = new BigNumber(Blockchain.getAccountState(contract).balance);
			Blockchain.transfer(from, balanceAll);
		}else{
			return passwordHash;
		}
	}
};
module.exports = Jurisdiction;
