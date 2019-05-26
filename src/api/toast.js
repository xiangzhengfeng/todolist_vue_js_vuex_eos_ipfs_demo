import { Toast, Dialog } from 'vant';

export const toast = {
  show() {
    Toast.loading({
      message: '正在拼命从EOS区块链中加载信息，请稍等！',
      forbidClick: true,
      loadingType: 'spinner',
      duration: 0
    });
  },
  hide() {
    Toast.clear()
  },
  info() {
    Toast.loading({
      message: '与EOS区块链交互中，请稍等！',
      forbidClick: true,
      loadingType: 'spinner',
      duration: 0
    });
  },
  success(type, hash) {
    Toast.success(type + '成功！交易哈希：' + hash, 3);
  },
  fail(text) {
    Toast.fail(text, 3);
  },
  dialog(text) {
    this.hide()
    return Dialog.alert({
      title: '提示',
      message: text,
      width: 260,
    })
  }
} 