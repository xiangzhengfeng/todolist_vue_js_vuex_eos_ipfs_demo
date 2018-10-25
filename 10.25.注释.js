'use strict';
//声明权限
var Permissions = function (obj) {
    this.parse(obj);
};
//权限里面包含：地址、权限类别、权重、时间戳、更改者
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
//声明转账
var TransferNas = function (obj) {
    this.parse(obj);
};
//转账中包含：发送者、接收者、价值、时间戳
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
//权限
var Jurisdiction = function() {
	LocalContractStorage.defineProperties(this, {
		_freeze: null,                  //冻结
		_news: null,					//消息
		_arrAddFrom: null,				//合力增加某个权限的地址数组
        _arrUpdateFrom: null,			//合力更新某个权限的地址数组
        _arrDelFrom: null,				//合力删除某个权限的地址数组
		_addressOfChange: null,			//每次被增加、更新、删除操作时候的地址记录
        _addressOfDel: null,			//删除权限时候的被删除地址
        _freezeContractFrom: null,		//合力冻结合约的地址数组
        _freezeAddressFrom: null,		//合力冻结某个权限的地址数组
        _freezer: null,					//最终冻结合约的地址数组
		_freezeAddressOfChange: null,	//每次被冻结时候的地址的记录
		_managerAmount: {				//权限操作数量
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_totalPermissions: {			//总权限
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_surplusPermissions: {			//剩余权限
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_addRecords: {					//增加记录条数
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_updateRecords: {				//更新记录条数
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_delRecords: {					//删除记录条数
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },								//转账记录条数
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
        "manager": {					//权限
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"time": {						//时间
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"totalValue": {					//转账总值
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"contractBalance": {			//合约余额
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		"totalWeight": {				//和权重
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
      "addressBalance": {				//在合约里面的该地址当天的余额
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		managerOrder: {					//权限序列
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		addNotice: {					//增加记录
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		updateNotice: {					//更新记录
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		delNotice: {					//删除记录
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		transferNotice: {				//交易记录
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
		freeze: {						//冻结
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
        this._freezer = [];
        this._news = "";
		this._freezeAddressOfChange = [];
		//总权限值始终是100，不能更改。
		this._totalPermissions = new BigNumber(100);
		//增加管理者的总权重初始化为50，可以在增加管理者那儿快速增加一个。
		this.totalWeight.set("addManager", new BigNumber(30));
		this._managerAmount = new BigNumber(0);
		this._addRecords = new BigNumber(0);
		this._updateRecords = new BigNumber(0);
		this._delRecords = new BigNumber(0);
		this._transferRecords = new BigNumber(0);
		//部署合约的时候，赋予当前部署地址权限。
		var value = new BigNumber(initialWeights);
		if(value.lt(new BigNumber(30)) && value.lte(new BigNumber(100))){
			throw new Error('初始权重应设置不低于30，不高于100！');
		}
		//记录当前权限地址的权重
		this.manager.set(from, value); 
		//剩余权重
		this._surplusPermissions = this._totalPermissions.minus(value);
		//添加增加管理者记录
		var permissions = new Permissions();
        
		var now = Date.now();
        permissions.address = from;		
        permissions.weight = this.manager.get(from);	
        permissions.category = "所有者";
        permissions.timeStamp = new BigNumber(parseInt(now / 1000));	
		permissions.modificator = [];				
		var _managerOrder = this.managerOrder.get(this._managerAmount) || [];
		_managerOrder.push(permissions);		
		//把当前增加的记录保存到管理者数量里面去，就可以方便的在更新和删除的时候，对应上每个地址和权限
        this.managerOrder.put(this._managerAmount, _managerOrder);
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));		
		var _orderAdd = this.addNotice.get("add") || [];
		_orderAdd.push(permissions);
		//把当前增加的记录保存到总记录add中去
		this.addNotice.put("add", _orderAdd);			  
		this._news = "部署时将部署账户地址设置为OWNER权限，权重:"+value+";剩余未分配权重："+this._surplusPermissions;
		//保存当前记录到每一条中去，可以一条一条呈现。
		this.addNotice.put(this._addRecords, this._news);
		this._addRecords = new BigNumber(1);
		//返回本次增加权限的记录
        return permissions;
    },
	
	add: function(address, value){		
	    //首先判断合约是否冻结
		if(this.isFreezeContract()){            
			throw new Error('当前合约暂时被冻结，无法进行增加权限操作！');
		}
		var addressWeight = this.manager.get(address) || new BigNumber(0);      
		//如果当前欲增加的地址已经有了权重了，那么不能增加了
		if(addressWeight.gte(new BigNumber(10))){
			throw new Error('当前地址已有权限，无法对其进行增加权限操作！');
		}    
		var from = Blockchain.transaction.from;		
		var value = new BigNumber(value);
		//如果当前待增加的地址和操作地址被列入了冻结名单里面了，那么无法进行增加权限操作
		if(this.isFreezeAddress(from) || this.isFreezeAddress(address)){
			throw new Error('非常抱歉，当前地址已被列入冻结名单，暂停增加权限！冻结时间24小时！');
		}
		//如果当前待增加的地址和操作地址被列入了待删除列表，那么也不能对其进行操作
        if(this._addressOfDel == from || this._addressOfDel == address){
        throw new Error('非常抱歉，当前地址已被列入待删除列表，暂停增加权限！！');
        }
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._surplusPermissions) || value.lt(new BigNumber(10))){
			throw new Error("增加的权重超过剩余权重或增加权重太少");
		}
		//获取当前操作地址的权限值，小于10不能操作
		var fromWeight = this.manager.get(from) || new BigNumber(0);
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行增加权限操作！");
		}				
		var nowAdd = Date.now();		
		//当前时间戳
		var endAdd = new BigNumber(parseInt(nowAdd / 1000));
		//查看当前待增加的权限地址是否与上次待增加的地址一致，如果一致，则将和权重加上。
		//若不一致，和权重重新计算，第一次申请增加的时间点重新计算，地址数组重新计算。
		if(this._addressOfChange[1] != address){
			this.totalWeight.set("addManager", new BigNumber(0));
			this.time.set("startAdd", endAdd);
            this._arrAddFrom = [];
		}
		//获取当前待地址对应的和权重
		var allWeight = this.totalWeight.get("addManager") || new BigNumber(0);		
		//获取当前待增加地址对应的第一次申请增加权限时候的时间戳
        var startAdd = this.time.get("startAdd") || new BigNumber(0);
		//当前时间与第一次申请的时间戳的时间差
        var timeDifference = endAdd.minus(startAdd);
		//查看当前操作地址是否已经在地址数组里面了，如果在，报错，不能提交。
        for(var i=0; i<=this._arrAddFrom.length; i++){
        	if(this._arrAddFrom[i] == from && timeDifference.lt(new BigNumber(604800))){
				throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }       
        }
		//如果不在数组中，那么将当前操作地址加入数组中。
        this._arrAddFrom = this._arrAddFrom.concat([from]);
		//加入当前操作地址的权重到和权重中
		this.totalWeight.set("addManager", allWeight.plus(fromWeight));
		allWeight = this.totalWeight.get("addManager");
		//如果时间差大于等于7*24*60*60秒（7天）   则可以直接增加权限
		if(timeDifference.lt(new BigNumber(604800))){
			//记录当前地址对应的信息： 类别、地址、变化后权限值、第一次申请的时候的时间戳、合力操作的地址数组
			this._addressOfChange = ["增加权限",address,value,startAdd,this._arrAddFrom];
			if(allWeight.lt(new BigNumber(50))){
				//返回  此处是返回 不是报错  因为当无法成功增加权限的时候，我们还需要把当前地址的操作带来的变动记录到合约里面
				return '总权限值低于50，不能联合增加权限！'
			}else{
				//如果时间不到七天，但是和权重大于50，那么就可以直接增加权限了  并把第一次申请时候的时间戳改成现在的时间戳（无大碍）
				this.time.set("startAdd", endAdd);
			}
		}else{
			//如果时间大于了七天，那么无论多少和权重，都可以直接增加权限 并把第一次申请时候的时间戳改成现在的时间戳（无大碍）
			this.time.set("startAdd", endAdd);
		}
		//剩余权重基础上减去增加的权重数变为最终的剩余权重数
		this._surplusPermissions = this._surplusPermissions.minus(value);
		if(this._surplusPermissions.lt(new BigNumber(0))){
			throw new Error('按道理讲这儿应该不能小于零，但是如果这儿报错了，那估计就是某个地方有BUG，暂停增加权限！');
		}
		//记录权重到待增加的地址上去
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
		//遍历权限数量，当发现某个地方对应的长度为零时，说明此处位置的权限被删除过，那么就可以让新增加的这个顶替原来的位置
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			if(_managerOrder.length == 0){
				_managerOrder.push(permissions);
			    this.managerOrder.put(i, _managerOrder);              
				break;
			}
			_managerOrder = [];
		}
		_managerOrder.push(permissions);
		//将当前增加的记录与数量对应
		this.managerOrder.put(this._managerAmount, _managerOrder);	
        //本次的增加记录  这种记录最多只有十个
		var _orderAdd = this.addNotice.get("add") || [];
		_orderAdd.push(permissions);
        //全部的增加记录
		this.addNotice.put("add", _orderAdd);	
		//把和权重归零
		this.totalWeight.set("addManager", new BigNumber(0));
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));
		this._news = "增加了一个"+permissions.category+"权限，权限地址："+address+";权重："+this.manager.get(address)+";更改权重的账户："+this._arrAddFrom.join('、')+";剩余权重："+this._surplusPermissions;		
		//把这条记录记录到相应的增加记录条数上去
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
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange[1] != address){
			this.totalWeight.set("updateManager", new BigNumber(0));
			this.time.set("startUpdate", endUpdate);
            this._arrUpdateFrom = [];
		}       
		var allWeight = this.totalWeight.get("updateManager") || new BigNumber(0);
		var startUpdate = this.time.get("startUpdate") || new BigNumber(0);
 		var timeDifference = endUpdate.minus(startUpdate);
        //如果当前地址权重已经计算到了增加的这个地址里面了，那么程序终止并返回
        for(var i=0; i<this._arrUpdateFrom.length; i++){
        	if(this._arrUpdateFrom[i] == from && timeDifference.lt(new BigNumber(604800))){
				throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            } 
        }
		this._arrUpdateFrom = this._arrUpdateFrom.concat([from]);
		this.totalWeight.set("updateManager", allWeight.plus(fromWeight));
        allWeight = this.totalWeight.get("updateManager");        
		if(from == address && value.lt(addressWeight)){
			//如果把自己的权限降低，那么也可以马上快速通道
			this.time.set("startUpdate", endUpdate);
		}else{
			//如果时间差大于等于7天   则可以直接增加权限
			if(timeDifference.lt(new BigNumber(604800))){
				this._addressOfChange =["更新权限",address,value,startUpdate,this._arrUpdateFrom];
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
		//通过对数量的遍历，找到更新的地址和之前增加的地址相同来改变之前相应地址的值为新值
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
		//这儿只有冻结的操作地址，因为待操作的地址虽然被冻结了，但是依然可以删除掉他的权限
		if(this.isFreezeAddress(from)){
			throw new Error('非常抱歉，当前操作地址已被列入冻结名单，暂停删除权限！冻结时间24小时！');
		}		
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行删除权限操作！");
		}
		//这儿只有冻结的操作地址，因为待操作的地址虽然被列入了删除列表，但是依然可以删除掉他的权限
		if(this._addressOfDel == from){
        throw new Error('非常抱歉，当前操作地址已被列入待删除列表，暂停增加权限！！');
        }	
		var nowDel = Date.now();
		var endDel = new BigNumber(parseInt(nowDel / 1000));
		//查看当前增加的权限地址是否与上次增加的地址一致，如果一致，则将和权重加上。若不一致，和权重重新计算。
		if(this._addressOfChange[1] != address){
			this.totalWeight.set("delManager", new BigNumber(0));
			this.time.set("startDel", endDel); 	
            this._arrDelFrom = [];
			//如果当前被删除地址和上次被删除地址不一样，那么待删除地址也就不一样了
            this._addressOfDel = "";     
		}
		var allWeight = this.totalWeight.get("delManager") || new BigNumber(0);
		var startDel = this.time.get("startDel") || new BigNumber(0);
 		var timeDifference = endDel.minus(startDel);
        //如果当前地址权重已经计算到了增加的这个地址里面了，那么程序终止并返回
        for(var i=0; i<this._arrDelFrom.length; i++){
        	if(this._arrDelFrom[i] == from && timeDifference.lt(new BigNumber(604800))){
				throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            } 
        }
		this._arrDelFrom = this._arrDelFrom.concat([from]);
		//这样貌似每次值都会变化的  只能同一时间段内进行一项  不能即增加又删除又更新的
		this._addressOfDel = address;
		this.totalWeight.set("delManager", allWeight.plus(fromWeight));
		allWeight = this.totalWeight.get("delManager");       
		if(from == address){
			//如果把自己的权限降低，那么也可以马上快速通道
			this.time.set("startDel", endDel);
            console.log("startDel",startDel); 
		}else{
			//如果时间差大于等于7天   则可以直接增加权限
			if(timeDifference.lt(new BigNumber(604800))){
				this._addressOfChange = ["删除权限",address,0,startDel,this._arrDelFrom];
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
		//把当前地址对应的数量号找到后，给该数量号的权重赋值为零
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
		this._addressOfDel = "";
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
			//转账金额限制时间为24小时
			if(timeDifference > 86400){
				//金额差值：当天最多转账数量减去已经转账的数量   
				//这个最多金额是在权重为40以下的地址的权重数量乘以当时第一次转账时候的合约余额
				var valueDifference = (fromWeight.div(new BigNumber(100)).mul(balanceAll)).minus(new BigNumber(value).mul(valueUnit));		
				if(valueDifference.gte(new BigNumber(0))){
					this.contractBalance.set(from, balanceAll);
					this.time.set(from, nowTime);
					Blockchain.transfer(to, new BigNumber(value).mul(valueUnit));                   
					this.totalValue.set(from, new BigNumber(value).mul(valueUnit));
					//记录当前地址当天在合约里面的余额
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
		var _transferOrder = [];
		_transferOrder = this.transferNotice.get(this._transferRecords) || [];
		_transferOrder.push(transferNas);
		//把每条记录记录到相应的转账记录条数上去
		this.transferNotice.put(this._transferRecords, _transferOrder);
		var _totalRecords = this.transferNotice.get("transfer") || [];
		_totalRecords.push(transferNas);
		//把本次转账记录记录到所有转账中去
		this.transferNotice.put("transfer", _totalRecords);
        this._transferRecords = this._transferRecords.plus(new BigNumber(1));
		return transferNas
	},
	//冻结合约
	freezeContract: function(){
		var from = Blockchain.transaction.from;
		var contract = Blockchain.transaction.to;
		var fromWeight = this.manager.get(from) || new BigNumber(0);		
		if(this.isFreezeAddress(from) || this._addressOfDel == from){
			throw new Error('非常抱歉，当前地址已被列入冻结或待删除名单，暂停冻结权限！冻结时间24小时！');
		}
        if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重太低，无法进行冻结！");	
        }
        var allWeight = this.totalWeight.get("freezeContractWeight") || new BigNumber(0);
		var nowFreeze = Date.now();
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
        for(var i=0; i<this._freezeContractFrom.length; i++){
        	if(this._freezeContractFrom[i] ==from && timeDifference.lt(new BigNumber(604800))){
					throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }
        }
        this.totalWeight.set("freezeContractWeight", allWeight.plus(fromWeight));
        this._freezeContractFrom = this._freezeContractFrom.concat([from]);
		allWeight = this.totalWeight.get("freezeContractWeight");
		if(allWeight.lt(new BigNumber(50))){
			return "当前冻结和权重低于30，无法进行冻结！";
		}		
		if(timeDifference > 86400){
			this.time.set("startFreeze", endFreeze);    
            //冻结者为之前地址数组			
    	this._freezer = this._freezeContractFrom;
			var freezeReords = this.freeze.get("freezeReords") || [];
			this._freeze = true;
			//添加当前合约冻结记录到总冻结记录中去
			freezeReords.push([contract, endFreeze, this._freezeContractFrom]);
			this.freeze.put("freezeReords",freezeReords);
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
		if(this.isFreezeAddress(from) || this._addressOfDel == from){
			throw new Error('非常抱歉，当前地址已被列入冻结或待删除名单，暂停冻结权限！冻结时间24小时！');
		}
		if(fromWeight.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重太低，无法进行冻结！");
        }
		
        if(this._freezeAddressOfChange[1] != address){
			this.totalWeight.set("freezeAddressWeight", new BigNumber(0));
            this._freezeAddressFrom = [];          
		}		
		var allWeight = this.totalWeight.get("freezeAddressWeight") || new BigNumber(0);  
		var nowFreeze = Date.now();
		var startFreezeAddress = this.freeze.get(address) || [0];  
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(new BigNumber(startFreezeAddress[0]));
        for(var i=0; i<this._freezeAddressFrom.length; i++){
        	if(this._freezeAddressFrom[i] == from && timeDifference.lt(new BigNumber(604800))){
             throw new Error( "当前地址已经记录到和权重了，无需再次进行");
            }
        }         
        this.totalWeight.set("freezeAddressWeight", allWeight.plus(fromWeight)); 
        this._freezeAddressFrom = this._freezeAddressFrom.concat([from]);
		allWeight = this.totalWeight.get("freezeAddressWeight");
        if(allWeight.lt(addressWeight)){
			//记录当前冻结地址的信息：冻结申请时间、地址数组
			this.freeze.put(address,[endFreeze,this._freezeAddressFrom]);
			//当前待冻结地址信息改变：类型、待冻结地址、时间差、和权重、都有谁参与冻结（地址数组）
			this._freezeAddressOfChange = ["冻结地址", address, timeDifference, allWeight, this._freezeAddressFrom];
			return "当前和权重低于冻结的账户地址权限，无法进行冻结！";
        }		
        var freezeAddress = this.freeze.get("freezeAddress") || [];  
		if(timeDifference > 86400){			
		    freezeAddress.push(address);
			//记录本次冻结地址信息到所有被冻结地址信息中去，得出当前冻结了哪一些账户
			this.freeze.put("freezeAddress", freezeAddress);
			this.freeze.put(address,[endFreeze,this._freezeAddressFrom]);
			var freezeReords = this.freeze.get("freezeReords") || [];
			freezeReords.push([address, endFreeze, this._freezeAddressFrom]);
			//记录本次冻结地址记录到冻结记录中去
			this.freeze.put("freezeReords",freezeReords);
            this._freezeAddressFrom = [];
            this.totalWeight.put("freezeAddressWeight", new BigNumber(0)); 
            this._addressOfChange = [];
			return "该地址冻结成功，冻结时效为24小时！";
            
		}else{
			throw new Error("该地址冻结时效未过！");
		}     
   },
   //判断该地址是否被冻结
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
           if(timeDifference < 86400){		
				 newFreezeAddress.push(freezeAddress[i]);
				 //查看当前地址是否在被冻结地址列表里面
				if(freezeAddress[i] == address){
					n = n + 1;
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
		//每一个判断，就要就是看现在的时间和之前正式被冻结的时候的时间戳之差是否大于限制值
		var nowFreeze = Date.now();       
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);        
		var endFreeze =  new BigNumber(parseInt(nowFreeze / 1000));
		var timeDifference = endFreeze.minus(startFreeze);
		if(timeDifference > 86400){
			this.time.set("startFreeze", new BigNumber(0));
			this._freeze = false;
			return false
		}else{
			return true
		}
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
	//查询该地址的所有交易记录  包括发送和接收的所有记录
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
	//获取余额  当前所有权限地址转账的信息
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
				timeAddress = this.time.get(address) || new BigNumber(0);
				timeDifference = nowTime.minus(timeAddress);
				fromWeight = this.manager.get(address);				
				if(fromWeight.lt(new BigNumber(40))){
					if(timeDifference < 86400){
						totalValue = this.totalValue.get(address);
						fromBalance = this.addressBalance.get(address) || new BigNumber(0);
						//记录当前所有权限地址的转账信息：地址、权重、时间差、24小时总值、24小时余额
						arr.push([address,weight,timeDifference,totalValue.div(new BigNumber(10).pow(18)), fromBalance.div(new BigNumber(10).pow(18))]);				
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
	
	surplusPermissions: function(){
		return this._surplusPermissions;
	},
	//被冻结合约的冻结时间
	freezeContractTime: function(){
		var arr = [];
		var nowTime = Date.now();
        nowTime = new BigNumber(parseInt(nowTime / 1000));
		var startFreeze = this.time.get("startFreeze") || new BigNumber(0);
        var timeDifference = nowTime.minus(new BigNumber(startFreeze));
        if (timeDifference > 86400) {
            arr.push("合约暂时没有被冻结的处理操作！");
        } else {
            arr.push("冻结合约", timeDifference, this._freezer);
        }
        return arr;
	},
	//当前所有被冻结地址的解禁时间等信息
	freezeAddressTime: function(){
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
            if(timeDifference < 86400){
                arr.push([freezeAddress[i],timeDifference,this.freeze.get(freezeAddress[i])[1]]); 
                newFreezeAddress.push(freezeAddress[i]);                
            }	    
		}
        this.freeze.put("freezeAddress", newFreezeAddress);
		return arr;		
	},
	
	addWeight: function(){
		return this.totalWeight.get("addManager") || new BigNumber(0);
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
        
    freezeAddressFrom: function(){
		return this._freezeAddressFrom;
	},
       
    freezeContractFrom: function(){
		return this._freezeContractFrom;
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
	//当前被冻结的地址的改变信息
	freezeAddressOfChange: function(){
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
	//当前被操作权限的改变信息，说明每次只能进行一个操作。不能同时增加或删除之类的
	addressOfChange: function(){
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

    accept: function() {
        //code
    }
    //如果真的不幸，把所有的地址都给弄没见了，那么合约会在没有任何调用的情况下，在某个相当长的时间内，会自动发送给一个安全账户	
};
module.exports = Jurisdiction;
