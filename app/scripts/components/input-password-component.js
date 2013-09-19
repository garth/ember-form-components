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
