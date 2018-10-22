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
		_arr: null,
		_addressOfChange: null,
		_delIndex: null,
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
        }
    });
};

Jurisdiction.prototype = {
	//部署合约时给当前部署合约的地址分配所有者权重，30-100之间！
    init: function(initialWeights) {
		var from = Blockchain.transaction.from;
		this._freeze = false;
		this._arr = [];
		this._addressOfChange = "";
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
        console.log("_orderAdd----------",_orderAdd);
		_orderAdd.push(permissions);
        console.log("_orderAdd----------",_orderAdd[0].address);
		this.addNotice.put("add", _orderAdd);	
		  
		this._news = "部署时将部署账户地址设置为OWNER权限，权重:"+value+";剩余未分配权重："+this._surplusPermissions;
		this.addNotice.put(this._addRecords, this._news);
        console.log(this.addNotice.get(this._addRecords));
		this._addRecords = new BigNumber(1);
        console.log("add--------------",this.addNotice.get("add"));
        return permissions;
    },
	add: function(address, value){
        console.log(this.isFreeze());
		if(this.isFreeze()){
            
			throw new Error('当前合约暂时被冻结，无法进行增加权限操作！');
		}
        
		var addressWeight = this.manager.get(address) || new BigNumber(0);
        
		if(addressWeight.gte(new BigNumber(10))){
			throw new Error('当前地址已有权限，无法对其进行增加权限操作！');
		}
		if(this._managerAmount.gt(new BigNumber(10))){
			throw new Error('管理者数量超编！');
		}
		
		var from = Blockchain.transaction.from;		
		var value = new BigNumber(value);
        console.log("from",from);
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._surplusPermissions) || value.lt(new BigNumber(10))){
			throw new Error("增加的权重超过剩余权重或增加权重太少");
		}
		var fromWeight = this.manager.get(from) || new BigNumber(0);
        console.log("fromWeight",fromWeight);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行增加权限操作！");
		}		
		
		var nowAdd = Date.now();
		
		var endAdd = new BigNumber(parseInt(nowAdd / 1000));
        
 		
        
		var allWeight = this.totalWeight.get("addManager") || new BigNumber(0);
        console.log("allWeight",allWeight);
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange != address){
			this.totalWeight.set("addManager", new BigNumber(0));
			this.time.set("startAdd", endAdd);
            console.log("this._addressOfChange",this._addressOfChange);
		}
        var startAdd = this.time.get("startAdd") || new BigNumber(0);
        console.log("startAdd",startAdd);
        var timeDifference = endAdd.minus(startAdd);
        console.log("timeDifference",timeDifference);
		this._addressOfChange = address;
        console.log("addMana22222222222222222gerWeight",this.totalWeight.get("addManager"));
		this.totalWeight.set("addManager", allWeight.plus(fromWeight));
		var arr = this._arr;
		arr.push(from);	
		allWeight = this.totalWeight.get("addManager");
		console.log("addManage11111111111111111rWeight",this.totalWeight.get("addManager"));
		//如果时间差大于等于7天   则可以直接增加权限
		if(timeDifference.lt(new BigNumber(7*24*60*60))){
			if(allWeight.lt(new BigNumber(50))){
				throw new Error('总权限值低于50，不能联合增加权限！');
				//return '总权限值低于50，不能联合增加权限！'
			}else{
				this.time.set("startAdd", endAdd);
			}
		}else{
			this.time.set("startAdd", endAdd);
		}			
        console.log("startAdd",this.time.get("startAdd"));
        
		this._surplusPermissions = this._surplusPermissions.minus(value);
        console.log("this._surplusPermissions",this._surplusPermissions);
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
		permissions.modificator = arr;
				
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			//万一别人一次性删除了多个呢？？
			if(_managerOrder.length == 0){
				_managerOrder.push(permissions);
			    this.managerOrder.put(i, _managerOrder);
                
				break;
			}
            console.log("this._managerAmount",this._managerAmount);
			_managerOrder = [];
		}
		_managerOrder.push(permissions);
        console.log("_managerOrder",_managerOrder[0].address);
		this.managerOrder.put(this._managerAmount, _managerOrder);	
        //本次的增加记录  这种记录最多只有十个
        console.log("_managerOrder",this.managerOrder.get(this._managerAmount));
		var _orderAdd = this.addNotice.get("add") || [];
		_orderAdd.push(permissions);
        //全部的增加记录
		this.addNotice.put("add", _orderAdd);	
        console.log("addNotice-----------------",this.addNotice.get("add"));
        console.log("addNotice-----------------",this.addNotice.get("add")[0].address);
		
		
		this.totalWeight.set("addManager", new BigNumber(0));
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));
		this._arr = [];
		
		this._news = "增加了一个"+permissions.category+"权限，权限地址："+address+";权重："+this.manager.get(address)+";更改权重的账户："+arr.join('、')+";剩余权重："+this._surplusPermissions;		
		this.addNotice.put(this._addRecords, this._news);
        console.log("this._addRecords",this.addNotice.get(this._addRecords));
		this._addRecords = this._addRecords.plus(new BigNumber(1));
        this._addressOfChange = "";
		return permissions;
	},
	
	//更新权限
	update: function(address, value){
		if(this.isFreeze()){
			throw new Error('当前合约暂时被冻结，无法进行更新权限操作！');
		}
      console.log("this.isFreeze",this.isFreeze());  
		var addressWeight = this.manager.get(address) || new BigNumber(0);
        console.log("addressWeight",addressWeight);  
		if(addressWeight.lt(new BigNumber(10))){
			throw new Error('当前地址没有权限，请先增加权限再进行更新操作！');
		}
		var from = Blockchain.transaction.from;		
		var value = new BigNumber(value);
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._surplusPermissions.plus(addressWeight)) || value.lt(new BigNumber(10))){
			throw new Error("增加的权重超过剩余权重或增加权重太少");
		}
		var fromWeight = this.manager.get(from) || new BigNumber(0);
        console.log("fromWeright",fromWeight); 
		if(fromWeight.lt(new BigNumber(30))){
			throw new Error("当前账户地址权重小于10，只有所有者才有权限进行更新。无法进行增加权限操作！");
		}
		
		var nowUpdate = Date.now();
		
		var endUpdate = new BigNumber(parseInt(nowUpdate / 1000));
        
		var allWeight = this.totalWeight.get("updateManager") || new BigNumber(0);
        console.log("allWeight",allWeight); 
        
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange != address){
			this.totalWeight.set("updateManager", new BigNumber(0));
			this.time.set("startUpdate", endUpdate);
            console.log("updateManager",this.totalWeight.get("updateManager")); 
		}
		this._addressOfChange = address;
		console.log("this._addressOfChange",this._addressOfChange); 
        
		this.totalWeight.set("updateManager", allWeight.plus(fromWeight));
        console.log("updateManager",this.totalWeight.get("updateManager")); 
		var arr = this._arr;
		arr.push(from);	
		allWeight = this.totalWeight.get("updateManager");
        
        var startUpdate = this.time.get("startUpdate") || new BigNumber(0);
        console.log("startUpdate",startUpdate); 
 		var timeDifference = endUpdate.minus(startUpdate);
        console.log("timeDifference",timeDifference); 
		if(from == address && value.lt(addressWeight)){
			//如果把自己的权限降低，那么也可以马上快速通道
			this.time.set("startUpdate", endUpdate);
            console.log("startUpdate------",endUpdate); 
		}else{
			//如果时间差大于等于7天   则可以直接增加权限
			if(timeDifference.lt(new BigNumber(7*24*60*60))){
				if(allWeight.lt(new BigNumber(50))){
					throw new Error('总权限值低于50，不能联合增加权限！');
					//return '总权限值低于50，不能联合增加权限！'
				}else{
					this.time.set("startUpdate", endUpdate);
				}
			}else{
				this.time.set("startUpdate", endUpdate);
			}
			if(this._surplusPermissions.plus(addressWeight).minus(value).lt(new BigNumber(0))){
				throw new Error('按道理这儿是不能够生育权重小于零的，但是如果报错了，那就是BUG了，终止更新权限！');
			}
		}
		this.manager.set(address, value);	
		this._surplusPermissions = this._surplusPermissions.plus(addressWeight).minus(value);
       console.log(address,this.manager.get(address)); 
         console.log("this._surplusPermissions",this._surplusPermissions); 
		var permissions = new Permissions();
		if(value.gte(new BigNumber(30))){
			permissions.category = "所有者";
		}else{
			permissions.category = "管理者";
		}
        permissions.timeStamp = parseInt(nowUpdate / 1000);
        permissions.address = address;
        permissions.weight = this.manager.get(address);		
		permissions.modificator = arr;
        
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			if(_managerOrder.address == address){
				_managerOrder = [];
				_managerOrder.push(permissions);
			    this.managerOrder.put(i, _managerOrder);	
			}
			_managerOrder = [];
		}
		
		var _orderUpdate = this.updateNotice.get("update") || [];
		_orderUpdate.push(permissions);
		this.updateNotice.put("update", _orderUpdate);
				console.log("update",this.updateNotice.get("update")); 			
		
		
		this.totalWeight.set("updateManager", new BigNumber(0));
		this._arr = [];
		
		this._news = "更新了一个"+permissions.category+"权限，权限地址："+address+";更新后权重："+this.manager.get(address)+";操作更新权限的账户："+arr.join('、')+";剩余权重："+this._surplusPermissions;		
		this.updateNotice.set(this._updateRecords, this._news);
        console.log("this._updateRecords",this.updateNotice.get(this._updateRecords)); 	
		this._updateRecords = this._updateRecords.plus(new BigNumber(1));
		return permissions;
	},
	
	//删除权限
	del: function(address){
		if(this.isFreeze()){
			throw new Error('当前合约暂时被冻结，无法进行删除权限操作！');
		}
		var addressWeight = this.manager.get(address) || new BigNumber(0);
		if(addressWeight.lte(new BigNumber(0))){
			throw new Error('当前地址没有权限，无法进行删除权限操作！');
		}
		if(this._surplusPermissions.gte(new BigNumber(90))){
			throw new Error('管理者数量太少无法进行删除权限操作！');
		}
		var from = Blockchain.transaction.from;
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行删除权限操作！");
		}
		
		
		var nowDel = Date.now();
		
		var endDel = new BigNumber(parseInt(nowDel / 1000));
        
        
		var allWeight = this.totalWeight.get("delManager") || new BigNumber(0);
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange != address){
			this.totalWeight.set("delManager", new BigNumber(0));
			this.time.set("startDel", endDel); 	
		}
		//这样貌似每次值都会变化的  只能同一时间段内进行一项  不能即增加又删除又更新的
		this._addressOfChange = address;
		
		this.totalWeight.set("delManager", allWeight.plus(fromWeight));
		var arr = this._arr;
		arr.push(from);	
		allWeight = this.totalWeight.get("delManager");
        var startDel = this.time.get("startDel") || new BigNumber(0);
 		var timeDifference = endDel.minus(startDel);
        console.log("startDel",startDel); 	
        console.log("addressWeight",addressWeight); 
        
		if(from == address){
			//如果把自己的权限降低，那么也可以马上快速通道
			this.time.set("startDel", endDel);
            console.log("startDel",startDel); 
            	
		}else{
			//如果时间差大于等于7天   则可以直接增加权限
			if(timeDifference.lt(new BigNumber(7*24*60*60))){
				if(allWeight.lt(new BigNumber(50))){
					throw new Error('总权限值低于50，不能联合增加权限！');
					//return '总权限值低于50，不能联合增加权限！'
				}else{
					this.time.set("startDel", endDel);
				}
			}else{
				this.time.set("startDel", endDel);
			}
			if(this._surplusPermissions.plus(addressWeight).lt(new BigNumber(0))){
				throw new Error('按道理这儿是不能够生育权重小于零的，但是如果报错了，那就是BUG了，终止更新权限！');
			}
		}		
		
		this.manager.set(address, new BigNumber(0));
		this._surplusPermissions = this._surplusPermissions.plus(addressWeight);
	   console.log(address,this.manager.get(address)); 
        console.log("this._surplusPermissions",this._surplusPermissions); 
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
            
			if(_managerOrder[0].address == address){
                _managerOrder[0].weight = new BigNumber(0);
             console.log(i,_managerOrder);
				this.managerOrder.put(i, _managerOrder);
             
			}
		}
		console.log(0,this.managerOrder.get(0));
		var permissions = new Permissions();
		if(addressWeight.gte(new BigNumber(30))){
			permissions.category = "所有者";
		}else{
			permissions.category = "管理者";
		}
        permissions.timeStamp = parseInt(nowDel / 1000);
        permissions.address = address;
        permissions.weight = this.manager.get(address);		
		permissions.modificator = arr;
		
		var _orderDel = this.delNotice.get("del") || [];
		_orderDel.push(permissions);
		this.delNotice.put("del", _orderDel);
				console.log("del",this.delNotice.get("del"));
		this.totalWeight.set("delManager", new BigNumber(0));
		this._arr = [];
		this._news = "删除了一个"+permissions.category+"权限，权限地址："+address+";权重："+this.manager.get(address)+";操作删除权限的账户："+arr.join('、')+";剩余权重："+this._surplusPermissions;		
		this.delNotice.put(this._delRecords, this._news);
        console.log("this._delRecords",this._news);
		this._delRecords = this._delRecords.plus(new BigNumber(1));
		return permissions;
	},
	transfer: function(to, value){
		if(this.isFreeze()){
			throw new Error('当前合约暂时被冻结，无法进行转账操作！');
		}
		var from = Blockchain.transaction.from;
		var contract = Blockchain.transaction.to;
		var fromWeight = this.manager.get(from) || new BigNumber(0);
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
			Blockchain.transfer(to, new BigNumber(value).valueUnit);	
		}else{
			if(timeDifference > 24*60*60){
				var valueDifference = (totalAddressValue.plus(new BigNumber(value).mul(valueUnit))).lte(fromWeight.div(new BigNumber(100)).mul(balanceAll));		
				if(valueDifference){
					this.contractBalance.set(from, balanceAll);
					this.time.set(from, nowTime);
					Blockchain.transfer(to, new BigNumber(value).valueUnit);
					totalAddressValue = totalAddressValue.plus(new BigNumber(value).mul(valueUnit));
					this.totalValue.set(from, totalAddressValue);
				}else{
					throw new Error("超过该权限提现额度，请减少提现金额！");
				}
			}else{
				var valueDifference = (totalAddressValue.plus(new BigNumber(value).mul(valueUnit))).lte(fromWeight.div(new BigNumber(100)).mul(addressToContract));		
				if(valueDifference){
					Blockchain.transfer(to, new BigNumber(value).valueUnit);
					totalAddressValue = totalAddressValue.plus(new BigNumber(value).mul(valueUnit));
					this.totalValue.set(from, totalAddressValue);
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
		return transferNas
	},
	freeze: function(){
		var from = Blockchain.transaction.from;
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址没有权限，无法进行冻结！");
		}
		var nowFreeze = Date.now();
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
		if(timeDifference > 24*60*60){
			this.time.set("startFreeze", endFreeze);
			this._freeze = true;
			return "冻结成功，冻结时效为24小时！";
		}else{
			console.log("this._freeze",this._freeze);
			throw new Error("冻结时效未过！");
		}       
	},
	
	isFreeze: function(){
		var nowFreeze = Date.now();       
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);        
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
		if(timeDifference >= 24*60*60){
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
	queryAllOwner: function(){
		var _managerOrder = [];
		var arr = [];
		this.managerOrder.put("owner", ["未查询到所有者"]);
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i) || new BigNumber(0);
            var weight = new BigNumber(_managerOrder[0].weight);
			if(weight.gte(new BigNumber(30))){
				arr.push([_managerOrder[0].address,_managerOrder[0].weight]);
				this.managerOrder.put("owner", arr);
			}
        _managerOrder = [];
		}
    
		return this.managerOrder.get("owner");
	},
	
	//全部管理者
	queryAllManager:  function(){
		var _managerOrder = [];
		var arr = [];
        this.managerOrder.put("manager", ["未查询到管理者"]);
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i) || new BigNumber(0);
            var weight = new BigNumber(_managerOrder[0].weight);
			if(weight.lt(new BigNumber(30)) && weight.gte(new BigNumber(10))){
				arr.push([_managerOrder[0].address,_managerOrder[0].weight]);
				this.managerOrder.put("manager", arr);
			}
        _managerOrder = [];
		}
		return this.managerOrder.get("manager");
	},
	
	queryAddRecords: function(){
		return this.addNotice.get("add");
	},
	
	queryUpdateRecords: function(){
		return this.updateNotice.get("update");
	},
	
	queryDelRecords: function(){
		return this.delNotice.get("del");
	},
	queryTransferRecords: function(){
		return this.transferNotice.get("transfer");
	}
	
};
module.exports = Jurisdiction;
