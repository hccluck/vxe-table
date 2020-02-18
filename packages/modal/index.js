import XEUtils from 'xe-utils'
import VXEModal from './src/modal'
import queue from './src/queue'
import VXETable from '../v-x-e-table'

var AlertController = null
var AllActivedModal = []

export function Modal (options) {
  return new Promise(resolve => {
    if (options && options.id && queue.some(comp => comp.id === options.id)) {
      resolve('exist')
    } else {
      let events = options.events || {}
      options.events = Object.assign({}, events, {
        hide (params) {
          if (events.hide) {
            events.hide.call(this, params)
          }
          setTimeout(() => $modal.$destroy(), $modal.isMsg ? 500 : 100)
          XEUtils.remove(AllActivedModal, item => item === $modal)
          resolve(params.type)
        }
      })
      let $modal = new AlertController({
        el: document.createElement('div'),
        propsData: options
      })
      setTimeout(() => $modal.open())
      AllActivedModal.push($modal)
    }
  })
}

['alert', 'confirm', 'message'].forEach((type, index) => {
  let defOpts = index === 2 ? {
    mask: false,
    lockView: false,
    showHeader: false
  } : {
    showFooter: true
  }
  defOpts.type = type
  defOpts.dblclickZoom = false
  if (index === 1) {
    defOpts.status = 'question'
  }
  Modal[type] = function (message, title, options) {
    let opts
    if (XEUtils.isObject(message)) {
      opts = message
    } else {
      if (title) {
        opts = { title }
      }
    }
    return Modal(Object.assign({ message: XEUtils.toString(message), type }, defOpts, opts, options))
  }
})

Modal.closeAll = function () {
  AllActivedModal.forEach($modal => $modal.close('close'))
}

Modal.install = function (Vue) {
  VXETable._modal = 1
  Vue.component('vxe-message', VXEModal)
  Vue.component(VXEModal.name, VXEModal)
  AlertController = Vue.extend(VXEModal)
  Vue.prototype.$XMsg = Modal
  Vue.prototype.$XModal = Modal
  VXETable.$modal = Modal
}

export default Modal
