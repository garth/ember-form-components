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
          customValidator.apply(this.get('formController'), [value, status]);
        }
        else {
          // call the super validation
          this._super(value, status);
        }
      }
    }
  }
});
