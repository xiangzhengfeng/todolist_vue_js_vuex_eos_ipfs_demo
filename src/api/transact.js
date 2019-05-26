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