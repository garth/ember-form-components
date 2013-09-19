EmberFormComponents.Form = Ember.Mixin.create({
  showFieldValidation: false,
  validationFields: Ember.A(),
  isFormValid: function () {
    return !this.get('validationFields').any(function (field) {
      return !field.get('isValid');
    });
  }.property('validationFields.@each.isValid')
});
