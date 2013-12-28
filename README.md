No Longer Recommended
=====================

Ember Form Components demonstrates some interesting concepts, but ultimatly it is the wrong approach. Whilst components can (and should) be used for rendering fields with validation output, the logic for validation should not be bound to the UI. I'm leaving this repository here for reference purposes only.

Ember Form Components Library
=============================

The libray contains a number of [EmberJS](http://emberjs.com) components that you can use in your ember application to simplify form creation and validation.

Install
-------

### Bower

```
bower install --save ember-form-components
```

Then include `bower_components/ember-form-components/build/ember-form-components.js` or `bower_components/ember-form-components/build/ember-form-components.min.js` in your app.

### Manual

Copy `build/ember-form-components.js` and/or `build/ember-form-components.min.js` to your vendor js scripts folder and reference in your app.

Usage
-----

To include the library, first include `ember-form-components.min.js` which can be found in the build folder. Then add the EmberFormComponents mixin into your app using the following syntax:

```javascript
App.App = Ember.Application.createWithMixins(EmberFormComponents.Register, {
  //regular app code here...
});
```

Then when you create a form controller, add the `EmberFormComponents.Form` mixin

```javascript
App.MyFormController = Ember.Controller.extend(EmberFormComponents.Form, {
  //regular controller code here...
});
```

As well as `EmberFormComponents` the library also defines `EmberFC` as a shortcut to EmberFormComponents.

This library currently contains the following components:

* `{{input-text}}` - Supports required, regex validator, shouldEqual & custom validator (with async support)
* `{{input-email}}` - Supports required & custom validator (with async support)
* `{{input-password}}` - Supports required and includes confirm password + strength meter
* `{{#submit-button}}submit{{/submit-button}}` - When form is valid, the submit button class will be set to `btn-primary`.

Each input control consists of a label, input and validation message, as well as classes for current validity status.

The templates included by default support Bootstrap 3.0 markup but can be customized by implementing the following partials in your app:

* `input_text.hbs`
* `input_password_strength.hbs`

See the app/templates folder for samples.


You'll need to remove the default templates with the following code to stop ember from complaining:

```javascript
// best to place these lines just before your app
// declaration if you want to supply your own templates
delete Ember.TEMPLATES['input_password_strength'];
delete Ember.TEMPLATES['input_text'];
```

For a working samples see `test/index.html` (with bootstrap) or `test/nobootrap.html` (without).

### {{input-text}}

properties:

* `autofocus` (default: `false`) - only 1 field should have this value set to true
* `label` (default: `""`) - label to show for the <input>
* `value` (default: `""`) - value binding
* `type` (default: `"text"`)
* `placeholder` (default: `""`) - placeholder text for the <input>
* `required` (default: `false`) - when true the user must enter something into the <input>
* `showMessages` (default: `true`) - set to false to never show messages
* `showErrorOnFocus` (defualt: `false`) - when true shows errors even whilst editing
* `shouldEqual` - when set `value` must equal the given value (or property)
* `shouldEqualMessage` - message to show when `shouldEqual` does not match `value`
* `regex` - regex string to validate the `value`
* `regexMessage` - message to show when the `regex` does not match `value`
* `customValidator` (`function (value, callback)`) - supply a method to do custom validation
* `customValidatorDelay` (default: 0) - ms of inactivity before running customValidator, useful when you don't want to make ajax calls on every key press
* `validatingMessage` (default: `"checking..."`) - shown during async validation operations
* `isValid` (readonly) - current validation status
* `formController` (should be set to `controller`) - This allows each component to register with the controller so that the controller can track the current status of each validation component

The `customValidator` takes 2 arguments, the field value and a callback function. The callback expects 2 arguments success (bool) and status message and an optional 3rd argument (bool) which when set will force the message to be displayed immediatly (even if the field has focus). If the callback is not executed immediately then the component will show the `validatingMessage` until callback is invoked.

```javascript
var validateEmail = function (email, callback) {
  // simulate ajax call
  setTimeout(function () {
    callback(true, 'Email address available');
  }, 1000);
};
```

### {{input-email}}

Inherits from `{{input-text}}`

properties:

* `label` (default `"Email Address"`)
* `placeholder` (default `"email address"`)
* `validatingMessage` (default `"checking email..."`)

### {{input-password}}

* `label` (default: `"Password"`)
* `value` (default: `""`)
* `type` (default: `"password"`)
* `placeholder` (default: `"password"`)
* `required` (default: `false`)
* `score` (readonly, 0-100) - when 0 this means that the min password length has not been met, full strength is only at 100 - this is not a scientificly proven algorithm, if you don't like it you can substitue your own
* `generatePasswordScore` (`function (password)`) - override the default function to use your own algorithm, must return number between 0 and 100)
* `isValid` (readonly)

### The Form Controller

When the `EmberFormComponents.Form` mixin is applied to the controller the following fields are added:

* `isFormValid` (readonly) - true when all validation components are `isValid`
* `showFieldValidation` (default: `false`) - set to `true` to force all fields to show their current validation status even before the user interacts with the field.

Example
-------

Application definition and sample controller

```javascript
App = Ember.Application.createWithMixins(EmberFormComponents.Register, {
});

App.IndexController = Ember.Controller.extend(EmberFormComponents.Form, {
  name: '',
  email: '',
  password: '',
  validateEmail: function (email, callback) {
    // Insert AJAX call here:
    setTimeout(function () {
      callback(true, 'Email address available');
    }, 1000);
  },
  actions: {
    signup: function() {
      if (this.get('isFormValid')) {
        // all is good, time to move along
      }
      else {
        // show the user what they need to fix
        this.set('showFieldValidation', true);
      }
    }
  }
});
```

Sample handlebars template

```handlebars
<form role="form" {{action "signup" on="submit"}}>
  {{input-text
    label="Name"
    placeholder="name"
    value=name
    formController=controller
    required=true
    autofocus=true}}
  {{input-email
    value=email
    formController=controller
    required=true
    customValidator=validateEmail}}
  {{input-password value=password
    formController=controller
    required=true}}
  {{#submit-button formController=controller}}Save{{/submit-button}}
</form>
```

Working Demo
------------

http://jsbin.com/aRaPeTA/1

Contributing
------------

1. Fork the repository to your GitHub account
2. Clone the repistory to your computer
3. Install nodejs
4. Install grunt `npm install -g grunt-cli`
5. From the root exec `npm install`
6. Make your changes
7. Build the library `grunt`
8. Test your changes
9. Commit and push your changes to GitHub
10. Send a pull request

Credits
-------

This library is built using the [Ember Component Library Template](https://github.com/moonlight-labs/ember-component-library-template) from [Moonlight Labs](http://moonlight-labs.com/).
