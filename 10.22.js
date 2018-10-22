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
		this._addressOfChange = "";
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
		
        console.log(this.isFreezeContract());
		if(this.isFreezeContract()){
            
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
		if(this.isFreezeAddress(from) || this.isFreezeAddress(address)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停增加权限！冻结时间24小时！');
		}
       console.log("from",from);
        if(this._addressOfDel == from || this._addressOfDel == address){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停增加权限！！');
        }
		
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
            this._arrAddFrom = [];
            console.log("this._addressOfChange",this._addressOfChange);
		}
        var startAdd = this.time.get("startAdd") || new BigNumber(0);
        console.log("startAdd",startAdd);
        var timeDifference = endAdd.minus(startAdd);
        console.log("timeDifference",timeDifference);
        
        
        
        console.log("this._arrAddFrom.length====================================ence",this._arrAddFrom.length);
        for(var i=0; i<=this._arrAddFrom.length; i++){
            console.log("this._arrAddFrom.length====================================ence",this._arrAddFrom.length);
            console.log("this._arrAddFrom.length====================================ence",this._arrAddFrom);
        	if(this._arrAddFrom[i] == from){
            return "当前地址已经被记录到和权重中了，无需再次进行。"
            }
        
        }
        this._arrAddFrom = this._arrAddFrom.concat([from]);
        
        
        
        console.log("arr--qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq---------------",this._arrAddFrom);
        
		this._addressOfChange = address;
        console.log("addMana22222222222222222gerWeight",this.totalWeight.get("addManager"));
		this.totalWeight.set("addManager", allWeight.plus(fromWeight));
		console.log("this._arr--qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq---------------",address);
        
        
        
        
		allWeight = this.totalWeight.get("addManager");
		console.log("addManage11111111111111111rWeight",this.totalWeight.get("addManager"));
		//如果时间差大于等于7天   则可以直接增加权限
		if(timeDifference.lt(new BigNumber(300))){
			if(allWeight.lt(new BigNumber(50))){
				//throw new Error('总权限值低于50，不能联合增加权限！');
				return '总权限值低于50，不能联合增加权限！'
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
		permissions.modificator = this._arr;
				
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
        console.log("addNotice------111111111111111111111-----------",this.addNotice.get("add")[0].address);
		
		
		this.totalWeight.set("addManager", new BigNumber(0));
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));
		
		
		this._news = "增加了一个"+permissions.category+"权限，权限地址："+address+";权重："+this.manager.get(address)+";更改权重的账户："+this._arrAddFrom.join('、')+";剩余权重："+this._surplusPermissions;		
		this.addNotice.put(this._addRecords, this._news);
        console.log("this._addRecords",this.addNotice.get(this._addRecords));
		this._addRecords = this._addRecords.plus(new BigNumber(1));
        this._arrAddFrom = [];
        this._addressOfChange = "";
		return permissions;
	},
	
	//更新权限
	update: function(address, value){
		if(this.isFreezeContract()){
			throw new Error('当前合约暂时被冻结，无法进行更新权限操作！');
		}
      console.log("this.isFreezeContract",this.isFreezeContract());  
		var addressWeight = this.manager.get(address) || new BigNumber(0);
        console.log("addressW11=======================================================eight",addressWeight);  
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
        console.log("fromWeright",fromWeight); 
		if(fromWeight.lt(new BigNumber(10))){
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
            this._arrUpdateFrom = [];
            
            console.log("updateManager",this.totalWeight.get("updateManager")); 
		}
        
        //如果当前地址权重已经计算到了增加的这个地址里面了，那么程序终止并返回
        for(var i=0; i<this._arrUpdateFrom.length; i++){
        	if(this._arrUpdateFrom[i] == from){
            return "当前地址已经被记录到和权重中了，无需再次进行。"
            }
        }
		this._arrUpdateFrom = this._arrUpdateFrom.concat([from]);
        console.log("arr--qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq---------------",this._arrUpdateFrom.length);
        
		this._addressOfChange = address;
		console.log("this._addressOfChange",this._addressOfChange); 
        
        
        
		this.totalWeight.set("updateManager", allWeight.plus(fromWeight));
        console.log("updateManager",this.totalWeight.get("updateManager")); 
        
        		
		
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
			if(timeDifference.lt(new BigNumber(300))){
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
				console.log("update",this.updateNotice.get("update")); 			
		
		
		this.totalWeight.set("updateManager", new BigNumber(0));
		
		
		this._news = "更新了一个"+permissions.category+"权限，权限地址："+address+";更新后权重："+this.manager.get(address)+";操作更新权限的账户："+this._arrUpdateFrom.join('、')+";剩余权重："+this._surplusPermissions;		
		this.updateNotice.set(this._updateRecords, this._news);
        console.log("this._updateRecords",this.updateNotice.get(this._updateRecords)); 	
        this._arrUpdateFrom = [];
        this._addressOfChange = "";
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
			throw new Error('管理者数量太少无法进行删除权限操作！');
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
		if(this._addressOfChange != address){
			this.totalWeight.set("delManager", new BigNumber(0));
			this.time.set("startDel", endDel); 	
            this._arrDelFrom = [];
            this._addressOfDel = "";
            
		}
        
        //如果当前地址权重已经计算到了增加的这个地址里面了，那么程序终止并返回
        for(var i=0; i<this._arrDelFrom.length; i++){
        	if(this._arrDelFrom[i] == from){
            return "当前地址已经被记录到和权重中了，无需再次进行。"
            }
        }
		this._arrDelFrom = this._arrDelFrom.concat([from]);
        console.log("arr--qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq---------------",this._arrDelFrom.length);
        
		//这样貌似每次值都会变化的  只能同一时间段内进行一项  不能即增加又删除又更新的
		this._addressOfChange = address;
		this._addressOfDel = address;
		this.totalWeight.set("delManager", allWeight.plus(fromWeight));
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
			if(timeDifference.lt(new BigNumber(300))){
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
             console.log("adf111111111111111111111111111111111111111111111111111111111a",i,_managerOrder);
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
		permissions.modificator = this._arrDelFrom;
		
		var _orderDel = this.delNotice.get("del") || [];
		_orderDel.push(permissions);
		this.delNotice.put("del", _orderDel);
				console.log("del",this.delNotice.get("del"));
		this.totalWeight.set("delManager", new BigNumber(0));
		
		this._news = "删除了一个"+permissions.category+"权限，权限地址："+address+";权重："+this.manager.get(address)+";操作删除权限的账户："+this._arrDelFrom.join('、')+";剩余权重："+this._surplusPermissions;		
		this.delNotice.put(this._delRecords, this._news);
        this._arrDelFrom = [];
        this._addressOfChange = "";
        console.log("this._delRecords",this._news);
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
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停增加权限！冻结时间24小时！');
		}
		var fromWeight = this.manager.get(from) || new BigNumber(0);
     if(this._addressOfDel == from){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停增加权限！！');
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
			Blockchain.transfer(to, new BigNumber(value).valueUnit);	
		}else{
			if(timeDifference > 300){
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
	freezeContract: function(){
		var from = Blockchain.transaction.from;
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停增加权限！冻结时间24小时！');
		}
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址没有权限，无法进行冻结！");
		}
		var nowFreeze = Date.now();
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
		if(timeDifference > 300){
			this.time.set("startFreeze", endFreeze);
			this._freeze = true;
			return "冻结成功，冻结时效为24小时！";
		}else{
			console.log("this._freeze",this._freeze);
			throw new Error("冻结时效未过！");
		}       
	},
    
   freezeAddress: function(address){
   	  var from = Blockchain.transaction.from;
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(this.isFreezeContract()){
			throw new Error('非常抱歉，当前合约已被冻结，冻结时效24小时！');
		}
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址没有权限，无法进行冻结！");
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
			return "该地址冻结成功，冻结时效为24小时！";
		}else{
			throw new Error("该地址冻结时效未过！");
		}     
   },
   
   isFreezeAddress: function(address){
	    var nowFreeze = Date.now();       
		var startFreezeAddress = this.freeze.get(address) || [0];  
		var freezeAddress = this.freeze.get("freezeAddress") || [];  
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
       
       console.log(startFreezeAddress);
		var timeDifference = endFreeze.minus(new BigNumber(startFreezeAddress[0]));
       
		if(timeDifference > 300){
			this.freeze.put(address, new BigNumber(0));
			for(var i=0; i<freezeAddress.length; i++){
				if(freezeAddress[i] == address){
					freezeAddress.splice(i,1);
				}
			}
			this.freeze.put("freezeAddress", freezeAddress);
            console.log("1111111122222222222333333333344444444444",freezeAddress);
			return false
		}else{
			return true
		}
   },
	
	isFreezeAddress: function(address){
	    var nowFreeze = Date.now();       
		var startFreezeAddress = [];
		var freezeAddress = [];  
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference;
        for(var i=0; i<freezeAddress.length; i++){		    
			startFreezeAddress = this.freeze.get(freezeAddress[i]) || [0];  
			console.log(startFreezeAddress);
		    timeDifference = endFreeze.minus(new BigNumber(startFreezeAddress[0]));
			freezeAddress = this.freeze.get("freezeAddress");
           if(timeDifference > 300){			
			    this.freeze.put(freezeAddress[i], new BigNumber(0));
				freezeAddress.splice(i,1);
				this.freeze.put("freezeAddress", freezeAddress);
				console.log("1111111122222222222333333333344444444444",freezeAddress);
				
			}else{
				return true
			}
		}
		return false
   },  
	
	
	isFreezeContract: function(){
		var nowFreeze = Date.now();       
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);        
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
		if(timeDifference > 100){
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
	allManager:  function(){
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
		this.transferNotice.put(address, ["暂时没有该地址的交易记录！"]);
		for(var i=0; i< this._transferRecords; i++){
			_transferOrder = this.transferNotice.get(i) || [];
            var from = _transferOrder[0].from;
			var to = _transferOrder[0].to;
			if(from == address || to == address){
				arr.push([_transferOrder[0]]);
				this.transferNotice.put(address, arr);
			}
        _transferOrder = [];
		}
		return this.transferNotice.get(address);
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
	
	addressFreezeTime: function(){
		var nowFreeze = Date.now();       
		var arr = [];
		var freezeAddress = this.freeze.get("freezeAddress") || [];  
		for(var i=0; i<freezeAddress.length; i++){
            console.log("11111111111111111",freezeAddress.length);
			arr.push([freezeAddress[i],this.freeze.get(freezeAddress[i])[0]]); 
            console.log("11111111111111111",this.freeze.get(freezeAddress[i]));
		}
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
	
	addWeightAddress: function(){
		return this._arrAddFrom;
	},
	
	updateWeightAddress: function(){
		return this._arrUpdateFrom;
	},
	
	delWeightAddress: function(){
		return this._arrDelFrom;
	},
	
	allFreezeAddress: function(){
		return this.freeze.get("freezeAddress") || [];
	},
	
	managerAmount: function(){
		return this._managerAmount;
	},
	
	//所有的冻结地址都被记录出来了  然而真正的想呈现的当前正在冻结期的地址没有出来
};
module.exports = Jurisdiction;
