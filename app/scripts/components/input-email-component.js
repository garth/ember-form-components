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
