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
    if (this.get('validating')) {
      return this.get('validatingMessage');
    }
    else if ((!this.get('focused') || this.get('isValid')) &&
      (this.get('showFieldValidation') || this.get('formController.showFieldValidation'))) {
      return this.get('statusMessage');
    }
    else {
      return '';
    }
  }.property('isValid', 'showFieldValidation', 'formController.showFieldValidation', 'focused', 'validating'),
  showFieldValidation: false,
  formController: null,
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
    this.validate(value, function (isValid, message) {
      // Make sure that the value hasn't changed since async validation
      if (value === self.get('value')) {
        self.set('statusMessage', message);
        self.set('isValid', isValid);
        self.set('validating', false);
      }
    });
  }.observes('value'),

  // base validation function, if we get this far then the field is valid
  validate: function (value, status) {
    status(true, '');
  }
});
