#include <eosio/eosio.hpp>

using namespace eosio;
/**
 * 合约类
 */
CONTRACT yijiaxunkeji : public eosio::contract {

public:
  yijiaxunkeji(name self, name first_receiver, datastream<const char *> ds) : 
  contract(self, first_receiver, ds) {}

  /**
   * 新增
   */
  ACTION add(const std::string& content) { 
    //仅部署合约的账号操作合约
    require_auth( _self );
    //检查写入的事项内容是否是空，为空则抛出错误。
    check(content != "", "Content can not be empty");
    //可以简单的理解为要对合约的值进行操作了。
    todo_t todos( _self, _self.value );
    //新增一条数据 第一个参数可以理解为由谁来负担当前写入数据的资源，第二个就当做是一条item
    todos.emplace( _self, [&](auto& todo){
      //简单的理解为对当前数据库中的数据进行自增操作
      todo.id = todos.available_primary_key();
      todo.content = content;         
      todo.is_done = 0;
    });
  }

  /**
   * 完成
   */
  ACTION done(uint64_t id) {
    require_auth(_self);
    todo_t todos(_self, _self.value);
    //主索引中找id
    auto itr = todos.find(id);
    //简单的理解为检查是否找到了当前数据表的末尾了，如果到了末尾就说明没找到，那就抛出错误。
    check(itr != todos.end(), "Id does not exist");
    //检查当前找到的id的item中is_done是否为0
    check(itr->is_done == 0, "The current task has been completed");
    //修改当前item也就是itr
    todos.modify(itr, _self, [&](auto& todo){
      todo.is_done = 1;
    });
  }

  /**
   * 删除
   */
  ACTION remove(uint64_t id) {
    require_auth(_self);
    todo_t todos(_self, _self.value);
    auto itr = todos.find(id);
    check(itr != todos.end(), "Id does not exist");
    check(itr->is_done == 1, "Current task is not complete. Delete is not allowed");
    //删除找到的这条id的数据itr
    todos.erase( itr );
  }

  //待办事项表
  TABLE todotable {
    uint64_t id;              //自增id
    std::string content;      //内容
    uint64_t is_done;         //是否完成 0 未完成  1 完成
    //简单的理解为搜索的主要关键词，此处是id，那么查询数据表的时候
    //就是用id来检索数据。这也就是上面的 find(id)能够找到itr的原因
    uint64_t primary_key() const { return id; }
  };

  typedef multi_index<"todotable"_n, todotable> todo_t;
};