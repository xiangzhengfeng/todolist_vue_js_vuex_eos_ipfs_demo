#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/system.hpp>
#include <eosio/crypto.hpp>

#include "eos_api.hpp"

using namespace eosio;

/**
 * 合约类
 */
CONTRACT sichuanyijia : public eosio::contract {

public:
  sichuanyijia(name self, name first_receiver, datastream<const char *> ds) : 
    contract(self, first_receiver, ds) {}  

  /**
   * 新增
   */
  ACTION add(const std::string& content) {
    require_auth( _self );
    check(content != "", "content can not be empty");

    todo_t todos( _self, _self.value );
    todos.emplace( _self, [&](auto& todo){
      todo.id = todos.available_primary_key();
      todo.content = content;         
      todo.time = time_point_sec(current_time_point()); 
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
    check(itr != todos.end(), "id does not exist");
    //item中找is_done是否为0
    check(itr->is_done == 0, "The current task has been completed");

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
    check(itr != todos.end(), "id does not exist");
    check(itr->is_done == 1, "Current task is not complete. Delete is not allowed");

    todos.erase( itr );
  }

  //待办事项表
  TABLE todotable {
    uint64_t id;              //自增id
    std::string content;      //内容
    time_point_sec time;      //创建时间
    bool is_done;             //是否完成

    uint64_t primary_key() const { return id; }
  };

  typedef multi_index<"todotable"_n, todotable> todo_t;
};