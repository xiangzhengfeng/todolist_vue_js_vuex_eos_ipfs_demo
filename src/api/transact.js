import { pushAction } from "./fetch"

export const add = (content) =>
  pushAction({ action: "add", data: { content } })
    .then((res) => {
      return res
    })

export const done = (id) =>
  pushAction({ action: "done", data: { id } })
    .then((res) => {
      return res
    })

export const remove = (id) =>
  pushAction({ action: "remove", data: { id } })
    .then((res) => {
      return res
    })

export const transfer = (content) =>
  pushAction({ 
    actor: 'eosio.token',
    action: "transfer", 
    data: { 
      from: 'sichuanyijia',
      quantity: content,
      quty: '100.0000 EOS',
      memo: 'meiyoumemo'
     } })
    .then((res) => {
      return res
    })