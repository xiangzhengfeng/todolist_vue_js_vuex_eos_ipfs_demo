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
		_freeze: null,
		_news: null,
		_arrAddFrom: null,
        _arrUpdateFrom: null,
        _arrDelFrom: null,
		_addressOfChange: null,
        _addressOfDel: null,
        _freezeContractFrom: null,
        _freezeAddressFrom: null, 
		_managerAmount: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
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
		_addRecords: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_updateRecords: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_delRecords: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_transferRecords: {
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
		managerOrder: {
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		addNotice: {
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		updateNotice: {
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		delNotice: {
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
        },
		freeze: {
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		addressBalance: {
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
		this._freeze = false;
		this._arrAddFrom = [];
        this._arrUpdateFrom = [];
        this._arrDelFrom = [];
		this._addressOfChange = [];
        this._freezeContractFrom = [];
        this._freezeAddressFrom = [];
        this._addressOfDel = "";
        this._news = "";
		//总权限值始终是100，不能更改。
		this._totalPermissions = new BigNumber(100);
		//增加管理者的总权重初始化为50，可以在增加管理者那儿快速增加一个。
		this.totalWeight.set("addManager", new BigNumber(30));
		this._managerAmount = new BigNumber(0);
		this._delIndex = new BigNumber(0);
		this._addRecords = new BigNumber(0);
		this._updateRecords = new BigNumber(0);
		this._delRecords = new BigNumber(0);
		this._transferRecords = new BigNumber(0);
		var value = new BigNumber(initialWeights);
		this.manager.set(from, value); 
		this._surplusPermissions = this._totalPermissions.minus(value);
		//添加增加管理者记录
		var permissions = new Permissions();
		var now = Date.now();
        permissions.address = from;
		if(value.gte(new BigNumber(30)) && value.lte(new BigNumber(100))){
			permissions.category = "所有者";
		}else{
			throw new Error('初始权重应设置不低于30，不高于100！');
		}
        permissions.weight = this.manager.get(from);	
        permissions.timeStamp = new BigNumber(parseInt(now / 1000));	
		permissions.modificator = [];				
		var _managerOrder = this.managerOrder.get(this._managerAmount) || [];
		_managerOrder.push(permissions);		
        this.managerOrder.put(this._managerAmount, _managerOrder);
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));		
		var _orderAdd = this.addNotice.get("add") || [];
		_orderAdd.push(permissions);
		this.addNotice.put("add", _orderAdd);			  
		this._news = "部署时将部署账户地址设置为OWNER权限，权重:"+value+";剩余未分配权重："+this._surplusPermissions;
		this.addNotice.put(this._addRecords, this._news);
		this._addRecords = new BigNumber(1);
        return permissions;
    },
	add: function(address, value){		
		if(this.isFreezeContract()){            
			throw new Error('当前合约暂时被冻结，无法进行增加权限操作！');
		}
		var addressWeight = this.manager.get(address) || new BigNumber(0);       
		if(addressWeight.gte(new BigNumber(10))){
			throw new Error('当前地址已有权限，无法对其进行增加权限操作！');
		}    
		var from = Blockchain.transaction.from;		
		var value = new BigNumber(value);
		if(this.isFreezeAddress(from) || this.isFreezeAddress(address)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停增加权限！冻结时间24小时！');
		}
        if(this._addressOfDel == from || this._addressOfDel == address){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停增加权限！！');
        }
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._surplusPermissions) || value.lt(new BigNumber(10))){
			throw new Error("增加的权重超过剩余权重或增加权重太少");
		}
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行增加权限操作！");
		}				
		var nowAdd = Date.now();		
		var endAdd = new BigNumber(parseInt(nowAdd / 1000));
		var allWeight = this.totalWeight.get("addManager") || new BigNumber(0);
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange[1] != address){
			this.totalWeight.set("addManager", new BigNumber(0));
            allWeight = this.totalWeight.get("addManager");
			this.time.set("startAdd", endAdd);
            this._arrAddFrom = [];
		}
        var startAdd = this.time.get("startAdd") || new BigNumber(0);
        var timeDifference = endAdd.minus(startAdd);
        for(var i=0; i<=this._arrAddFrom.length; i++){
        	if(this._arrAddFrom[i] == from){
                throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }       
        }
        this._arrAddFrom = this._arrAddFrom.concat([from]);
		this.totalWeight.set("addManager", allWeight.plus(fromWeight));
		allWeight = this.totalWeight.get("addManager");
		//如果时间差大于等于7天   则可以直接增加权限
		if(timeDifference.lt(new BigNumber(300))){
			this._addressOfChange = ["增加权限",address,value,timeDifference];
			if(allWeight.lt(new BigNumber(50))){
				//throw new Error('总权限值低于50，不能联合增加权限！');
				return '总权限值低于50，不能联合增加权限！'
			}else{
				this.time.set("startAdd", endAdd);
			}
		}else{
			this.time.set("startAdd", endAdd);
		}			
		this._surplusPermissions = this._surplusPermissions.minus(value);
		if(this._surplusPermissions.lt(new BigNumber(0))){
			throw new Error('按道理讲这儿应该不能小于零，但是如果这儿报错了，那估计就是某个地方有BUG，暂停增加权限！');
		}
		this.manager.set(address, value);	
		var permissions = new Permissions();
		if(value.gte(new BigNumber(30))){
			permissions.category = "所有者";
		}else{
			permissions.category = "管理者";
		}
        permissions.timeStamp = parseInt(nowAdd / 1000);
        permissions.address = address;
        permissions.weight = this.manager.get(address);		
		permissions.modificator = this._arrAddFrom;				
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			//万一别人一次性删除了多个呢？？
			if(_managerOrder.length == 0){
				_managerOrder.push(permissions);
			    this.managerOrder.put(i, _managerOrder);              
				break;
			}
			_managerOrder = [];
		}
		_managerOrder.push(permissions);
		this.managerOrder.put(this._managerAmount, _managerOrder);	
        //本次的增加记录  这种记录最多只有十个
		var _orderAdd = this.addNotice.get("add") || [];
		_orderAdd.push(permissions);
        //全部的增加记录
		this.addNotice.put("add", _orderAdd);	
		this.totalWeight.set("addManager", new BigNumber(0));
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));
		this._news = "增加了一个"+permissions.category+"权限，权限地址："+address+";权重："+this.manager.get(address)+";更改权重的账户："+this._arrAddFrom.join('、')+";剩余权重："+this._surplusPermissions;		
		this.addNotice.put(this._addRecords, this._news);
		this._addRecords = this._addRecords.plus(new BigNumber(1));
        this._arrAddFrom = [];
        this._addressOfChange = [];
		return permissions;
	},
	
	//更新权限
	update: function(address, value){
		if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行更新权限操作！');
		}
		var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(addressWeight.lt(new BigNumber(10))){
			throw new Error('当前地址没有权限，请先增加权限再进行更新操作！');
		}
		var from = Blockchain.transaction.from;		
		var value = new BigNumber(value);	
		if(this.isFreezeAddress(from) || this.isFreezeAddress(address)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停更新权限！冻结时间24小时！');
		}
        if(this._addressOfDel == from || this._addressOfDel == address){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停更新权限！！');
        }		
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._surplusPermissions.plus(addressWeight)) || value.lt(new BigNumber(10))){
			throw new Error("增加的权重超过剩余权重或增加权重太少");
		}
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，只有所有者才有权限进行更新。无法进行增加权限操作！");
		}		
		var nowUpdate = Date.now();		
		var endUpdate = new BigNumber(parseInt(nowUpdate / 1000));       
		var allWeight = this.totalWeight.get("updateManager") || new BigNumber(0);
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange[1] != address){
			this.totalWeight.set("updateManager", new BigNumber(0));
           allWeight = this.totalWeight.get("updateManager");
			this.time.set("startUpdate", endUpdate);
            this._arrUpdateFrom = [];
		}       
        //如果当前地址权重已经计算到了增加的这个地址里面了，那么程序终止并返回
        for(var i=0; i<this._arrUpdateFrom.length; i++){
        	if(this._arrUpdateFrom[i] == from){
                throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }
        }
		this._arrUpdateFrom = this._arrUpdateFrom.concat([from]);
		this.totalWeight.set("updateManager", allWeight.plus(fromWeight));
        allWeight = this.totalWeight.get("updateManager");
        var startUpdate = this.time.get("startUpdate") || new BigNumber(0);
 		var timeDifference = endUpdate.minus(startUpdate);
		if(from == address && value.lt(addressWeight)){
			//如果把自己的权限降低，那么也可以马上快速通道
			this.time.set("startUpdate", endUpdate);
		}else{
			//如果时间差大于等于7天   则可以直接增加权限
			if(timeDifference.lt(new BigNumber(300))){
				this._addressOfChange =["更新权限",address,value,timeDifference];
				if(allWeight.lt(new BigNumber(50))){
					//throw new Error('总权限值低于50，不能联合增加权限！');
					return '总权限值低于50，不能联合增加权限！'
				}else{
					this.time.set("startUpdate", endUpdate);
				}
			}else{
				this.time.set("startUpdate", endUpdate);
			}
			if(this._surplusPermissions.plus(addressWeight).minus(value).lt(new BigNumber(0))){
				throw new Error('按道理这儿剩余权重是不能小于零的，但是如果报错了，那就是BUG了，终止更新权限！');
			}
		}
		this.manager.set(address, value);	
		this._surplusPermissions = this._surplusPermissions.plus(addressWeight).minus(value);
		var permissions = new Permissions();
		if(value.gte(new BigNumber(30))){
			permissions.category = "所有者";
		}else{
			permissions.category = "管理者";
		}
        permissions.timeStamp = parseInt(nowUpdate / 1000);
        permissions.address = address;
        permissions.weight = this.manager.get(address);		     
		permissions.modificator = this._arrUpdateFrom;
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
        var changeWeightAddress = _managerOrder[0].address;       
            var ddd = (changeWeightAddress == address);            
			if(changeWeightAddress == address){
			    this.managerOrder.put(i, [permissions]);
			}
			_managerOrder = [];
		}
		var _orderUpdate = this.updateNotice.get("update") || [];
		_orderUpdate.push(permissions);
		this.updateNotice.put("update", _orderUpdate);		
		this.totalWeight.set("updateManager", new BigNumber(0));
		this._news = "更新了一个"+permissions.category+"权限，权限地址："+address+";更新后权重："+this.manager.get(address)+";操作更新权限的账户："+this._arrUpdateFrom.join('、')+";剩余权重："+this._surplusPermissions;		
		this.updateNotice.set(this._updateRecords, this._news);	
        this._arrUpdateFrom = [];
        this._addressOfChange = [];
		this._updateRecords = this._updateRecords.plus(new BigNumber(1));
		return permissions;
	},
	
	//删除权限
	del: function(address){
		if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行删除权限操作！');
		}
		var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(addressWeight.lte(new BigNumber(0))){
			throw new Error('当前地址没有权限，无法进行删除权限操作！');
		}
		if(this._surplusPermissions.gte(new BigNumber(90))){
			throw new Error('当前地址为最后一个管理者！禁止删除！');
		}
		var from = Blockchain.transaction.from;
		var fromWeight = this.manager.get(from) || new BigNumber(0);		
		if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停删除权限！冻结时间24小时！');
		}		
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行删除权限操作！");
		}
		if(this._addressOfDel == from){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停增加权限！！');
        }	
		var nowDel = Date.now();
		var endDel = new BigNumber(parseInt(nowDel / 1000));
		var allWeight = this.totalWeight.get("delManager") || new BigNumber(0);
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange[1] != address){
			this.totalWeight.set("delManager", new BigNumber(0));
           allWeight = this.totalWeight.get("delManager");
			this.time.set("startDel", endDel); 	
            this._arrDelFrom = [];
            this._addressOfDel = "";     
		}
        //如果当前地址权重已经计算到了增加的这个地址里面了，那么程序终止并返回
        for(var i=0; i<this._arrDelFrom.length; i++){
        	if(this._arrDelFrom[i] == from){
					throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }
        }
		this._arrDelFrom = this._arrDelFrom.concat([from]);
		//这样貌似每次值都会变化的  只能同一时间段内进行一项  不能即增加又删除又更新的
		this._addressOfDel = address;
		this.totalWeight.set("delManager", allWeight.plus(fromWeight));
		allWeight = this.totalWeight.get("delManager");
        var startDel = this.time.get("startDel") || new BigNumber(0);
 		var timeDifference = endDel.minus(startDel);
		if(from == address){
			//如果把自己的权限降低，那么也可以马上快速通道
			this.time.set("startDel", endDel);
            console.log("startDel",startDel); 
		}else{
			//如果时间差大于等于7天   则可以直接增加权限
			if(timeDifference.lt(new BigNumber(300))){
				this._addressOfChange = ["删除权限",address,0,timeDifference];
				if(allWeight.lt(new BigNumber(50))){
					//throw new Error('总权限值低于50，不能联合增加权限！');
					return '总权限值低于50，不能联合增加权限！'
				}else{
					this.time.set("startDel", endDel);
				}
			}else{
				this.time.set("startDel", endDel);
			}
			if(this._surplusPermissions.plus(addressWeight).lt(new BigNumber(0))){
				throw new Error('按道理这儿是不能够剩余权重小于零的，但是如果报错了，那就是BUG了，终止更新权限！');
			}
		}	
		this.manager.set(address, new BigNumber(0));
		this._surplusPermissions = this._surplusPermissions.plus(addressWeight);
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			if(_managerOrder[0].address == address){
                _managerOrder[0].weight = new BigNumber(0);
				this.managerOrder.put(i, _managerOrder);
			}
		}
		var permissions = new Permissions();
		if(addressWeight.gte(new BigNumber(30))){
			permissions.category = "所有者";
		}else{
			permissions.category = "管理者";
		}
        permissions.timeStamp = parseInt(nowDel / 1000);
        permissions.address = address;
        permissions.weight = this.manager.get(address);		
		permissions.modificator = this._arrDelFrom;
		var _orderDel = this.delNotice.get("del") || [];
		_orderDel.push(permissions);
		this.delNotice.put("del", _orderDel);
		this.totalWeight.set("delManager", new BigNumber(0));
		this._news = "删除了一个"+permissions.category+"权限，权限地址："+address+";权重："+this.manager.get(address)+";操作删除权限的账户："+this._arrDelFrom.join('、')+";剩余权重："+this._surplusPermissions;		
		this.delNotice.put(this._delRecords, this._news);
        this._arrDelFrom = [];
        this._addressOfChange = [];
		this._delRecords = this._delRecords.plus(new BigNumber(1));
		return permissions;
	},
	transfer: function(to, value){
		if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行转账操作！');
		}
		var from = Blockchain.transaction.from;
		var contract = Blockchain.transaction.to;
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
		var timeAddress = this.time.get(from) || new BigNumber(0);
		//总计在24小时内总计转了多少
		var totalAddressValue = this.totalValue.get(from) || new BigNumber(0);
		//当天第一笔转账时候对应的合约里面的余额
		var addressToContract = this.contractBalance.get(from) || new BigNumber(0);
		//现在合约的余额
		var balanceAll = new BigNumber(Blockchain.getAccountState(contract).balance);
        var timeDifference = nowTime.minus(timeAddress);
		var value = new BigNumber(value);
		if(balanceAll.lt(value)){
			throw new Error("当前合约账户没有足够的钱用于转账，请减少转账金额！");
		}
		//如果该地址对应的权重大于等于40  就可以任意提取合约余额
		if(fromWeight.gte(new BigNumber(40))){
			Blockchain.transfer(to, new BigNumber(value).mul(valueUnit));
			this.addressBalance.put(from, new BigNumber(Blockchain.getAccountState(contract).balance));
		}else{
			if(timeDifference > 300){
				var valueDifference = (fromWeight.div(new BigNumber(100)).mul(balanceAll)).minus(totalAddressValue.plus(new BigNumber(value).mul(valueUnit)));		
				if(valueDifference.gte(new BigNumber(0))){
					this.contractBalance.set(from, balanceAll);
					this.time.set(from, nowTime);
					Blockchain.transfer(to, new BigNumber(value).mul(valueUnit));                   
					totalAddressValue = totalAddressValue.plus(new BigNumber(value).mul(valueUnit));
					this.totalValue.set(from, totalAddressValue);
					this.addressBalance.put(from,valueDifference);
				}else{
					throw new Error("超过该权限提现额度，请减少提现金额！");
				}
			}else{
				var valueDifference = (fromWeight.div(new BigNumber(100)).mul(addressToContract)).minus(totalAddressValue.plus(new BigNumber(value).mul(valueUnit)));		
				if(valueDifference.gte(new BigNumber(0))){
					Blockchain.transfer(to, new BigNumber(value).mul(valueUnit));
					totalAddressValue = totalAddressValue.plus(new BigNumber(value).mul(valueUnit));
					this.totalValue.set(from, totalAddressValue);
					this.addressBalance.put(from,valueDifference);
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
		var _transferOrder = [];
		_transferOrder = this.transferNotice.get(this._transferRecords) || [];
		_transferOrder.push(transferNas);
		this.transferNotice.put(this._transferRecords, _transferOrder);
		var _totalRecords = this.transferNotice.get("transfer") || [];
		_totalRecords.push(transferNas);
		this.transferNotice.put("transfer", _totalRecords);
        this._transferRecords = this._transferRecords.plus(new BigNumber(1));
		return transferNas
	},
	freezeContract: function(){
		var from = Blockchain.transaction.from;
		var fromWeight = this.manager.get(from) || new BigNumber(0);		
		if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停增加权限！冻结时间24小时！');
		}
        if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重太低，无法进行冻结！");	
        }
        var allWeight = this.totalWeight.get("freezeContractWeight") || new BigNumber(0);
        for(var i=0; i<this._freezeContractFrom.length; i++){
        	if(this._freezeContractFrom[i] == from){
					throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }
        }
        this.totalWeight.set("freezeContractWeight", allWeight.plus(fromWeight));
        this._freezeContractFrom = this._freezeContractFrom.concat([from]);
		allWeight = this.totalWeight.get("freezeContractWeight");
		if(allWeight.lt(new BigNumber(30))){
			return "当前冻结和权重低于30，无法进行冻结！";
		}
		var nowFreeze = Date.now();
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
		if(timeDifference > 300){
			this.time.set("startFreeze", endFreeze);
			this._freeze = true;
            this._freezeContractFrom = [];
            this.totalWeight.set("freezeContractWeight", new BigNumber(0));
			return "冻结成功，冻结时效为24小时！";
		}else{
			console.log("this._freeze",this._freeze);
			throw new Error("冻结时效未过！");
		}       
	},
    
   freezeAddress: function(address){
   	  var from = Blockchain.transaction.from;
		var fromWeight = this.manager.get(from) || new BigNumber(0);
       var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(this.isFreezeContract()){
			throw new Error('非常抱歉，当前合约已被冻结，冻结时效24小时！');
		}
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重太低，无法进行冻结！");
        }
		var allWeight = this.totalWeight.get("freezeAddressWeight") || new BigNumber(0);  
       if(this._addressOfChange[1] != address){
			this.totalWeight.set("freezeAddressWeight", new BigNumber(0));
           allWeight = this.totalWeight.get("freezeAddressWeight");
            this._freezeAddressFrom = [];          
		}
       this._addressOfChange = ["冻结权限",address,0,timeDifference];
        for(var i=0; i<this._freezeAddressFrom.length; i++){
        	if(this._freezeAddressFrom[i] == from){
             throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }
        }         
        this.totalWeight.set("freezeAddressWeight", allWeight.plus(fromWeight)); 
        this._freezeAddressFrom = this._freezeAddressFrom.concat([from]);
		allWeight = this.totalWeight.get("freezeAddressWeight");
       if(allWeight.lt(addressWeight)){
			return "当前和权重低于冻结的账户地址权限，无法进行冻结！";
       }
		var arr = [];
		var nowFreeze = Date.now();
		var startFreezeAddress = this.freeze.get(address) || [0];  
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(new BigNumber(startFreezeAddress[0]));
       var freezeAddress = this.freeze.get("freezeAddress") || [];  
		if(timeDifference > 300){
		    freezeAddress.push(address);
			this.freeze.put("freezeAddress", freezeAddress);
			this.freeze.put(address,endFreeze);
            this._freezeAddressFrom = [];
            this.totalWeight.put("freezeAddressWeight", new BigNumber(0)); 
            this._addressOfChange = [];
			return "该地址冻结成功，冻结时效为24小时！";
            
		}else{
			throw new Error("该地址冻结时效未过！");
		}     
   },
   
   isFreezeAddress: function(address){
	    var nowFreeze = Date.now();       
		var startFreezeAddress = [];
		var freezeAddress = this.freeze.get("freezeAddress") || [];  
		var newFreezeAddress = [];
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference;
      var n = 0;
        for(var i=0; i<freezeAddress.length; i++){		    
			startFreezeAddress = this.freeze.get(freezeAddress[i])[0] || [0];  
			console.log(startFreezeAddress);
		    timeDifference = endFreeze.minus(new BigNumber(startFreezeAddress));
           if(timeDifference < 300){		
				 newFreezeAddress.push(freezeAddress[i]);
				if(freezeAddress[i] == address){
					n = n +1;
				}
			}else{
				this.freeze.put(freezeAddress[i], new BigNumber(0));
			}
		}
       this.freeze.put("freezeAddress", newFreezeAddress);
       if(n == 1){
           return true
          }else{
          return false
          }
   },
	
	isFreezeContract: function(){
		var nowFreeze = Date.now();       
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);        
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
		if(timeDifference > 300){
			this.time.set("startFreeze", new BigNumber(0));
			this._freeze = false;
			return false
		}else{
			return true
		}
	},
	//查询权限和权重
	queryAddress: function(address){
		var addressValue = this.manager.get(address) || new BigNumber(0);
		if(addressValue.gte(new BigNumber(30))){
			return "当前地址为所有者权限，权重为："+addressValue;
		}else if(addressValue.gte(new BigNumber(10)) && addressValue.lt(new BigNumber(30))){
			return "当前地址为管理者权限，权重为："+addressValue;
		}else{
			return "当前地址没有权限！";
		}
	},
	
	//全部所有者
	allOwner: function(){
		var _managerOrder = [];
		var arr = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i) || new BigNumber(0);
            var weight = new BigNumber(_managerOrder[0].weight);
			if(weight.gte(new BigNumber(30))){
				arr.push([_managerOrder[0].address,_managerOrder[0].weight]);
			}
        _managerOrder = [];
		}  
		return arr;
	},
	
	//全部管理者
	allManager:  function(){
		var _managerOrder = [];
		var arr = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i) || new BigNumber(0);
            var weight = new BigNumber(_managerOrder[0].weight);
			if(weight.lt(new BigNumber(30)) && weight.gte(new BigNumber(10))){
				arr.push([_managerOrder[0].address,_managerOrder[0].weight]);
			}
        _managerOrder = [];
		}
		return arr;
	},
	
	addRecords: function(){
		return this.addNotice.get("add") || [];
	},
	
	updateRecords: function(){
		return this.updateNotice.get("update") || [];
	},
	
	delRecords: function(){
		return this.delNotice.get("del") || [];
	},
	
	transferRecords: function(){
		return this.transferNotice.get("transfer") || [];
	},
	
	transferOfAddress: function(address){
		var _transferOrder = [];
		var arr = [];
		for(var i=0; i< this._transferRecords; i++){
			_transferOrder = this.transferNotice.get(i) || [];
            var from = _transferOrder[0].from;
			var to = _transferOrder[0].to;
			if(from == address || to == address){
				arr.push(_transferOrder);
			}
        _transferOrder = [];
		}
		return arr;
	},
	
	getBalance: function(address){       
		var from = Blockchain.transaction.from;
		var contract = Blockchain.transaction.to;		
		var arr = [];
		var fromBalance = this.addressBalance.get(address) || [];
		var timeAddress = this.time.get(address) || new BigNumber(0);
		var nowTime = Date.now();
      nowTime =  new BigNumber(parseInt(nowTime / 1000));
		var timeDifference = nowTime.minus(timeAddress);
		var fromWeight = this.manager.get(from);
		var balanceAll = new BigNumber(Blockchain.getAccountState(contract).balance);
		if(fromWeight.lt(new BigNumber(40))){
			if(timeDifference < 300){
				arr.push(fromBalance[0],timeDifference);
			}else{
				fromBalance = (fromWeight.div(new BigNumber(100)).mul(balanceAll));
				arr.push(fromBalance[0]);
			}
		}else{
			arr.push(balanceAll);
		}
		//获取到的是空
		return arr;
	},
	
	surplusPermissions: function(){
		return this._surplusPermissions;
	},
	
	contractFreezeTime: function(){
		if(this.isFreezeContract()){
			var nowFreeze = Date.now();       
			var startFreeze = this.time.get("startFreeze") || new BigNumber(0);        
			var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
			var timeDifference = endFreeze.minus(startFreeze);
			return timeDifference || new BigNumber(0);
		}else{
        return new BigNumber(0);
      }	
	},
	//时间和地址以及最后到期消失处理正确
	addressFreezeTime: function(){
		var nowFreeze = Date.now();       
		var arr = [];
		var freezeAddress = this.freeze.get("freezeAddress") || [];  
       var newFreezeAddress = [];
      var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference ;
      var startFreeze ;
		for(var i=0; i<freezeAddress.length; i++){
             startFreeze = this.freeze.get(freezeAddress[i])[0] || [0]; 
             timeDifference = endFreeze.minus(startFreeze);
            if(timeDifference < 300){
                arr.push([freezeAddress[i],timeDifference]); 
                newFreezeAddress.push(freezeAddress[i]);                
             }	    
		}
        this.freeze.put("freezeAddress", newFreezeAddress);
		return arr;		
		
		//把相同的地址的记录多次了  没有去重 
	},
	
	addWeight: function(){
		return this.totalWeight.get("addManager");
	},
	
	updateWeight: function(){
		return this.totalWeight.get("updateManager") || new BigNumber(0);
	},
	
	delWeight: function(){
		return this.totalWeight.get("delManager") || new BigNumber(0);
	},
   
   freezeContractWeight: function(){
		return this.totalWeight.get("freezeContractWeight") || new BigNumber(0);
	},
        
   freezeAddressWeight: function(){
		return this.totalWeight.get("freezeAddressWeight") || new BigNumber(0);
	},
	
	addWeightAddress: function(){
		return this._arrAddFrom;
	},
	
	updateWeightAddress: function(){
		return this._arrUpdateFrom;
	},
	
	delWeightAddress: function(){
		return this._arrDelFrom;
	},
        
    freezeContractFrom: function(){
		return this._freezeContractFrom;
	},
       
    freezeAddressFrom: function(){
		return this._freezeAddressFrom;
	},
    
	managerAmount: function(){
		var _managerOrder = [];
		var sum = 0;
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i) || new BigNumber(0);
            var weight = new BigNumber(_managerOrder[0].weight);
			if(weight.gte(new BigNumber(10))){
				sum = sum + 1;
			}
        _managerOrder = [];
		}
		return sum;
	},
	
	addressOfChange: function(){		
		return this._addressOfChange;
	},
	
	accept: function(){	
		//code
	}
	//转账时间不清零  估计是没有计算到时间差
	//增加的和权重上面的时间差为零   一个地址一直都在和权重那儿纠结  没有判断当前时间差的这个
	//如果真的不幸，把所有的地址都给弄没见了，那么合约会在没有任何调用的情况下，在某个相当长的时间内，会自动发送给一个安全账户	
};
module.exports = Jurisdiction;
