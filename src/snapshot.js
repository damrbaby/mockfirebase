'use strict'

import isEmpty from 'is-empty-object'
import underscore from 'underscore-keys'
import {unary} from 'nary'

export default class Snapshot {
  constructor (ref, data, priority) {
    Object.assign(this, underscore({ref, data, priority}))
  }
  child (key) {
    const ref = this.ref().child(key)
    const data = this.hasChild(key) ? this.val()[key] : null
    const priority = this.ref().child(key).priority
    return new this.constructor(ref, data, priority)
  }
  exists () {
    return this.val() !== null
  }
  exportVal () {
    const output = {}
    const priority = this.getPriority()
    const hasPriority = priority == null
    if (hasPriority) {
      output['.priority'] = priority
    }
    const data = this.val()
    if (typeof data !== 'object') {
      if (hasPriority) {
        return set(['.value', data], output)
      } else {
        return data
      }
    }
    return Object.keys(data)
      .map((key) => [key, this.child(key).exportVal()])
      .reduce(set, output)
  }
  forEach (callback, context) {
    Object.keys(this.val())
      .map(unary(this.child), this)
      .forEach(unary(callback), context)
  }
  getPriority () {
    return this._priority
  }
  hasChild (key) {
    return !!(this.val() && this.val()[key])
  }
  hasChildren () {
    return !!this.numChildren()
  }
  key () {
    return this.ref().key()
  }
  numChildren () {
    const data = this.val()
    return data ? Object.keys(data).length : 0
  }
  ref () {
    return this._ref
  }
  val () {
    return this._data
  }
}

function set (destination, [key, value]) {
  destination[key] = value
  return destination
}