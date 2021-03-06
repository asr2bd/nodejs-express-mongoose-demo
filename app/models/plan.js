
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Imager = require('imager')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , imagerConfig = require(config.root + '/config/imager.js')
  , Schema = mongoose.Schema



/**
 * Plan Schema
 */

var PlanSchema = new Schema({
  title: {type : String, default : '', trim : true},
  body: {type : String, default : '', trim : true},
  user: {type : Schema.ObjectId, ref : 'User'},
  start: Date,
  end: Date,
  comments: [{
    body: { type : String, default : '' },
    user: { type : Schema.ObjectId, ref : 'User' },
    createdAt: { type : Date, default : Date.now }
  }],
  createdAt  : {type : Date, default : Date.now}
})

/**
 * Validations
 */

PlanSchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Plan title cannot be blank')

PlanSchema.path('body').validate(function (body) {
  return body.length > 0
}, 'Plan body cannot be blank')

/**
 * Methods
 */

PlanSchema.methods = {

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   */

  addComment: function (user, comment, cb) {
    
    //var notify = require('../mailer/notify')
    this.comments.push({
      body: comment.body,
      user: user._id
    })

    /*notify.comment({
      article: this,
      currentUser: user,
      comment: comment.body
    })*/

    this.save(cb)
  }

}

/**
 * Statics
 */

PlanSchema.statics = {

  /**
   * Find plan by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email')
      .populate('comments.user')
      .exec(cb)
  },

  /**
   * List plans
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .populate('user', 'name')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }

}

mongoose.model('Plan', PlanSchema)
