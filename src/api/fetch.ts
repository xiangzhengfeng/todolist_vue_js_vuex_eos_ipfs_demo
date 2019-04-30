import { api, contract, rpc } from "./config"
import { Modal } from 'antd-mobile';

interface propsAction {
  actor?: string
  permission?: "active" | "owner"
  action?: string
  data: any
}

export const pushAction = async (props: propsAction) => {
  const {
    actor = contract,
    permission = "active",
    action,
    data,
  } = props
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

export const getTableData = async (table: string, pageNo: number = 1, pageSize: number = 20) => {

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