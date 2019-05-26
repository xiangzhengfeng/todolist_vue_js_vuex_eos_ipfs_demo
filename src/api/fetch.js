import { api, contract, rpc } from "./config"

export const pushAction = async (props) => {
  const {
    actor = contract,
    permission = "active",
    action,
    data,
  } = props
  console.log(actor, permission, action, data)
  try {
    const result = await api.transact(
      {
        actions: [
          {
            account: actor,
            name: action,
            authorization: [
              {
                actor,
                permission,
              },
            ],
            data,
          },
        ],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      }
    )
    console.log('获取到结果', result)
    return result
  } catch (error) {
    console.log('错误', error)
    return {}
  }
}

export const getTableData = async (table, pageNo = 1, pageSize = 20) => {

  try {
    const res = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: contract,
      table,
      limit: pageSize,
      reverse: true,
      key_type: 'i64',
      index_position: pageNo
    })
    console.log('获取到结果', res)
    return res
  } catch (error) {
    console.log('错误', error)
    return {}
  }
}