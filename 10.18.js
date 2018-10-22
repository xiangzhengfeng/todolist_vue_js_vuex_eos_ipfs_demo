'use strict';
var QuanXian = function (obj) {
    this.parse(obj);
};


QuanXian.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },

    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            this.address = data.address;
            this.quanxian = data.quanxian;
            this.quanzhong = data.quanzhong;
			this.timeSeconds = data.timeSeconds;
			this.genggaizhe = date.genggaizhe;
        } else {
            this.address = "";
            this.quanxian = "";
            this.quanzhong = 0;
			this.timeSeconds = 0;
			this.genggaizhe = [];
        }
    }
};


var Domain = function() {
	LocalContractStorage.defineProperties(this, {
		_dongjie: null;
		_xiaoxi: null;
		_arr: null;
		_managerAmount: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_deleteIndex: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_zongquanxianzhi: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_shengyuquanzhong: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
		_caozuojilu: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }
		
    });
	LocalContractStorage.defineMapProperty(this, {
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
		"hequanzhong": {
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
		tongzhi: {
            parse: function (value) {
                return [].concat(JSON.parse(value));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
    });
};

Domain.prototype = {
	
    init: function(chushiquanzhong) {
		var from = Blockchain.transaction.from;
		//zhong quan xian zhi 100
		this._dongjie = false;
		this._arr = [];
		this._zongquanxianzhi = new BigNumber(100);
		this.hequanzhong.set(addManager, new BigNumber(0));
		this.hequanzhong.set(deleteManaer, new BigNumber(0));
		this.hequanzhong.set(Dongjiezijin, new BigNumber(0));
		this.time.set(dongjie, new BigNumber(0));
		this.time.set(startAdd, new BigNumber(0));
		this.time.set(endAdd, new BigNumber(0));
		this.totalValue.set(from, new BigNumber(0));
		this._managerAmount = new BigNumber(0);
		this._deleteIndex = new BigNumber(0);
		var value = new BigNumber(chushiquanzhong)
		this.manager.set(from, value);
		this._shengyuquanzhong = this._zongquanxianzhi.minus(value);
		
		var quanXian = new QuanXian();
		var now = Date.now();
		quanXian.index = this._managerAmount;
        quanXian.timeSeconds = parseInt(now / 1000);
        quanXian.address = from;
		if(value.gte(new BigNumber(30))){
			quanXian.quanxian = "所有者";
		}else{
			throw new Error('初始权重应设置高于30！');
		}
        quanXian.quanzhong = this.manager.get(from);		
		quanXian.genggaizhe = [];
				
		var _managerOrder = this.managerOrder.get(this._managerAmount) || [];
		_managerOrder.push(quanXian);		
        this.ownerOrder.put(this._managerAmount, _managerOrder);
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));
		this._caozuojilu = new BigNumber(1);
		this._xiaoxi = "部署时将部署账户地址设置为OWNER权限，权限值为100！";
		this.tongzhi.set(this._caozuojilu, this._xiaoxi);
		
    },
	
	add: function(address, value){
		if(!this._dongjie){
			throw new Error('当前合约暂时被冻结，无法进行增加权限操作！');
		}
		var valueAddress = this.manager.get(address) || new BigNumber(0);
		if(valueAddress.gt(new BigNumber(10))){
			throw new Error('当前地址已有权限，无法进行增加权限操作！');
		}
		if(this._shengyuquanzhong.lt(new BigNumber(10))){
			throw new Error('剩余权重不足以增加一个管理者！');
		}
		if(this._managerAmount.gt(new BigNumber(10))){
			throw new Error('管理者数量超编！');
		}
		var from = Blockchain.transaction.from;		
		var value = new BigNumber(value);
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._shengyuquanzhong) || value.lt(new BigNumber(10))){
			throw new Error("增加的权重超过剩余权重或增加权重太少");
		}
		var valueFromManager = this.manager.get(from) || new BigNumber(0);
		if(valueFromManager.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行增加权限操作！");
		}
		var allValue = this.hequanzhong.get(addManager);
		this.hequanzhong.set(addManager, allValue.plus(valueFromManager);
		var arr = this._arr;
		arr.push(from);	
		allValue = this.hequanzhong.get(addManager);
		var nowAdd = Date.now();
		if(this.time.get(startAdd) == 0){
			this.time.set(startAdd, new BigNumber(parseInt(nowAdd / 1000)));
		}else{
			this.time.set(endAdd, new BigNumber(parseInt(nowAdd / 1000)));
		}
		//这儿的parseInt的值要验证一下
		var startAdd = this.time.set(startAdd);
		var endAdd = this.time.set(endAdd);
 		var timeCha = endAdd.minus(startAdd);
		this.time.set(startAdd, new BigNumber(parseInt(nowAdd / 1000)));
		//如果时间差大于等于15天   则可以直接更改权限
		if(timeCha < 1296000){
			if(allValue.lt(new BigNumber(50))){
				throw new Error('总权限值低于50，不能联合增加权限！');
			}else{
				this.time.set(startAdd, new BigNumber(0));
				this.time.set(endAdd, new BigNumber(0));
			}
		}else{
			this.time.set(startAdd, new BigNumber(0));
			this.time.set(endAdd, new BigNumber(0));
		}				
		this.manager.set(address, value);	
		this._shengyuquanzhong = this._shengyuquanzhong.minus(value);

		var quanXian = new QuanXian();
		if(value.gte(new BigNumber(30))){
			quanXian.quanxian = "所有者";
		}else{
			quanXian.quanxian = "管理者";
		}
        quanXian.timeSeconds = parseInt(nowAdd / 1000);
        quanXian.address = address;
        quanXian.quanzhong = this.owner.get(address);		
		quanXian.genggaizhe = arr;
				
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			if(_managerOrder == [] && i == this._deleteIndex){
				_managerOrder.push(quanXian);
			    this.managerOrder.put(i, _managerOrder);	
			}
			_managerOrder = [];
		}
		_managerOrder.push(quanXian);
		this.managerOrder.put(this._managerAmount, _managerOrder);	
		
		this.hequanzhong.set(addManager, new BigNumber(0));
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));
		this._arr = [];
		this._caozuojilu = this._caozuojilu.plus(new BigNumber(1));
		this._xiaoxi = "增加了一个OWNER权限，权限地址："+address+";权重："+this.manager.get(address)+";解除权限的账户："+arr.join('、')+";更改权重的账户："+from+";剩余权重："+this._shengyuquanzhong;		
		this.tongzhi.set(this._caozuojilu, this._xiaoxi);
		return quanXian;
	},
	//更新权限
	update: function(address, value){
		if(!this._dongjie){
			throw new Error('当前合约暂时被冻结，无法进行更新权限操作！');
		}
		var valueAddress = this.manager.get(address) || new BigNumber(0);
		if(valueAddress.lt(new BigNumber(10))){
			throw new Error('当前地址没有权限，请先增加权限再进行更新操作！');
		}
		var from = Blockchain.transaction.from;		
		var value = new BigNumber(value);
		if(value.){
			
		}
		//给所有者的赋予的权限值大于剩余权重或者小于10都不能执行
		if(value.gt(this._shengyuquanzhong) || value.lt(new BigNumber(10))){
			throw new Error("增加的权重超过剩余权重或增加权重太少");
		}
		var valueFromManager = this.manager.get(from) || new BigNumber(0);
		if(valueFromManager.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行增加权限操作！");
		}
		var allValue = this.hequanzhong.get(addManager);
		this.hequanzhong.set(addManager, allValue.plus(valueFromManager);
		var arr = this._arr;
		arr.push(from);	
		allValue = this.hequanzhong.get(addManager);
		var nowAdd = Date.now();
		if(this.time.get(startAdd) == 0){
			this.time.set(startAdd, new BigNumber(parseInt(nowAdd / 1000)));
		}else{
			this.time.set(endAdd, new BigNumber(parseInt(nowAdd / 1000)));
		}
		//这儿的parseInt的值要验证一下
		var startAdd = this.time.set(startAdd);
		var endAdd = this.time.set(endAdd);
 		var timeCha = endAdd.minus(startAdd);
		this.time.set(startAdd, new BigNumber(parseInt(nowAdd / 1000)));
		//如果时间差大于等于15天   则可以直接更改权限
		if(timeCha < 1296000){
			if(allValue.lt(new BigNumber(50))){
				throw new Error('总权限值低于50，不能联合增加权限！');
			}else{
				this.time.set(startAdd, new BigNumber(0));
				this.time.set(endAdd, new BigNumber(0));
			}
		}else{
			this.time.set(startAdd, new BigNumber(0));
			this.time.set(endAdd, new BigNumber(0));
		}				
		this.manager.set(address, value);	
		this._shengyuquanzhong = this._shengyuquanzhong.minus(value);

		var quanXian = new QuanXian();
		if(value.gte(new BigNumber(30))){
			quanXian.quanxian = "所有者";
		}else{
			quanXian.quanxian = "管理者";
		}
        quanXian.timeSeconds = parseInt(nowAdd / 1000);
        quanXian.address = address;
        quanXian.quanzhong = this.owner.get(address);		
		quanXian.genggaizhe = arr;
				
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			if(_managerOrder == [] && i == this._deleteIndex){
				_managerOrder.push(quanXian);
			    this.managerOrder.put(i, _managerOrder);	
			}
			_managerOrder = [];
		}
		_managerOrder.push(quanXian);
		this.managerOrder.put(this._managerAmount, _managerOrder);	
		
		this.hequanzhong.set(addManager, new BigNumber(0));
		this._managerAmount = this._managerAmount.plus(new BigNumber(1));
		this._arr = [];
		this._caozuojilu = this._caozuojilu.plus(new BigNumber(1));
		this._xiaoxi = "增加了一个OWNER权限，权限地址："+address+";权重："+this.manager.get(address)+";解除权限的账户："+arr.join('、')+";更改权重的账户："+from+";剩余权重："+this._shengyuquanzhong;		
		this.tongzhi.set(this._caozuojilu, this._xiaoxi);
		return quanXian;
	},
	
	//删除权限
	del: function(address){
		if(!this._dongjie){
			throw new Error('当前合约暂时被冻结，无法进行删除权限操作！');
		}
		var valueAddress = this.manager.get(address) || new BigNumber(0);
		if(valueAddress.lte(new BigNumber(0))){
			throw new Error('当前地址没有权限，无法进行删除权限操作！');
		}
		if(this._managerAmount.lte(new BigNumber(1))){
			throw new Error('管理者数量太少无法进行删除权限操作！');
		}
		var from = Blockchain.transaction.from;
		var valueFromManager = this.manager.get(from) || new BigNumber(0);
		if(valueFromManager.lt(new BigNumber(10))){
			throw new Error("当前账户地址权重小于10，无法进行删除权限操作！");
		}
		if(from === address){
			//删除自己的权限，直接进入快速通道！
		}else{
			var allValue = this.hequanzhong.get(deleteManager);
			this.hequanzhong.set(deleteManager, allValue.plus(valueFromManager);
			var arr = this._arr;
			arr.push(from);	
			allValue = this.hequanzhong.get(deleteManager);
			var nowDel = Date.now();
			if(this.time.get(startDel) == 0){
				this.time.set(startDel, new BigNumber(parseInt(nowDel / 1000)));
			}else{
				this.time.set(endDel, new BigNumber(parseInt(nowDel / 1000)));
			}
			//这儿的parseInt的值要验证一下
			var startDel = this.time.set(startDel);
			var endDel = this.time.set(endDel);
			var timeCha = endAdd.minus(startDel);
			this.time.set(startDel, new BigNumber(parseInt(nowDel / 1000)));
			//如果时间差大于等于15天   则可以直接更改权限
			if(timeCha < 1296000){
				if(allValue.lt(new BigNumber(50))){
					throw new Error('总权限值低于50，不能联合删除权限！');
				}else{
					this.time.set(startDel, new BigNumber(0));
					this.time.set(endDel, new BigNumber(0));
				}
			}else{
				this.time.set(startDel, new BigNumber(0));
				this.time.set(endDel, new BigNumber(0));
			}				
		}
		
		this.manager.set(address, new BigNumber(0));	
		this._shengyuquanzhong = this._shengyuquanzhong.plus(valueAddress);

		
		var _managerOrder = [];
		for(var i=0; i< this._managerAmount; i++){
			_managerOrder = this.managerOrder.get(i);
			if(_managerOrder.address == address){
				this.managerOrder.put(i, []);	
			}
		}
		
		this.hequanzhong.set(deleteManager, new BigNumber(0));
		this._arr = [];
		this._caozuojilu = this._caozuojilu.plus(new BigNumber(1));
		this._xiaoxi = "删除了一个权限，权限地址："+address+";权重："+this.manager.get(address)+";解除权限的账户："+arr.join('、')+";更改权重的账户："+from+";剩余权重："+this._shengyuquanzhong;		
		this.tongzhi.set(this._caozuojilu, this._xiaoxi);
		return quanXian;
	}
};
module.exports = Domain;
