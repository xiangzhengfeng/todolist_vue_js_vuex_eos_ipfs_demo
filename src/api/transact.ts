import { pushAction, getTableData } from "./fetch"

export const add = (content: string) =>
  pushAction({ action: "add", data: { content } })
    .then((res) => {
      return res
    })

export const done = (id: number) =>
  pushAction({ action: "done", data: { id } })
    .then((res) => {
      return res
    })

export const remove = (id: number) =>
  pushAction({ action: "remove", data: { id } })
    .then((res) => {
      return res
    })

export const getData = (table: string, pageNo?: number, pageSize?: number) =>
  getTableData(table, pageNo, pageSize)
    .then((res: any) => {
      return res
    })