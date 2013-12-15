/*! ember-form-components 2013-12-15 09:50:39 https://github.com/garth/ember-form-components */
EmberFormComponents = EmberFC = Ember.Namespace.create();

EmberFormComponents.Focusable = Ember.Mixin.create({
  focused: false,
  focusIn: function(event) {
    this.set('focused', true);
  },
  focusOut: function(event) {
    this.set('focused', false);
  },
  autofocus: false,
  shouldAutoFocus: function() {
    if (this.get('autofocus')) {
      this.$('input').focus();
    }
  }.on('didInsertElement')
});

EmberFormComponents.AsyncValidation = Ember.Mixin.create({
  label: '',
  value: '',
  statusClass: function () {
    if (this.get('validating')) {
      return 'has-warning';
    }
    else if (this.get('showFieldValidation') || this.get('formController.showFieldValidation')) {
      return this.get('isValid') ? 'has-success' : 'has-error';
    }
    else {
      return '';
    }
  }.property('isValid', 'showFieldValidation', 'formController.showFieldValidation', 'focused', 'validating'),
  classNameBindings: ['statusClass'],
  statusMessage: '',
  message: function () {
    if (!this.get('showMessages')) {
      return '';
    }
    else if (this.get('validating')) {
      return this.get('validatingMessage');
    }
    else if ((!this.get('focused') || this.get('showErrorOnFocus') || this.get('forceShowError') || this.get('isValid')) &&
      (this.get('showFieldValidation') || this.get('formController.showFieldValidation'))) {
      return this.get('statusMessage');
    }
    else {
      return '';
    }
  }.property('isValid', 'showFieldValidation', 'formController.showFieldValidation', 'focused', 'validating'),
  showFieldValidation: false,
  showErrorOnFocus: false,
  forceShowError: false,
  formController: null,
  showMessages: true,
  isValid: false,
  validating: false,
  validatingMessage: 'checking...',

  // register this field with the form controller
  registerFieldWithController: function() {
    this.validateField();
    var validationFields = this.get('formController.validationFields');
    if (validationFields) {
      validationFields.pushObject(this);
    }
  }.on('didInsertElement'),

  // turn on field validation info after first focus
  enableShowFieldValidaion: function () {
    if (!this.get('showFieldValidation')) {
      this.set('showFieldValidation', true);
    }
  }.observes('focused', 'value'),

  // check if the field is valid
  validateField: function () {
    this.set('validating', true);
    var value = this.get('value');
    var isValid = false;
    var self = this;
    // Call the specific validation function, passing the
    // value to validate and a callback to which the function
    // must pass the result of the validation.
    this.validate(value, function (isValid, message, forceShowError) {
      // Make sure that the value hasn't changed since async validation
      if (value === self.get('value')) {
        self.set('statusMessage', message);
        self.set('isValid', isValid);
        self.set('validating', false);
        self.set('forceShowError', !!forceShowError);
      }
    });
  }.observes('value'),

  // base validation function, if we get this far then the field is valid
  validate: function (value, status) {
    status(true, '');
  }
});

EmberFormComponents.InputTextComponent = Ember.Component.extend(
    EmberFormComponents.Focusable, EmberFormComponents.AsyncValidation, {
  classNames: ['form-group'],
  type: 'text',
  placeholder: '',

  required: false,

  shouldEqual: null,
  shouldEqualMessage: null,
  shouldEqualObserver: function () {
    this.validateField();
  }.observes('shouldEqual'),

  regex: null,
  regexMessage: null,

  customValidator: null,
  customValidatorDelay: 0,
  customValidatorTimeout: null,

  validate: function (value, status) {
    // test the regex
    var regexMessage = this.get('regexMessage');
    if (regexMessage && value !== undefined && !value.match(this.get('regex'))) {
      status(false, regexMessage);
    }
    else
    {
      // test the shouldEqual value
      var shouldEqualMessage = this.get('shouldEqualMessage');
      if (shouldEqualMessage && value !== this.get('shouldEqual')) {
        status(false, shouldEqualMessage);
      }
      // test the required flag
      else if (this.get('required') && (!value || value.trim().length === 0)) {
        status(false, this.get('label') + ' is required');
      }
      else {
        // run any custom validator
        var customValidator = this.get('customValidator');
        if (typeof customValidator === 'function') {
          var formController = this.get('formController');
          // if delay is set, only run if no changes are made during the delay time
          var delay = this.get('customValidatorDelay');
          if (delay && delay > 0) {
            clearTimeout(this.get('customValidatorTimeout'));
            this.set('customValidatorTimeout', setTimeout(function () {
              customValidator.apply(formController, [value, status]);
            }, delay));
          }
          else {
            // no delay, just run
            customValidator.apply(formController, [value, status]);
          }
        }
        else {
          // call the super validation
          this._super(value, status);
        }
      }
    }
  }
});

EmberFormComponents.InputEmailComponent = EmberFormComponents.InputTextComponent.extend({
  placeholder: 'email address',
  label: 'Email Address',
  validatingMessage: 'checking email...',
  validate: function (value, status) {
    if (value && value.length > 0 && !value.match("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$")) {
      status(false, 'Please enter a valid email address');
    }
    else {
      this._super(value, status);
    }
  }
});

EmberFormComponents.InputPasswordComponent = Ember.Component.extend({
  value: '',
  score: 0,
  progressWidth: function () {
    return 'width: ' + this.get('score') + '%';
  }.property('score'),
  progressType: function () {
    var score = this.get('score');
    if (score >= 100) {
      return 'progress-bar progress-bar-success';
    }
    else if (score >= 75) {
      return 'progress-bar progress-bar-info';
    }
    else if (score >= 50) {
      return 'progress-bar progress-bar-warning';
    }
    else {
      return 'progress-bar progress-bar-danger';
    }
  }.property('score'),
  formController: null,

  registerFieldWithController: function() {
    //this.validateField();
    var validationFields = this.get('formController.validationFields');
    if (validationFields) {
      validationFields.pushObject(this);
    }
  }.on('didInsertElement'),

  showFieldValidation: null,
  showFieldValidationBinding: 'formController.showFieldValidation',
  validationFields: Ember.A(),
  isValid: function () {
    return !this.get('validationFields').any(function (field) {
      return !field.get('isValid');
    });
  }.property('validationFields.@each.isValid'),

  validatePassword: function(password, callback) {
    var minLength = 5;
    var score = this.generatePasswordScore(password, minLength);
    if (score > 100) { score = 100; }
    this.set('score', score);
    if (score === 0) {
      callback(false, 'Password should be at least ' + minLength + ' characters long');
    }
    else {
      callback(true, '');
    }
  },

  // for a given password returns a score with the follwing values:
  // 0       = too short
  // 1 - 49  = weak
  // 50 - 74 = average
  // 75 - 99 = strong
  // 100+    = very strong
  generatePasswordScore: function (password, minLength) {
    if (!password || password.length < minLength) {
      return 0;
    }
    else {
      var baseScore = 50;
      var num = { excess: 0, upper: 0, numbers: 0, symbols: 0 };
      var bonus = { excess: 3, upper: 4, numbers: 5, symbols: 5, combo: 0, flatLower: 0, flatNumber: 0 };

      for (var i = 0; i< password.length; i++) {
        if (password[i].match(/[A-Z]/g)) { num.upper++; }
        if (password[i].match(/[0-9]/g)) { num.numbers++; }
        if (password[i].match(/(.*[!,@,#,$,%,\^,&,*,?,_,~,:])/)) { num.symbols++; }
      }

      if (num.upper > 4) { num.upper = 4; }
      if (num.numbers > 4) { num.numbers = 4; }

      num.excess = password.length - (minLength * 2);

      if (num.upper && num.numbers && num.symbols) {
          bonus.combo = 25;
      }
      else if ((num.upper && num.numbers) || (num.upper && num.symbols) || (num.numbers && num.symbols)) {
          bonus.combo = 15;
      }

      if (password.match(/^[\sa-z]+$/)) {
          bonus.flatLower = -15;
      }

      if (password.match(/^[\s0-9]+$/)) {
          bonus.flatNumber = -35;
      }

      return baseScore + (num.excess * bonus.excess) +
        (num.upper * bonus.upper) + (num.numbers * bonus.numbers) +
        (num.symbols * bonus.symbols) + bonus.combo + bonus.flatLower + bonus.flatNumber;
    }
  }

});

EmberFormComponents.Form = Ember.Mixin.create({
  showFieldValidation: false,
  validationFields: Ember.A(),
  isFormValid: function () {
    return !this.get('validationFields').any(function (field) {
      return !field.get('isValid');
    });
  }.property('validationFields.@each.isValid')
});

EmberFormComponents.Register = Ember.Mixin.create({
  InputEmailComponent: EmberFormComponents.InputEmailComponent,
  InputPasswordComponent: EmberFormComponents.InputPasswordComponent,
  InputTextComponent: EmberFormComponents.InputTextComponent
});

this["Ember"] = this["Ember"] || {};
this["Ember"]["TEMPLATES"] = this["Ember"]["TEMPLATES"] || {};

this["Ember"]["TEMPLATES"]["components/input-email"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "input_text", options) : helperMissing.call(depth0, "partial", "input_text", options))));
  data.buffer.push("\r\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["components/input-password"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  hashContexts = {'type': depth0,'label': depth0,'placeholder': depth0,'value': depth0,'formController': depth0,'required': depth0,'customValidator': depth0};
  hashTypes = {'type': "STRING",'label': "STRING",'placeholder': "STRING",'value': "ID",'formController': "ID",'required': "ID",'customValidator': "ID"};
  options = {hash:{
    'type': ("password"),
    'label': ("Password"),
    'placeholder': ("password"),
    'value': ("view.value"),
    'formController': ("view"),
    'required': ("view.required"),
    'customValidator': ("view.validatePassword")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['input-text'] || depth0['input-text']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input-text", options))));
  data.buffer.push("\r\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "input_password_strength", options) : helperMissing.call(depth0, "partial", "input_password_strength", options))));
  data.buffer.push("\r\n");
  hashContexts = {'type': depth0,'label': depth0,'placeholder': depth0,'formController': depth0,'shouldEqual': depth0,'shouldEqualMessage': depth0};
  hashTypes = {'type': "STRING",'label': "STRING",'placeholder': "STRING",'formController': "ID",'shouldEqual': "ID",'shouldEqualMessage': "STRING"};
  options = {hash:{
    'type': ("password"),
    'label': ("Confirm Password"),
    'placeholder': ("password"),
    'formController': ("view"),
    'shouldEqual': ("view.value"),
    'shouldEqualMessage': ("Passwords do not match")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['input-text'] || depth0['input-text']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input-text", options))));
  data.buffer.push("\r\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["components/input-text"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "input_text", options) : helperMissing.call(depth0, "partial", "input_text", options))));
  data.buffer.push("\r\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["components/submit-button"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<button type=\"submit\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":btn formController.isFormValid:btn-primary:btn-default")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "yield", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</button>\r\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["input_password_strength"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"progress password-meter\">\r\n  <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("progressType")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" role=\"progressbar\"\r\n    ");
  hashContexts = {'aria-valuenow': depth0};
  hashTypes = {'aria-valuenow': "STRING"};
  options = {hash:{
    'aria-valuenow': ("score")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" aria-valuemin=\"0\"\r\n    aria-valuemax=\"100\" ");
  hashContexts = {'style': depth0};
  hashTypes = {'style': "STRING"};
  options = {hash:{
    'style': ("progressWidth")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div>\r\n</div>\r\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["input_text"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\r\n  <span class=\"help-block\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "message", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\r\n");
  return buffer;
  }

  data.buffer.push("<label class=\"control-label\" ");
  hashContexts = {'for': depth0};
  hashTypes = {'for': "STRING"};
  options = {hash:{
    'for': ("inputField.elementId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "label", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label>\r\n");
  hashContexts = {'typeBinding': depth0,'class': depth0,'placeholderBinding': depth0,'valueBinding': depth0,'viewName': depth0};
  hashTypes = {'typeBinding': "STRING",'class': "STRING",'placeholderBinding': "STRING",'valueBinding': "STRING",'viewName': "STRING"};
  options = {hash:{
    'typeBinding': ("type"),
    'class': ("form-control"),
    'placeholderBinding': ("placeholder"),
    'valueBinding': ("value"),
    'viewName': ("inputField")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\r\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "message", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\r\n");
  return buffer;
  
});